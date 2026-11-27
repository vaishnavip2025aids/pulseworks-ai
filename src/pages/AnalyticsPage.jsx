import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTasks } from "../context/TasksContext";
import { PRIORITIES, STATUSES } from "../schemas/taskSchema";
import { STATUS_LABEL } from "../components/TaskCard";

const cap = (s) => s[0].toUpperCase() + s.slice(1);

function Bars({ title, rows, total }) {
  return (
    <section className="panel panel--wide" aria-label={title}>
      <h2>{title}</h2>
      <ul className="bars">
        {rows.map((r) => (
          <li key={r.key}>
            <span className="bars__label">{r.label}</span>
            <span className="bars__track" role="img" aria-label={`${r.label}: ${r.count} of ${total}`}>
              <span className={`bars__fill bars__fill--${r.key}`} style={{ width: total ? `${(r.count / total) * 100}%` : 0 }} />
            </span>
            <span className="bars__n">{r.count}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function AnalyticsPage() {
  const { tasks } = useTasks();

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const open = total - done;
    const now = new Date();
    const p = (x) => String(x).padStart(2, "0");
    const todayISO = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
    const overdue = tasks.filter((t) => t.status !== "done" && t.dueDate < todayISO).length;
    const byStatus = STATUSES.map((s) => ({ key: s, label: STATUS_LABEL[s], count: tasks.filter((t) => t.status === s).length }));
    const byPriority = PRIORITIES.map((s) => ({ key: s, label: cap(s), count: tasks.filter((t) => t.priority === s).length }));
    const load = {};
    tasks.filter((t) => t.status !== "done").forEach((t) => { load[t.assignee] = (load[t.assignee] || 0) + 1; });
    const people = Object.entries(load).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { total, done, open, overdue, rate: total ? Math.round((done / total) * 100) : 0, byStatus, byPriority, people };
  }, [tasks]);

  if (stats.total === 0) {
    return (
      <>
        <div className="main__head"><h1>Analytics</h1></div>
        <div className="empty">
          <p>There is nothing to analyse yet. Create or import tasks to see trends.</p>
          <Link className="btn btn--primary btn--link" to="/tasks?new=1">Create a task</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="main__head"><h1>Analytics</h1><p>Based on {stats.total} tasks</p></div>

      <dl className="kpis">
        <div><dt>Completion rate</dt><dd>{stats.rate}%</dd></div>
        <div><dt>Open tasks</dt><dd>{stats.open}</dd></div>
        <div><dt>Completed</dt><dd>{stats.done}</dd></div>
        <div className={stats.overdue ? "kpis__bad" : ""}><dt>Overdue</dt><dd>{stats.overdue}</dd></div>
      </dl>

      <div className="grid2">
        <Bars title="Tasks by status" rows={stats.byStatus} total={stats.total} />
        <Bars title="Tasks by priority" rows={stats.byPriority} total={stats.total} />
      </div>

      <section className="panel panel--wide">
        <h2>Open work by person</h2>
        {stats.people.length === 0 ? (
          <p className="muted">Everything is done. Nice.</p>
        ) : (
          <ol className="people">
            {stats.people.map(([name, n]) => (
              <li key={name}><span>{name}</span><strong>{n} open</strong></li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
