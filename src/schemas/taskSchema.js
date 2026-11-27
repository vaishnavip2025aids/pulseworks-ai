import { z } from "zod";

export const PRIORITIES = ["low", "medium", "high", "urgent"];
export const STATUSES = ["todo", "in_progress", "review", "done"];

const todayISO = () => {
  const n = new Date();
  const p = (x) => String(x).padStart(2, "0");
  return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`;
};

export const taskSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(80, "Title must be 80 characters or fewer"),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer")
    .optional()
    .default(""),
  assignee: z
    .string()
    .trim()
    .min(2, "Enter the assignee's name")
    .max(60, "Assignee name is too long")
    .regex(/^[\p{L}][\p{L}\s.'-]*$/u, "Use letters, spaces, apostrophes or hyphens only"),
  priority: z.enum(PRIORITIES, { errorMap: () => ({ message: "Choose a priority" }) }),
  status: z.enum(STATUSES, { errorMap: () => ({ message: "Choose a status" }) }),
  dueDate: z
    .string()
    .min(1, "Due date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date")
    .refine((d) => d >= todayISO(), "Due date cannot be in the past"),
  tags: z
    .string()
    .default("")
    .transform((s) =>
      s
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
    )
    .pipe(
      z
        .array(z.string().max(20, "Each tag must be 20 characters or fewer"))
        .max(5, "Use at most 5 tags")
    ),
});

export const emptyTaskForm = {
  title: "",
  description: "",
  assignee: "",
  priority: "medium",
  status: "todo",
  dueDate: "",
  tags: "",
};

// Returns { data, errors }. On failure data is null and errors maps field -> message.
export function validateTask(values) {
  const result = taskSchema.safeParse(values);
  if (result.success) return { data: result.data, errors: {} };
  const errors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return { data: null, errors };
}
