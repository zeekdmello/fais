# Fais demo and viva guide

## Five-minute demonstration

1. Open the landing page. Explain the original Fais name and the visual inspiration. Log in with the labeled demo account, or register a new account to show that real accounts start empty.
2. On Today, show high-priority tasks and the routine check-in count. Open My tasks, create a Study task with High priority and a due date. Show filtering, search, and explicit priority ordering.
3. Open the task and edit its notes. Wait for Saved, refresh, and show that MongoDB restored the text. Complete and reopen it. Explain the racing strip's current-view denominator.
4. Open Routines. Complete any tile, undo it, and select another date. Explain that each date has its own unique completion record. Show weekday selection and note that schedule/archive changes apply tomorrow.
5. Show the monthly calendar and statistics. Explain completed/scheduled occurrence rates, future-day exclusion, and streaks skipping unscheduled days. Open Activity and show the successful actions.
6. Resize to mobile. Show bottom navigation and More. Open Settings and show timezone. Log out. End with the browser/API/MongoDB architecture slide.

Do not claim a mood journal, notifications, native widgets, offline synchronization, or deployed hosting. Demo data is illustrative, not a measure of real users' performance.

## Viva questions

**Why MERN?** MongoDB stores documents, Express handles HTTP routes and validation, React renders stateful screens, and Node runs the backend. JavaScript is used across client and server.

**What makes a task different from a routine?** A task is a one-time item with status and optional deadline. A routine defines repeating weekdays; its completion is stored separately for each local date.

**Why use Mongoose?** It maps JavaScript documents to MongoDB, defines indexes, and supports optimistic version checks. Application validation still checks allowed fields and business rules.

**How is priority sorted?** An explicit numeric map assigns High=0, Medium=1, Low=2. Deadline and creation order break ties. Alphabetical sorting would be incorrect.

**How do you stop one user seeing another user's tasks?** Every query uses the authenticated session's user ID as owner. Client-supplied owner IDs are rejected. Tests verify cross-account reads and mutations.

**Where is the password?** Only a bcrypt hash is stored. The plaintext password is used during the request, never logged or returned. Sessions use HttpOnly cookies and live in MongoDB.

**What is CSRF protection?** A mutation must include the session's token in a custom header and an explicitly trusted Origin. An unrelated website cannot legitimately obtain the session's token.

**How does autosave avoid lost edits?** A 700 ms debounce collects text edits. One queue sends one request at a time with the confirmed version. Conflicts fail rather than overwrite. Failed changes remain pending and can be retried.

**What does Saved mean?** The server confirmed MongoDB persistence. Sending a request alone does not mean the change was saved.

**Does the application work offline?** No full offline sync is implemented. Already-open text stays in the editor after a failure, but closing the page can lose unsaved edits.

**Why use local dates and UTC timestamps?** Local date strings identify calendar days consistently for routine history. UTC timestamps identify actual instants such as completion and activity events.

**Does midnight erase routine completions?** No. Each completion is keyed by routine and local date. The next day reads another date. An idle screen may need a refresh after midnight.

**Why preserve schedule versions?** Changing a routine from daily to weekdays must not change last month's denominator. Each schedule has an effective date, and earlier dates use the earlier schedule.

**How are rates calculated?** Completed scheduled occurrences divided by all scheduled occurrences in the selected period through today. Future days are excluded. A zero denominator displays no percentage.

**What breaks a streak?** A past scheduled day without a completion. Unscheduled days do not break it; today can remain unfinished until the day ends.

**Is activity history transactional?** No. Activity writes follow successful mutations and have unique event keys. If the write fails, the app warns that history may be incomplete. A durable transactional outbox would be a future improvement.

**Can an Android application reuse this backend?** Yes, after adding a suitable native authentication integration. It calls Express endpoints, not MongoDB directly. The web client is the implemented version.

**Why is Compass optional?** It is a database GUI for developers. The backend connects through the MongoDB driver whether Compass is installed or not.

**How would you scale it?** Add pagination for large task/routine lists, bounded reporting aggregation, production monitoring, backups, shared rate-limit storage, and a deployment-specific security review. This version is for individual student-project workloads.
