import { env } from "../config/env";

// Mock feed used when VITE_STATUS_ENDPOINT is empty.
const MOCK_FEED = [
  { id: "ok", level: "info", message: "All systems operational." },
  { id: "maint", level: "warning", message: "Scheduled maintenance Saturday 02:00-03:00 UTC. File uploads will be paused." },
  { id: "rag", level: "info", message: "Document AI indexing is rolling out to your workspace this week." },
  { id: "degraded", level: "critical", message: "Real-time sync is degraded. Changes may take longer to appear." },
];

export async function fetchSystemMessages() {
  if (!env.statusEndpoint) {
    await new Promise((r) => setTimeout(r, 150));
    return MOCK_FEED;
  }
  const res = await fetch(env.statusEndpoint, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Status feed responded with ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("Status feed must return an array");
  return data;
}
