import { useEffect, useState } from "react";
import { env } from "../config/env";
import { fetchSystemMessages } from "../services/systemStatus";

const LEVEL_LABEL = { info: "Notice", warning: "Heads up", critical: "Service issue" };
const DISMISS_KEY = "pw_banner_dismissed";

function readDismissed() {
  try {
    return JSON.parse(sessionStorage.getItem(DISMISS_KEY) || "[]");
  } catch {
    return [];
  }
}

export default function SystemBanner() {
  const [messages, setMessages] = useState([]);
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(readDismissed);
  const [error, setError] = useState(false);

  // Load the feed now and refresh it every minute.
  useEffect(() => {
    let alive = true;
    const load = () =>
      fetchSystemMessages()
        .then((m) => alive && (setMessages(m), setError(false)))
        .catch(() => alive && setError(true));
    load();
    const id = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const visible = messages.filter((m) => !dismissed.includes(m.id));

  // Rotate through visible messages; honour reduced-motion by not auto-rotating.
  useEffect(() => {
    if (visible.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % visible.length), env.statusPollMs);
    return () => clearInterval(id);
  }, [visible.length]);

  const current = visible[index % Math.max(visible.length, 1)];

  const dismiss = () => {
    const next = [...dismissed, current.id];
    setDismissed(next);
    setIndex(0);
    try {
      sessionStorage.setItem(DISMISS_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable: dismissal lasts for this render only */
    }
  };

  if (error && !current) {
    return (
      <div className="banner banner--warning" role="status">
        <span className="banner__env">{env.appEnv}</span>
        <p className="banner__msg">System status is unavailable right now. Retrying shortly.</p>
      </div>
    );
  }
  if (!current) return null;

  const role = current.level === "critical" ? "alert" : "status";

  return (
    <div className={`banner banner--${current.level}`} role={role} aria-live="polite">
      <span className="banner__env">{env.appEnv}</span>
      <p className="banner__msg" key={current.id}>
        <strong>{LEVEL_LABEL[current.level] || "Notice"}:</strong> {current.message}
      </p>
      {visible.length > 1 && (
        <span className="banner__count">
          {(index % visible.length) + 1} of {visible.length}
        </span>
      )}
      <button className="banner__close" onClick={dismiss} aria-label="Dismiss this message">
        &times;
      </button>
    </div>
  );
}
