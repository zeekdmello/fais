# TaskTurn — MERN FSD Project Creation Prompt

Copy everything below into your coding AI and attach the eight reference screenshots.

---

Build a complete, working MERN web application named **TaskTurn — A Priority-Based To-Do and Routine Planner** for our third-year Full Stack Development project.

The main deliverable is the working FSD project. Also prepare its documentation and the prescribed presentation after implementation. Do not stop at a plan, UI mockup, or frontend connected to fake data.

## 1. Reference and design direction

Study the attached screenshots and these references:
- https://myturn.kr/
- https://play.google.com/store/apps/details?id=kr.cheesebear.routineapptwo

Use the MyTurn screenshots as the primary visual reference. The separate purple to-do screenshot is a secondary reference for priority grouping and task details only.

Preserve the primary reference's recognizable visual ideas:
- White/off-white surfaces, strong black headings, thin dark outlines.
- Soft cream, pink, blue, and pale green routine tiles.
- Green progress fills, yellow add buttons, rounded pill controls.
- A weekly date strip with circular daily progress indicators.
- A board-game-inspired routine grid with directional connectors.
- A minimal racing-style to-do list with a small original illustrated vehicle.
- Calendar views and neatly bordered statistics cards.
- Small playful illustrations without clutter.

Create original TaskTurn branding and original simple SVG/CSS illustrations. Do not copy MyTurn logos, characters, award claims, store badges, or marketing screenshots into the functioning UI. Acknowledge the inspiration in the README and presentation references.

Do not convert this into a generic corporate dashboard, dark neon interface, or glassmorphism template. Keep the reference's cheerful paper-and-board-game feel. Use readable body text and a bold display heading style with sensible local/system font fallbacks.

## 2. Technology and code style

Use:
- MongoDB with Mongoose.
- Express.js and Node.js.
- React with Vite and React Router.
- Plain JavaScript and ordinary CSS with CSS variables.
- React Context for authentication; local hooks for ordinary page state.
- A small centralized API client using fetch.
- bcrypt for password hashing.
- Server-managed sessions in MongoDB with an HttpOnly cookie.
- Minimal additional dependencies, each with a clear purpose.

Choose compatible stable dependency versions available when implementing, record the required Node version, and commit lockfiles. Do not use Firebase, Supabase, Next.js, TypeScript, Redux, microservices, or unnecessary infrastructure for this version.

Use descriptive names, short understandable functions, consistent formatting, reusable components where useful, and straightforward routes/controllers/models. Avoid clever abstractions and excessive fragmentation.

Comments should explain non-obvious behavior in one or two lines. Do not include comments or UI text claiming that the code is “student-written,” “human-written,” “diploma-level,” or “AI-generated.” Provide real explanations in documentation so we can understand and demonstrate the project.

## 3. Required folder organization

The root must be named fsd, with frontend and backend as its main application folders:

fsd/
  frontend/
    public/
    src/
      assets/
      components/
      pages/
      context/
      hooks/
      services/
      styles/
      App.jsx
      main.jsx
    .env.example
    package.json
  backend/
    src/
      config/
      models/
      controllers/
      routes/
      middleware/
      utils/
      app.js
      server.js
    scripts/
    tests/
    .env.example
    package.json
  docs/
    screenshots/
    presentation/
  .gitignore
  package.json
  README.md

Only add files/folders that are actually needed. Provide root scripts to install both apps, start development, build the frontend, and run tests. Explain Windows PowerShell and Linux/macOS setup.

## 4. Pages and navigation

Build:
1. Public landing page.
2. Register and login pages.
3. Today dashboard.
4. Tasks page with priority filters and racing progress.
5. Routine board.
6. Monthly calendar.
7. Statistics.
8. Activity history.
9. Settings/profile.
10. Friendly not-found page.

Use desktop sidebar navigation, a compact tablet layout, and mobile bottom navigation with a More menu. Keep frequent actions easy to reach.

Landing page: original TaskTurn heading and short description, animated miniature board/list preview, features, three-step explanation, and working Register/Login calls to action. Clearly label preview data as a sample. No invented customer counts, testimonials, awards, or nonfunctional buttons.

