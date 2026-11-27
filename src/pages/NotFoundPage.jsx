import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="empty">
      <h1>Page not found</h1>
      <p>That address does not exist in this workspace.</p>
      <Link className="btn btn--primary btn--link" to="/tasks">Back to tasks</Link>
    </div>
  );
}
