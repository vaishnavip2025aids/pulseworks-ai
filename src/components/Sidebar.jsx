import { NavLink } from "react-router-dom";

const PAGES = [
  { to: "/tasks", label: "Tasks", icon: "M4 6h12M4 10h12M4 14h8" },
  { to: "/analytics", label: "Analytics", icon: "M4 16V9M10 16V4M16 16v-5" },
  { to: "/settings", label: "Settings", icon: "M10 7a3 3 0 100 6 3 3 0 000-6zM10 2v2M10 16v2M2 10h2M16 10h2M4.5 4.5l1.4 1.4M14.1 14.1l1.4 1.4M4.5 15.5l1.4-1.4M14.1 5.9l1.4-1.4" },
];
const SOON = [
  { label: "Files", note: "Day 6", icon: "M5 3h6l4 4v10H5z" },
  { label: "Document AI", note: "Day 14", icon: "M10 2l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" },
];

const Icon = ({ d }) => (
  <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
    <path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Sidebar({ open, onClose, counts }) {
  return (
    <>
      <div className={`scrim ${open ? "scrim--on" : ""}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar ${open ? "sidebar--open" : ""}`} aria-label="Primary">
        <nav>
          <ul className="nav">
            {PAGES.map((p) => (
              <li key={p.to}>
                <NavLink to={p.to} className={({ isActive }) => `nav__item ${isActive ? "nav__item--active" : ""}`}>
                  <Icon d={p.icon} />
                  <span>{p.label}</span>
                </NavLink>
              </li>
            ))}
            {SOON.map((p) => (
              <li key={p.label}>
                <button className="nav__item" disabled>
                  <Icon d={p.icon} />
                  <span>{p.label}</span>
                  <small>{p.note}</small>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar__summary">
          <h2>Workload</h2>
          <dl>
            <div><dt>Open</dt><dd>{counts.open}</dd></div>
            <div><dt>Due soon</dt><dd>{counts.dueSoon}</dd></div>
            <div><dt>Done</dt><dd>{counts.done}</dd></div>
          </dl>
        </div>
      </aside>
    </>
  );
}