## 5. Authentication and privacy

Implement registration, login, logout, session restoration, and protected routes. Store name, normalized unique email, password hash, timezone, and timestamps.

Use secure cookie settings in production, explicit allowed origins, appropriate CSRF protection for cookie-authenticated mutations, authentication rate limiting, and backend validation. Explain local versus production cookie settings.

Derive ownership from the authenticated session. Every task, routine, completion, statistic, activity item, and settings query must be restricted to that user. Never trust a client-supplied owner ID. Return safe error messages; never expose password hashes, credentials, or stack traces.

Do not create an admin panel or shared team workspace. This version has independent individual accounts.

## 6. To-do tasks and priority

Support creating, reading, editing, completing, reopening, and deleting tasks.

Task fields:
- Required title.
- Optional plain-text description.
- Category: Study, Personal, Work, Health, Other.
- Priority: High, Medium, Low; default Medium.
- Status: Pending, In Progress, Completed.
- Optional scheduled date, due date, and due time.
- Completion timestamp, owner, and created/updated timestamps.

Priority must affect real behavior:
- High: soft red badge with “High” text.
- Medium: soft amber badge with “Medium” text.
- Low: soft blue badge with “Low” text.
- A priority section showing unfinished High-priority tasks.
- Search plus filters for priority, status, category, and date.
- Sort by priority, due date, or newest.
- Explicit priority ranking High > Medium > Low; never alphabetical sorting.
- Default unfinished-task order: priority, nearest due date, stable creation order. Undated tasks follow dated tasks within the same priority.
- Completed tasks appear in a separate collapsible section.
- Show overdue as an independent label without silently changing priority.
- A due date without a time becomes overdue after the end of that date in the user's timezone.
- “Clear completed” requires confirmation and affects only the current user's selected scope.

Use visible labels as well as colors. Let users change priority both in the editor and from the list.

The racing strip represents completion within the currently displayed task scope: completed / total. Label that scope and keep the denominator consistent. At zero tasks, show an inviting empty state rather than 100% completion. Animate an original small vehicle as the completion percentage changes.

## 7. Routines and board behavior

Tasks are one-time items. Routines repeat on selected weekdays.

Support routine title, small icon, pastel color, optional time, weekday schedule, display order, start date, and archive state.

Show scheduled routines for the selected date in a board-game-style grid. Include a weekly date strip, completion count, and a marker that reflects completed/total routines. Users can complete routines in any order. The marker is a progress indicator, not a requirement to finish tiles sequentially.

The grid should form a sensible connected path on wide screens and simplify on narrow screens. Use accessible Move earlier / Move later controls for reordering; drag-and-drop is optional and must not be the only method.

Store completion per routine and local calendar date. Completing Monday must not complete Tuesday. Enforce a unique routine/date completion record and make repeated completion requests idempotent.

Do not clear or reset all database records at midnight. Derive the new day from the user's timezone.

Support undo completion. Archive routines rather than removing their past history. Apply schedule changes prospectively and preserve historical schedules/completion calculations; document a simple effective-date approach. Future routine occurrences cannot be marked complete.

## 8. Calendar and statistics

Calendar:
- Month navigation.
- Selected-date task and routine details.
- Green fills indicating daily routine completion ratios.
- Legend for complete, partial, and no scheduled routines.
- Counts and useful empty states.
- Correct month lengths and leap years.

Statistics:
- Task counts by status and priority.
- Tasks completed during the selected week/month.
- Routine completion percentage for scheduled occurrences.
- Daily completion chart for the selected period.
- Most completed routine.
- Routine streak based on consecutive scheduled days; unscheduled days do not break a streak.

Calculate from persisted data. Explain denominators, inclusion rules, and timezone handling. Exclude future days from completion-rate denominators. Keep task statistics and routine statistics separate where their definitions differ.

A mood journal is optional after all required features work. If implemented, use one entry per user/local date, a small mood selector, optional short note, and a calendar overview. Do not let this delay core to-do functionality or claim it exists if omitted.

