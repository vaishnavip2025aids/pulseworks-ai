export const STATUS_LABEL = { todo: "To do", in_progress: "In progress", review: "In review", done: "Done" };
const PRIORITY_LABEL = { low: "Low", medium: "Medium", high: "High", urgent: "Urgent" };

function formatDue(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("");
}

export default function TaskCard({ task, onAdvance, onDelete }) {
  return (
    <article className={`task task--${task.priority} ${task.status === "done" ? "task--done" : ""}`}>
      <div className="task__head">
        <span className={`pill pill--${task.priority}`}>{PRIORITY_LABEL[task.priority]}</span>
        <span className="task__status">{STATUS_LABEL[task.status]}</span>
      </div>

      <h3 className="task__title">{task.title}</h3>
      {task.description && <p className="task__desc">{task.description}</p>}

      {task.tags.length > 0 && (
        <ul className="tags">
          {task.tags.map((t) => (
            <li key={t}>#{t}</li>
          ))}
        </ul>
      )}

      <footer className="task__foot">
        <span className="task__who">
          <span className="avatar avatar--sm" aria-hidden="true">{initials(task.assignee)}</span>
          {task.assignee}
        </span>
        <time dateTime={task.dueDate}>Due {formatDue(task.dueDate)}</time>
      </footer>

      <div className="task__actions">
        {task.status !== "done" && (
          <button className="btn btn--ghost" onClick={() => onAdvance(task.id)}>
            Move forward
          </button>
        )}
        <button className="btn btn--ghost btn--danger" onClick={() => onDelete(task.id)}>
          Delete
        </button>
      </div>
    </article>
  );
}
