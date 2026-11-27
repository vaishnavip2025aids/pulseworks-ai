# PulseWorks AI - Secure Enterprise Workspace

A SaaS workspace for task tracking, cloud attachments, role-based auth, real-time collaboration and RAG document AI, built up over 16 days.

## Day 1 scope (this commit)

- Repository setup with `.env.example` and a typed env loader (`src/config/env.js`)
- Dynamic system banner (`SystemBanner`): live-refreshing feed, severity levels, rotation, dismissal
- Responsive dashboard shell: `Navbar`, `Sidebar` (slide-over drawer on mobile), `TaskCard`
- Task creation form validated on the client with Zod (`src/schemas/taskSchema.js`)

## Run it

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173. Production build: `npm run build`.

## Structure

```
pulseworks-ai/
├── .env.example
├── index.html
├── public/favicon.svg
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── config/env.js            # reads VITE_* variables
    ├── services/systemStatus.js # banner feed (mock or VITE_STATUS_ENDPOINT)
    ├── schemas/taskSchema.js    # Zod schema + validateTask()
    ├── data/seedTasks.js
    ├── components/
    │   ├── SystemBanner.jsx
    │   ├── Navbar.jsx
    │   ├── Sidebar.jsx
    │   ├── TaskCard.jsx
    │   └── TaskForm.jsx
    └── styles/index.css
```

## Validation rules (Zod)

| Field | Rule |
|---|---|
| title | 3-80 characters, trimmed |
| description | optional, max 500 |
| assignee | 2-60 characters, letters/spaces/.'- only |
| priority | low, medium, high, urgent |
| status | todo, in_progress, review, done |
| dueDate | required, YYYY-MM-DD, not in the past |
| tags | comma separated, max 5, each max 20 characters, lower-cased |

Client-side validation improves usability only. The backend added later must re-validate every request.

## Security notes

- Only `VITE_` variables are exposed to the browser. Never place secrets there.
- `.env` is git-ignored; commit only `.env.example`.
