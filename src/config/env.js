// Single source of truth for environment configuration.
const raw = import.meta.env;

const toInt = (value, fallback) => {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export const env = Object.freeze({
  appName: raw.VITE_APP_NAME || "PulseWorks AI",
  appEnv: raw.VITE_APP_ENV || "development",
  apiBaseUrl: raw.VITE_API_BASE_URL || "",
  statusEndpoint: raw.VITE_STATUS_ENDPOINT || "",
  statusPollMs: toInt(raw.VITE_STATUS_POLL_MS, 8000),
  externalApiUrl: (raw.VITE_EXTERNAL_API_URL || "https://jsonplaceholder.typicode.com").replace(/\/+$/, ""),
  apiTimeoutMs: toInt(raw.VITE_API_TIMEOUT_MS, 8000),
});
