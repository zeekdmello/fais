# Fais API v1

Base: `/api/v1`. JSON requests and responses. Authenticated routes require the `fais.sid` session cookie. Mutations require an explicitly allowed `Origin` and `X-CSRF-Token` from `/auth/csrf` or authentication responses. Fetch uses `credentials: include`. The server derives ownership from the session.

| Method | Endpoint | Behavior |
|---|---|---|
| GET | `/health` | `{ ok, app }`; 503 when database unavailable |
| GET | `/auth/csrf` | Create/restore session CSRF token |
| POST | `/auth/register` | `{name,email,password,timezone?}`; returns safe user + token |
| POST | `/auth/login` | `{email,password}`; returns safe user + new token |
| GET | `/auth/me` | Current safe user + CSRF token |
| POST | `/auth/logout` | Destroy session and cookie |
| PATCH | `/settings` | `{name?,timezone?}` |
| GET | `/tasks` | Filters: search, priority, status, category, date; sort=priority/due/newest |
| POST | `/tasks` | Task fields + unique clientKey, e.g. a UUID |
| PATCH | `/tasks/:id` | Changed allowed fields + `__v` |
| DELETE | `/tasks/:id` | `{__v}`; preserves activity label snapshot |
| GET | `/routines?date=YYYY-MM-DD` | All owner routines, selected-day eligibility/completion and tomorrow's schedule |
| POST | `/routines` | title, weekdays (0=Sun..6=Sat), startDate, clientKey, optional icon/color/time |
| PATCH | `/routines/:id` | Changed title/icon/color/time/weekdays/archived + `__v` |
| POST | `/routines/:id/order` | `{direction:"earlier" or "later",__v}` |
| PUT | `/routines/:id/completions/:date` | `{completed:true/false}`; idempotent desired state |
| GET | `/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD` | Daily routine and task counts |
| GET | `/statistics?from=YYYY-MM-DD&to=YYYY-MM-DD` | Same reporting source plus totals/streaks |
| GET | `/activity?page=1&action=task.created&date=YYYY-MM-DD` | 20 entries/page, newest first |

If `to` is omitted, reports end at that month's end. Default `from` is the current local month's first day. Maximum report span: 366-day difference. Calendar date details combine `/tasks?date=...` with `/routines?date=...`. The task date filter matches scheduled OR due date.

Example task creation through the browser's API helper:

```js
await api('/tasks', {
  method: 'POST',
  body: {
    title: 'Finish the project proposal',
    priority: 'High',
    category: 'Study',
    dueDate: '2026-10-20',
    dueTime: '17:00',
    clientKey: crypto.randomUUID()
  }
});
```

Example partial edit (use the last returned version):

```js
await api(`/tasks/${task._id}`, {
  method: 'PATCH',
  body: { status: 'Completed', __v: task.__v }
});
```

Task fields: title (1-140), description (0-4000), category Study/Personal/Work/Health/Other, priority High/Medium/Low, status Pending/In Progress/Completed, scheduledDate, dueDate, dueTime. Optional dates/times use empty strings, not null. Due time requires due date. Completed timestamp is server-owned.

Routine icons: sun/book/leaf/cup/moon/heart/shoe/water. Colors: cream/pink/blue/green/lavender. Title max 100. At least one weekday required. Start dates are immutable after creation.

Success envelopes use `{task}`, `{tasks}`, `{routine}`, `{routines}`, `{user}`, `{ok:true}`, or documented report fields. Mutation responses may include `warning` when activity logging fails after the change is persisted. Errors use `{error,requestId?}`. Typical status codes: 200 success, 201 created, 400 validation, 401 authentication, 403 CSRF/origin, 404 unavailable record, 409 duplicate/version conflict, 429 auth throttling, 500 safe internal error.

There is no bulk delete endpoint: Clear completed uses the displayed owner-scoped IDs and confirmed versions, preventing deletion of unseen or newly changed tasks.

Calendar/report daily entries include `taskTotal` and `taskCompleted` for the tasks scheduled, due, or completed on each date, deduplicated within that date. `tasks` remains the count completed on that date for statistics.
