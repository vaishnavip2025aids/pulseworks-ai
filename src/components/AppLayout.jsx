import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SystemBanner from "./SystemBanner";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useTasks } from "../context/TasksContext";
import { useSettings } from "../context/SettingsContext";

export default function AppLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const { tasks } = useTasks();
  const { settings } = useSettings();
  const location = useLocation();

  // Close the mobile drawer and reset scroll whenever the page changes.
  useEffect(() => {
    setNavOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const titles = { "/tasks": "Tasks", "/analytics": "Analytics", "/settings": "Settings" };
    document.title = `${titles[location.pathname] || "Not found"} - ${settings.workspaceName}`;
  }, [location.pathname, settings.workspaceName]);

  const soon = new Date();
  soon.setDate(soon.getDate() + 3);
  const p = (x) => String(x).padStart(2, "0");
  const soonISO = `${soon.getFullYear()}-${p(soon.getMonth() + 1)}-${p(soon.getDate())}`;
  const counts = {
    open: tasks.filter((t) => t.status !== "done").length,
    dueSoon: tasks.filter((t) => t.status !== "done" && t.dueDate <= soonISO).length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  return (
    <div className="shell" data-compact={settings.compact}>
      <a className="skip" href="#main">Skip to content</a>
      <SystemBanner />
      <Navbar onMenuClick={() => setNavOpen(true)} />
      <div className="shell__body">
        <Sidebar open={navOpen} onClose={() => setNavOpen(false)} counts={counts} />
        <main className="main" id="main" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
