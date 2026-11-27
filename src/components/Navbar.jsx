import { useNavigate, useLocation } from "react-router-dom";
import { useTasks } from "../context/TasksContext";
import { useSettings } from "../context/SettingsContext";

export default function Navbar({ onMenuClick }) {
  const { search, setSearch } = useTasks();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const onSearch = (value) => {
    setSearch(value);
    if (pathname !== "/tasks") navigate("/tasks");
  };

  return (
    <header className="navbar">
      <button className="icon-btn navbar__menu" onClick={onMenuClick} aria-label="Open navigation">
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      <div className="brand">
        <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
          <rect width="32" height="32" rx="7" fill="#12203A" />
          <path d="M4 17h6l3-8 5 15 3-7h7" fill="none" stroke="#2EE6C5" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>{settings.workspaceName}</span>
      </div>

      <label className="search">
        <span className="sr-only">Search tasks</span>
        <input type="search" placeholder="Search tasks, people, tags" value={search} onChange={(e) => onSearch(e.target.value)} />
      </label>

      <button className="btn btn--primary navbar__new" onClick={() => navigate("/tasks?new=1")}>
        New task
      </button>

      <div className="avatar" title="Signed in as Meera Iyer" aria-label="Account: Meera Iyer">MI</div>
    </header>
  );
}
