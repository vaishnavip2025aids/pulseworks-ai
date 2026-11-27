import { useId, useState } from "react";
import { emptyTaskForm, validateTask, PRIORITIES, STATUSES } from "../schemas/taskSchema";
import { STATUS_LABEL } from "./TaskCard";

const cap = (s) => s[0].toUpperCase() + s.slice(1);

export default function TaskForm({ onCreate, onCancel }) {
  const uid = useId();
  const [values, setValues] = useState(emptyTaskForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const id = (name) => `${uid}-${name}`;

  const revalidate = (next, nextTouched) => {
    const { errors: all } = validateTask(next);
    const shown = {};
    for (const k of Object.keys(all)) if (nextTouched[k]) shown[k] = all[k];
    setErrors(shown);
  };

  const change = (e) => {
    const next = { ...values, [e.target.name]: e.target.value };
    setValues(next);
    if (touched[e.target.name]) revalidate(next, touched);
  };

  const blur = (e) => {
    const nextTouched = { ...touched, [e.target.name]: true };
    setTouched(nextTouched);
    revalidate(values, nextTouched);
  };

  const submit = (e) => {
    e.preventDefault();
    const allTouched = Object.fromEntries(Object.keys(emptyTaskForm).map((k) => [k, true]));
    setTouched(allTouched);
    const { data, errors: all } = validateTask(values);
    if (!data) {
      setErrors(all);
      const first = Object.keys(all)[0];
      document.getElementById(id(first))?.focus();
      return;
    }
    onCreate(data);
    setValues(emptyTaskForm);
    setErrors({});
    setTouched({});
  };

  const field = (name) => ({
    id: id(name),
    name,
    value: values[name],
    onChange: change,
    onBlur: blur,
    "aria-invalid": errors[name] ? "true" : "false",
    "aria-describedby": errors[name] ? `${id(name)}-err` : undefined,
  });

  const Err = ({ name }) =>
    errors[name] ? (
      <p className="field__err" id={`${id(name)}-err`} role="alert">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form className="form" onSubmit={submit} noValidate aria-labelledby={id("title-h")}>
      <h2 id={id("title-h")}>Create a task</h2>

      <div className="field">
        <label htmlFor={id("title")}>Title</label>
        <input type="text" maxLength={120} autoComplete="off" {...field("title")} />
        <Err name="title" />
      </div>

      <div className="field">
        <label htmlFor={id("description")}>
          Description <span className="field__opt">optional</span>
        </label>
        <textarea rows={3} {...field("description")} />
        <p className="field__hint">{values.description.trim().length}/500</p>
        <Err name="description" />
      </div>

      <div className="form__row">
        <div className="field">
          <label htmlFor={id("assignee")}>Assignee</label>
          <input type="text" autoComplete="off" {...field("assignee")} />
          <Err name="assignee" />
        </div>
        <div className="field">
          <label htmlFor={id("dueDate")}>Due date</label>
          <input type="date" {...field("dueDate")} />
          <Err name="dueDate" />
        </div>
      </div>

      <div className="form__row">
        <div className="field">
          <label htmlFor={id("priority")}>Priority</label>
          <select {...field("priority")}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{cap(p)}</option>
            ))}
          </select>
          <Err name="priority" />
        </div>
        <div className="field">
          <label htmlFor={id("status")}>Status</label>
          <select {...field("status")}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
          <Err name="status" />
        </div>
      </div>

      <div className="field">
        <label htmlFor={id("tags")}>
          Tags <span className="field__opt">comma separated, up to 5</span>
        </label>
        <input type="text" autoComplete="off" {...field("tags")} />
        <Err name="tags" />
      </div>

      <div className="form__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn--primary">Create task</button>
      </div>
    </form>
  );
}
