import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, friendlyMessage } from "../services/httpClient";

// Runs an async function with loading/error state. Cancels in-flight work on unmount or re-run,
// and ignores stale results, so a slow response can never overwrite a newer one.
export default function useAsyncAction() {
  const [state, setState] = useState({ status: "idle", error: "", data: null });
  const controllerRef = useRef(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const run = useCallback(async (fn) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setState({ status: "loading", error: "", data: null });
    try {
      const data = await fn(controller.signal);
      if (controller.signal.aborted) return null;
      setState({ status: "success", error: "", data });
      return data;
    } catch (e) {
      if (controller.signal.aborted || (e instanceof ApiError && e.kind === "aborted")) return null;
      setState({ status: "error", error: friendlyMessage(e), data: null });
      return null;
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle", error: "", data: null }), []);
  return { ...state, run, reset, loading: state.status === "loading" };
}
