const d = (offset) => {
  const t = new Date();
  t.setDate(t.getDate() + offset);
  const p = (x) => String(x).padStart(2, "0");
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`;
};

export const seedTasks = [
  { id: "t1", title: "Draft Q1 security review checklist", description: "Cover access reviews, key rotation and vendor audits.", assignee: "Meera Iyer", priority: "high", status: "in_progress", dueDate: d(3), tags: ["security", "q1"] },
  { id: "t2", title: "Migrate invoices bucket to private ACL", description: "", assignee: "Arjun Nair", priority: "urgent", status: "todo", dueDate: d(1), tags: ["storage"] },
  { id: "t3", title: "Review onboarding copy with Legal", description: "Check data-retention wording on the sign-up screen.", assignee: "Sana Khan", priority: "medium", status: "review", dueDate: d(6), tags: ["legal", "ux"] },
  { id: "t4", title: "Archive 2025 vendor contracts", description: "", assignee: "Dev Patel", priority: "low", status: "done", dueDate: d(10), tags: [] },
];
