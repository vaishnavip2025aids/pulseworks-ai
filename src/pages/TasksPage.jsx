import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TaskCard, { STATUS_LABEL } from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
import { useTasks } from "../context/TasksContext";
import { STATUSES } from "../schemas/taskSchema";
import useAsyncAction from "../hooks/useAsyncAction";
import { fetchSampleTasks } from "../services/externalTasksApi";

export default function TasksPage() {
  const { tasks, search, setSearch, addTask, advanceTask, removeTask, importTasks } = useTasks();
  const [params, setParams] = useSearchParams();
  const formOpen = params.get("new") === "1";
  const [notice, setNotice] = useState("");
  const imp = useAsyncAction();

  const closeForm = () => setParams({}, { replace: true });
  const openForm = () => setParams({ new: "1" });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter((t) => [t.title, t.description, t.assignee, ...t.tags].join(" ").toLowerCase().includes(q));
  }, [tasks, search]);

  const doImport = async () => {
    setNotice("");
    const result = await imp.run((signal) => fetchSampleTasks({ signal }));
    if (result) {
      const added = importTasks(result);
      setNotice(added ? `Imported ${added} new task${added === 1 ? "" : "s"}.` : "Everything from the service is already imported.");
    }
  };

  return (
    <>
      <div className="main__head">
        <h1>Tasks</h1>
        <p>{filtered.length} shown of {tasks.length}</p>
        <div className="main__tools">
          <button className="btn btn--ghost" onClick={doImport} disabled={imp.loading}>
            {imp.loading ? "Importing..." : "Import sample tasks"}
          </button>
          <button className="btn btn--primary" onClick={openForm}>New task</button>
        </div>
      </div>

      <div aria-live="polite">
        {imp.status === "error" && (
          <div className="alert alert--error" role="alert">
            <span>{imp.error}</span>
            <button className="btn btn--ghost" onClick={doImport}>Retry</button>
          </div>
        )}
        {notice && imp.status === "success" && <div className="alert alert--ok">{notice}</div>}
      </div>

      {formOpen && (
        <section className="panel" aria-label="New task">
          <TaskForm onCreate={(d) => { addTask(d); closeForm(); }} onCancel={closeForm} />
        </section>
      )}

      {tasks.length === 0 ? (
        <div className="empty">
          <p>No tasks yet.</p>
          <button className="btn btn--primary" onClick={openForm}>Create your first task</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <p>No tasks match &ldquo;{search}&rdquo;. Try a different name or tag.</p>
          <button className="btn btn--ghost" onClick={() => setSearch("")}>Clear search</button>
        </div>
      ) : (
        <div className="board">
          {STATUSES.map((status) => {
            const col = filtered.filter((t) => t.status === status);
            return (
              <section key={status} className="col" aria-label={STATUS_LABEL[status]}>
                <h2 className="col__title">{STATUS_LABEL[status]} <span>{col.length}</span></h2>
                {col.map((t) => (
                  <TaskCard key={t.id} task={t} onAdvance={advanceTask} onDelete={removeTask} />
                ))}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