## 9. Autosave and failure handling

MongoDB is the source of truth; browser storage must not be the primary database.

- Use an explicit Add action for new tasks/routines so typing does not create incomplete records.
- Autosave edits to existing items after approximately 600–800 ms of inactivity.
- Save priority, status, completion, and settings changes immediately.
- Display Saving…, Saved, or Could not save — Retry.
- Show Saved only after the server confirms success.
- Preserve unsaved text on failure and offer a retry.
- Prevent rapid clicks from producing duplicate records or completion events.
- Serialize per-item edits or use a version check to prevent older requests overwriting newer changes.
- Avoid sending unchanged fields and cancel outdated pending work appropriately.
- On internal navigation with unsaved edits, finish saving or warn the user.
- On tab close with unsaved edits, use a best-effort browser warning; do not promise guaranteed delivery.
- Refresh must restore confirmed database data.
- Explain that full offline synchronization is outside this version's scope.

Keep autosave logic in a small understandable hook rather than duplicating it across components.

## 10. Activity history and technical logs

Provide user-visible activity history for successful task creation, meaningful edits, completion/reopening, deletion, and routine completion/undo. Include action, readable item label, and timestamp; retain a label snapshot when the item is deleted.

Do not log every keystroke. Do not emit success activity before a mutation succeeds. Deduplicate repeat requests. Define how activity-write failure is reported or retried so the app never falsely claims complete audit history.

Show newest first, paginate, and allow date/action filtering.

Separately provide concise backend request/error logs with timestamp, method, route, status, and request ID. Never log passwords, cookies, authorization headers, complete private notes, or database credentials.

## 11. Responsive design, accessibility, and animation

Verify at widths 320, 375, 390, 768, 1024, 1366, and 1920 pixels.

- No page-level horizontal overflow.
- Desktop: use available width with a comfortable maximum content width.
- Tablet: reduce columns and simplify navigation.
- Mobile: single-column sections, compact board, bottom navigation.
- At 320 pixels: wrap labels and controls without hiding essential actions.
- Task editor: centered desktop dialog; mobile sheet or full-screen panel.
- Keep dialogs scrollable and action buttons reachable with the keyboard open.
- At least approximately 44px touch targets for primary controls.
- Keyboard navigation, visible focus, labeled inputs, dialog focus management, and readable contrast.
- Do not rely on hover or color alone.
- Respect prefers-reduced-motion.

Use short CSS animations for landing-page entrance, button feedback, completion check marks, board marker movement, progress fills, and dialogs. Keep most transitions around 150–300 ms. Avoid continuous distracting animation or confetti on every action.

## 12. Backend data and API

Design a concise schema using User, Task, Routine, RoutineCompletion, and ActivityLog, plus MoodEntry only if implemented. Add necessary ownership/date indexes and unique constraints.

Use date-only YYYY-MM-DD strings for local calendar identities and UTC instants for actual timestamps. Store an IANA timezone, initially Asia/Kolkata unless changed by the user. Document how changing timezone affects future dates without rewriting historical records.

Create and document versioned REST endpoints under /api/v1 for:
- Auth and current user.
- Task CRUD and status updates.
- Routine CRUD/archive/order.
- Date-specific routine completion/undo.
- Calendar queries.
- Statistics.
- Paginated activity.
- Settings.

Validate IDs, enum values, dates, string lengths, and allowed update fields. Use consistent JSON responses and HTTP status codes. Provide a health endpoint and clear database connection errors.

Keep business logic on the server where needed so a future Android client can reuse it. React and Android should call Express; neither client connects directly to MongoDB. Build only the web client now. Do not add Firebase merely because an Android version is planned.

## 13. Setup, seed data, and verification

Provide:
- .env.example files without real secrets.
- Local MongoDB setup and optional Atlas instructions.
- A configurable API base URL; no hard-coded deployment hostname.
- An explicit optional seed command for a demo account and realistic data.
- Seed data clearly identified as demo data and never inserted into ordinary accounts.
- A README with commands, architecture, schema overview, API examples, and troubleshooting.
- A short explanation of one full request flow: React form → API → controller → MongoDB → UI.
- A concise demo script and viva questions with understandable answers.

