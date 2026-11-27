import { z } from "zod";
import { env } from "../config/env";
import { getJson } from "./httpClient";

// Only the fields we use are declared; unknown fields are stripped by Zod.
const remoteTodoSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(500),
  completed: z.boolean(),
});
const remoteTodosSchema = z.array(remoteTodoSchema).max(50);

const iso = (offsetDays) => {
  const t = new Date();
  t.setDate(t.getDate() + offsetDays);
  const p = (x) => String(x).padStart(2, "0");
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`;
};

// Map untrusted remote data into our own task shape. React escapes text on render,
// and we also trim/limit lengths here so bad data can't break the layout.
const toTask = (r) => {
  const title = r.title.trim().replace(/\s+/g, " ");
  return {
    id: `ext-${r.id}`,
    externalId: r.id,
    title: title.length > 80 ? `${title.slice(0, 77)}...` : title,
    description: "",
    assignee: "Imported",
    priority: "medium",
    status: r.completed ? "done" : "todo",
    dueDate: iso(7),
    tags: ["imported"],
  };
};

export async function fetchSampleTasks({ signal, limit = 8 } = {}) {
  const n = Math.min(Math.max(Math.trunc(limit), 1), 20);
  const todos = await getJson(`${env.externalApiUrl}/todos?_limit=${n}`, {
    schema: remoteTodosSchema,
    timeoutMs: env.apiTimeoutMs,
    signal,
  });
  return todos.map(toTask);
}

// Lightweight reachability check used by Settings.
export async function pingExternalApi({ signal } = {}) {
  const start = performance.now();
  await getJson(`${env.externalApiUrl}/todos/1`, { schema: remoteTodoSchema, timeoutMs: env.apiTimeoutMs, signal });
  return Math.round(performance.now() - start);
}
