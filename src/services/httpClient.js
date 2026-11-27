// Hardened GET-JSON client for third-party APIs.
//  - https only (http allowed for localhost)     - no cookies / credentials sent
//  - hard timeout + caller-cancellable           - response size cap
//  - content-type + JSON parse checks            - Zod validation of every payload
//  - typed errors with user-safe messages        - no raw server text is ever shown

export class ApiError extends Error {
  constructor(kind, message, status) {
    super(message);
    this.name = "ApiError";
    this.kind = kind; // timeout | network | http | invalid_response | blocked | aborted
    this.status = status;
  }
}

const MAX_BYTES = 1_000_000;

export const friendlyMessage = (err) => {
  if (!(err instanceof ApiError)) return "Something went wrong. Please try again.";
  switch (err.kind) {
    case "timeout": return "The service took too long to respond. Check your connection and retry.";
    case "network": return "Could not reach the service. Check your connection and retry.";
    case "http":
      if (err.status === 429) return "Too many requests. Wait a moment and retry.";
      if (err.status >= 500) return "The service is having problems. Try again later.";
      return `The service rejected the request (${err.status}).`;
    case "invalid_response": return "The service returned data in an unexpected format, so it was not used.";
    case "blocked": return "This request was blocked because the API address is not secure.";
    case "aborted": return "Request cancelled.";
    default: return "Something went wrong. Please try again.";
  }
};

function assertSafeUrl(url) {
  let u;
  try { u = new URL(url); } catch { throw new ApiError("blocked", "Invalid URL"); }
  const local = u.hostname === "localhost" || u.hostname === "127.0.0.1";
  if (u.protocol !== "https:" && !(u.protocol === "http:" && local)) {
    throw new ApiError("blocked", "Insecure URL");
  }
  if (u.username || u.password) throw new ApiError("blocked", "Credentials in URL");
  return u;
}

export async function getJson(url, { schema, timeoutMs = 8000, signal, fetchImpl } = {}) {
  const u = assertSafeUrl(url);
  const doFetch = fetchImpl || globalThis.fetch;

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", onAbort, { once: true });
  }

  try {
    let res;
    try {
      res = await doFetch(u.toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "omit",
        referrerPolicy: "no-referrer",
        redirect: "follow",
        signal: controller.signal,
      });
    } catch (e) {
      if (timedOut) throw new ApiError("timeout", "Timed out");
      if (e?.name === "AbortError") throw new ApiError("aborted", "Aborted");
      throw new ApiError("network", "Network failure");
    }

    if (!res.ok) throw new ApiError("http", `HTTP ${res.status}`, res.status);

    const type = res.headers.get("content-type") || "";
    if (!type.toLowerCase().includes("json")) throw new ApiError("invalid_response", "Not JSON");

    const declared = Number(res.headers.get("content-length"));
    if (declared > MAX_BYTES) throw new ApiError("invalid_response", "Too large");

    let text;
    try { text = await res.text(); } catch {
      if (timedOut) throw new ApiError("timeout", "Timed out");
      throw new ApiError("network", "Body read failed");
    }
    if (text.length > MAX_BYTES) throw new ApiError("invalid_response", "Too large");

    let json;
    try { json = JSON.parse(text); } catch { throw new ApiError("invalid_response", "Bad JSON"); }

    if (!schema) return json;
    const parsed = schema.safeParse(json);
    if (!parsed.success) throw new ApiError("invalid_response", "Schema mismatch");
    return parsed.data;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}
