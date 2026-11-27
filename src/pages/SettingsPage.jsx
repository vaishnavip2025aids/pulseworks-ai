import { useState } from "react";
import { useSettings, settingsSchema } from "../context/SettingsContext";
import { env } from "../config/env";
import useAsyncAction from "../hooks/useAsyncAction";
import { pingExternalApi } from "../services/externalTasksApi";

export default function SettingsPage() {
  const { settings, save, defaults } = useSettings();
  const [values, setValues] = useState(settings);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const check = useAsyncAction();

  const submit = (e) => {
    e.preventDefault();
    const r = settingsSchema.safeParse(values);
    if (!r.success) {
      setError(r.error.issues[0].message);
      setSaved(false);
      return;
    }
    setError("");
    save(r.data);
    setValues(r.data);
    setSaved(true);
  };

  const host = (() => { try { return new URL(env.externalApiUrl).host; } catch { return "invalid URL"; } })();

  return (
    <>
      <div className="main__head"><h1>Settings</h1></div>

      <form className="panel form" onSubmit={submit} noValidate aria-labelledby="ws-h">
        <h2 id="ws-h">Workspace</h2>
        <div className="field">
          <label htmlFor="ws-name">Workspace name</label>
          <input
            id="ws-name" type="text" value={values.workspaceName}
            aria-invalid={error ? "true" : "false"} aria-describedby={error ? "ws-err" : undefined}
            onChange={(e) => { setValues({ ...values, workspaceName: e.target.value }); setSaved(false); }}
          />
          {error && <p className="field__err" id="ws-err" role="alert">{error}</p>}
        </div>
        <label className="check">
          <input type="checkbox" checked={values.compact} onChange={(e) => { setValues({ ...values, compact: e.target.checked }); setSaved(false); }} />
          <span>Use compact task cards</span>
        </label>
        <div className="form__actions">
          {saved && <span className="saved" role="status">Settings saved</span>}
          <button type="button" className="btn btn--ghost" onClick={() => { setValues(defaults); setError(""); setSaved(false); }}>Reset to defaults</button>
          <button type="submit" className="btn btn--primary">Save settings</button>
        </div>
      </form>

      <section className="panel" aria-labelledby="conn-h">
        <h2 id="conn-h">External API connection</h2>
        <p className="muted">Tasks can be imported from <strong>{host}</strong>. Requests are read-only, send no cookies and time out after {env.apiTimeoutMs / 1000}s.</p>
        <div className="conn">
          <button className="btn btn--ghost" onClick={() => check.run((signal) => pingExternalApi({ signal }))} disabled={check.loading}>
            {check.loading ? "Checking..." : "Test connection"}
          </button>
          <span aria-live="polite">
            {check.status === "success" && <span className="saved">Connected ({check.data} ms)</span>}
            {check.status === "error" && <span className="field__err">{check.error}</span>}
          </span>
        </div>
        <dl className="envlist">
          <div><dt>Environment</dt><dd>{env.appEnv}</dd></div>
          <div><dt>Banner refresh</dt><dd>{env.statusPollMs / 1000}s</dd></div>
        </dl>
      </section>
    </>
  );
}