Implement focused checks for:
1. One user cannot read/change another user's records.
2. Priority ordering works.
3. Routine completion is unique per date and can be undone.
4. Routine schedule/history and timezone boundaries behave correctly.
5. Statistics use the documented denominator.
6. Autosave failure does not show a false Saved message.

Manually verify registration, login/logout, CRUD, search/filtering, refresh persistence, activity, calendar, and responsive layouts. Run builds and relevant tests. Report exact commands/results and remaining limitations honestly. Do not claim tests or screenshots you did not run/capture.

## 14. Compulsory presentation

After the working app is verified, create an editable PowerPoint and matching PDF with EXACTLY these 16 slides, in this order:

1. Title Slide — TaskTurn: A Priority-Based To-Do and Routine Planner; Student Names; Roll Numbers; Guide Name; Department; College Name.
2. Introduction — daily planning and the purpose of TaskTurn.
3. Problem Statement — scattered tasks, unclear priorities, forgotten routines, and limited progress visibility.
4. Objectives of the Project — task organization, priority, routines, persistence, responsive access.
5. Scope of the Project — implemented web features, individual accounts, and clear exclusions.
6. Existing System — paper lists and basic task lists; acknowledge that other modern planners already offer advanced features. Avoid unsupported competitor claims.
7. Proposed System — explain our implemented TaskTurn workflow and features.
8. Hardware and Software Requirements — actual development requirements and browser/database/network needs; label practical recommendations separately from verified minimums.
9. Technology Used — explain MongoDB, Express, React, Node, and essential supporting libraries.
10. Block Diagram — browser/React, Express API with authentication and controllers, MongoDB; show request/response directions.
11. Modules of the Project — Authentication, Tasks/Priority, Routines, Calendar/Statistics, Autosave/Activity, Settings.
12. Screenshots / Output — 2–4 legible screenshots captured from the actual app, with captions.
13. Future Scope — native Android client, notifications, offline sync, collaboration, and optional mood journal if it was not built.
14. Conclusion — summarize demonstrated results without invented performance numbers.
15. References — MyTurn website/listing as design inspiration, official MERN/Vite documentation, and any asset licenses actually used.
16. Thank You — short closing and Questions?

Use explicit placeholders for names, rolls, guide, department, and college until provided. Do not invent identities.

Presentation style:
- Consistent with the app: white background, dark headings, restrained green/yellow accents.
- 16:9 slides, readable typography, typically 3–5 short points per content slide.
- Avoid long paragraphs and tiny text.
- Add concise speaker notes for explaining the project.
- Use real app screenshots, never the reference screenshots as proof of our output.
- Claims and modules must match the final implementation.

Also generate a separate print-ready A4 landscape PDF with FOUR slides per page in a 2×2 grid, sequential order left-to-right then top-to-bottom. Exactly 16 slides must produce exactly FOUR handout pages. Include small slide numbers, sensible margins, and no cropped content. Inspect the exported slides and handout before delivery.

If the environment cannot create PPTX/PDF, provide complete slide content and export/print instructions, explicitly stating which files could not be generated. Do not pretend presentation files exist.

## 15. Work sequence and final delivery

Work in stages:
1. Inspect references; briefly state design choices, schema, and implementation plan.
2. Create the folder structure and working authentication/database connection.
3. Finish task CRUD, priorities, and persistence.
4. Add routine board, calendar, statistics, autosave, and activity.
5. Refine responsiveness, accessibility, animations, and landing page.
6. Run verification and fix discovered problems.
7. Capture actual output; prepare documentation, presentation, and print handout.

Do not repeatedly ask permission for routine implementation choices. Use sensible defaults and document them. Ask only if an essential unavailable requirement blocks progress.

Deliver the complete project, setup commands, environment examples, test results, screenshots, documentation, 16-slide PPTX/PDF, and four-page handout PDF. Summarize implemented features and any remaining limitations. The goal is an app we can run, explain, demonstrate, and extend into a future Android project.

