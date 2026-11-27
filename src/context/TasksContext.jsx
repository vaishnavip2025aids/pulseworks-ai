import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { seedTasks } from "../data/seedTasks";
import { STATUSES } from "../schemas/taskSchema";

const TasksContext = createContext(null);

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState(seedTasks);
  const [search, setSearch] = useState("");

  const addTask = useCallback((data) => setTasks((p) => [{ id: crypto.randomUUID(), ...data }, ...p]), []);
  const removeTask = useCallback((id) => setTasks((p) => p.filter((t) => t.id !== id)), []);
  const advanceTask = useCallback(
    (id) =>
      setTasks((p) =>
        p.map((t) =>
          t.id === id ? { ...t, status: STATUSES[Math.min(STATUSES.indexOf(t.status) + 1, STATUSES.length - 1)] } : t
        )
      ),
    []
  );
  // Adds only tasks whose externalId is not already present; returns how many were new.
  const importTasks = useCallback((incoming) => {
    let added = 0;
    setTasks((p) => {
      const have = new Set(p.map((t) => t.externalId).filter(Boolean));
      const fresh = incoming.filter((t) => !have.has(t.externalId));
      added = fresh.length;
      return [...fresh, ...p];
    });
    return added;
  }, []);

  const value = useMemo(
    () => ({ tasks, search, setSearch, addTask, removeTask, advanceTask, importTasks }),
    [tasks, search, addTask, removeTask, advanceTask, importTasks]
  );
  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export const useTasks = () => {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used inside <TasksProvider>");
  return ctx;
};
