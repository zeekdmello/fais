# Taking Fais to college on a pendrive?

Read [SETUP-COLLEGE.md](SETUP-COLLEGE.md) first. It includes the one-line Windows setup, macOS/Linux setup, database and Compass walkthrough, and troubleshooting.

# Fais

**A Priority-Based To-Do and Routine Planner.** Fais is inspired by the French verb *faire*: to do or to make. A MERN web application for individual accounts, with original paper-style illustrations and a playful routine board.

## Quick start

Use Node **24.14.0** (see `.nvmrc`) and npm 11.9.0. MongoDB Community 8.0 runs locally. React/Express libraries are project dependencies, not global installs.

From the project root (the existing `FSD` folder on this Mac):

```sh
npm install
```

On macOS/Linux:

```sh
cp backend/.env.example backend/.env
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

On Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Paste the generated random string into `SESSION_SECRET` in `backend/.env`. Never commit `.env`. A local file with a generated secret has already been created on this development machine. No frontend `.env` is needed with the Vite proxy.

```sh
npm run dev
```

Open **http://127.0.0.1:5173**. Vite proxies `/api` to Express at `127.0.0.1:4000`. Register for an empty personal account. All normal accounts start empty.

Optional labeled demo:

```sh
npm run seed
```

- Email: `demo@fais.local`
- Password: `FaisDemo2026!`
- Name: Alex. This is a fictional demo account.
- Set `DEMO_EMAIL` and `DEMO_PASSWORD` environment variables to override defaults. The seed skips existing accounts and never overwrites personal data.

## MongoDB and Compass

macOS (Homebrew):

```sh
brew tap mongodb/brew
brew trust mongodb/brew
brew install mongodb-community@8.0
brew services start mongodb-community@8.0
mongosh --quiet --eval 'db.runCommand({ ping: 1 })'
```

If Homebrew reports loaded but the process never launches, inspect `brew services info mongodb-community@8.0` and `/opt/homebrew/var/log/mongodb/mongo.log`. On this Mac, explicitly starting the registered service with `launchctl kickstart -k gui/$(id -u)/sh.brew.mongodb-community@8.0` resolved the initial startup problem.

Windows: install MongoDB Community Server as a Windows service and MongoDB Shell from the official MongoDB downloads. Linux: follow the official MongoDB repository instructions for your distribution, then start its `mongod` service. Check the same ping command on all platforms (PowerShell accepts the single-quoted JavaScript).

**Compass can be installed at any time.** It is a separate optional graphical database client. Connect with `mongodb://127.0.0.1:27017`, then open database `fais`. Its collections appear after writes: `users`, `tasks`, `routines`, `routinecompletions`, `activitylogs`, and `sessions`. Compass does not replace the MongoDB server. Do not edit password hashes or sessions manually.

Atlas alternative: create an Atlas cluster, a database user, and a narrow network access rule for your development IP. Copy the driver URI into `MONGODB_URI`, with the database name `fais`. Encode special characters in credentials and keep the URI in `.env`. Atlas needs network access. Neither the React client nor a future Android client receives this URI.

## Commands

| Command | Purpose |
|---|---|
| `npm install` / `npm run setup` | Install both workspaces and root tools |
| `npm run dev` | Run React/Vite and Express together |
| `npm run build` | Build `frontend/dist` |
| `npm start` | Serve API and built frontend at port 4000 |
| `npm test` | Backend integration/domain checks plus autosave checks |
| `npm run seed` | Optional demo account and sample history |
| `node scripts/browser-check.mjs` | Chrome UI checks and screenshot capture; requires running dev servers |

The lockfile pins resolved dependencies. Git history was not initialized automatically; retain `package-lock.json` in version control when you initialize the repository.

## Architecture and folders

```text
FSD/
  frontend/src/
    assets/       original-asset notes
    components/   layout, dialogs, board, task rows, original SVG art
    pages/        landing, authentication, Today, tasks, routines, reports
    context/      session restoration and current user
    hooks/        data loading and serialized autosave
    services/     fetch API and calendar-date helpers
    styles/       responsive CSS and reduced-motion rules
  backend/src/
    config/       MongoDB connection
    models/       Mongoose schemas and indexes
    controllers/  authentication, tasks, routines, reports
    routes/       versioned REST endpoints
    middleware/   sessions, CSRF, ownership authentication
    utils/        validation, date rules, statistics, activity writes
  backend/scripts/seed.js
  backend/tests/
  frontend/tests/
  docs/           API reference, demo guide, checks, screenshots, slides
```

The existing directory remains `FSD` on this Mac; application/package branding is **Fais** throughout. The root contains the requested `frontend` and `backend` folders, with no redundant nested project folder.

One request flow: a React task form calls the centralized `api()` fetch client. Express verifies the session, allowed Origin, and CSRF header. The controller validates allowed fields and attaches `req.user._id` as owner. Mongoose persists the task to MongoDB. Only after the API confirms success does the UI show Saved and reload its list. An activity event records the successful change separately.

## Data model

| Collection | Main fields and constraints |
|---|---|
| User | name, unique normalized email, bcrypt password hash, IANA timezone |
| Task | owner, title, description, category, priority, status, local scheduled/due dates, due time, UTC completedAt, version |
| Routine | owner, title, icon, color, time, startDate, order, effective-date schedule history, version |
| RoutineCompletion | owner + routine + local date unique, active flag, version; undo keeps a tombstone |
| ActivityLog | owner, action, label snapshot, globally unique event key, UTC createdAt |
| Session | server-managed session and TTL in MongoDB |

Task/routine client request keys are unique per owner, preventing duplicate creation on retries. Mongoose optimistic versions prevent stale item edits. Every business-data query includes the authenticated owner. The client cannot provide an owner field.

## Behavior and definitions

- Tasks are one-time items. Routines repeat on selected weekdays.
- Default unfinished task order: High, Medium, Low; then nearest due date/time; then stable oldest creation order. Undated tasks follow dated tasks within the same priority. Completed tasks occupy a separate collapsible section.
- The racing strip uses completed / total **in the current filtered view**, including completed items when their filters match. An empty view shows zero tasks, not a successful 100%.
- Dates such as `2026-10-13` identify the user's local day. Actual event timestamps use UTC. Date-only deadlines become overdue after the local end of day; timed deadlines use the user's current timezone.
- A new routine starts today or later. Schedule and archive edits become effective tomorrow, or at the future start date if later. The routine keeps earlier effective schedules. Renaming, icon/color/time, and display ordering update the current presentation; past occurrence eligibility and completion denominators remain based on saved schedule history.
- Completing a routine sets one unique user/routine/date record active; repeated completion is idempotent. Undo sets it inactive. Future completion is rejected. Users can complete any tile in any order. Nothing deletes/reset records at midnight. Dates recalculate on navigation/refresh; an already-open idle screen may need refresh after midnight.
- Reordering is an accessible earlier/later operation using fractional display order. The board snakes across desktop rows and simplifies to two columns on phones.
- Calendar dates stay neutral with two separate bars: green R = completed / scheduled rituals; blue T = completed / listed tasks. A dash and empty track mean no items. The task denominator includes tasks scheduled, due, or completed on that local date (each task counted once per date), matching the selected-day details. Completion uses the task's current status, so reopening updates the bar. These are current task states, not historical snapshots.
- Calendar data reloads on entry, window focus, visibility return, and every 30 seconds while visible; it is not a push-based live feed. Statistics still count actual task completions by their completion date.

- Routine rates use scheduled occurrences from the start of the selected period **through today**, excluding future days. Zero denominator displays a dash. Most-completed routine counts successful check-ins in the period.
- A streak counts consecutive scheduled days backward from today; unscheduled days do not break it. An unfinished current day is allowed until the day ends. Displayed streaks are current, not all-time best.
- Task status/priority totals describe all current tasks. Week/month completion counts use each currently completed task's completion timestamp. Reopening or deleting removes it from these counts. Activity history retains the corresponding past events and deleted label snapshot.
- Changing timezone affects subsequent local-day/deadline calculations without rewriting stored date identities.

## Autosave and reliability

New items require Add. Existing text edits debounce for 700 ms; priority/status/completion and profile changes save immediately. A per-editor queue serializes requests and carries the server-confirmed version into each later edit. Failure keeps pending text and shows Retry; Saved appears only after server confirmation. A version conflict asks users to reopen the current record rather than silently overwriting someone else's edit.

Internal navigation with pending edits shows a discard warning. Tab close uses `beforeunload`, which is best effort and browser-controlled. Full offline synchronization is outside this version. The app does not use browser storage as its database.

Activity writes happen after mutations. Repeated completion events use unique event keys. If the separate activity write fails, the successful mutation stays saved, and the response/UI explicitly warns that history may be incomplete. There is no automatic durable outbox in this version. The history is useful activity reporting, not a guaranteed transactional audit ledger.

## Security and deployment

- bcrypt with cost 12; password hashes excluded from default queries and never returned.
- HttpOnly MongoDB-backed sessions, SameSite=Lax, 7-day expiry, regenerated at login/registration.
- Session-bound CSRF tokens plus explicit allowed Origin checks for mutations.
- Authentication rate limiting (30 attempts per 15 minutes/IP), request size limits, enum/date/ID validation, safe errors, and Helmet headers.
- Request logs include timestamp, method, path, status and request ID, never bodies, passwords, cookies, database URIs or private notes.
- Local HTTP uses `secure:false`. Production sets `NODE_ENV=production`, secure cookies and `trust proxy=1`: deploy behind exactly one trusted HTTPS reverse proxy. Set `ALLOWED_ORIGINS` to your actual browser origin(s), and keep frontend/API on the same site for SameSite=Lax cookies. The server listens on loopback for this local project; change the bind configuration deliberately for container hosting.
- Production secrets and deployment were not configured here. Use a strong secret, narrow database access, HTTPS, monitoring, and backups for a real deployment.

## Features and exclusions

Implemented: landing, accounts, Today, tasks/priority/filtering, repeating routine board, calendar, statistics, autosave, activity history, profile/timezone, responsive navigation, original SVG artwork and friendly 404.

Not included: mood journal (optional in the brief), push notifications, native mobile widgets, native Android app, offline sync, shared teams, password reset/email verification, production hosting. Mood screenshots inform only the visual direction; the app does not claim to include that feature.

## Troubleshooting

- `ECONNREFUSED 127.0.0.1:27017`: MongoDB is not accepting connections. Start its service and run the ping.
- API fails to start: check `backend/.env`, database URI and secret length. Port 4000 must be available.
- Login/session errors: use a consistent hostname (`127.0.0.1` or `localhost`); these are different cookie hosts. Check the frontend origin is in `ALLOWED_ORIGINS`.
- Browser says server unavailable: ensure both processes from `npm run dev` are alive; inspect backend terminal output.
- A save reports conflict: close and reopen the item to load its newest version before editing.
- Development npm scripts run from the repository root. Do not run `npm install` separately in both workspaces.
- Google Fonts are a cosmetic enhancement; system Arial fallbacks keep the app usable without them.

## Verification and documentation

See `docs/VERIFICATION.md`, `docs/API.md`, `docs/DEMO-AND-VIVA.md`, and `docs/screenshots/`. The browser script creates clearly named QA records while exercising forms; use a dedicated demo/test workspace when re-running. Integration tests use a unique disposable `fais_test_*` database and clean only that database.

## Inspiration and licenses

Visual inspiration: [MyTurn website](https://myturn.kr/) and [Google Play listing](https://play.google.com/store/apps/details?id=kr.cheesebear.routineapptwo), plus the supplied purple task reference for priorities. No reference logos, characters, screenshots, awards, or badges are embedded in the app. All routine/plant/vehicle SVG illustrations in `Art.jsx` are original project assets. Lucide icons use the ISC license. DM Sans and Manrope via Google Fonts use the SIL Open Font License. Dependency licenses remain with their respective packages.

Official references: [MongoDB](https://www.mongodb.com/docs/), [Mongoose](https://mongoosejs.com/docs/), [Express](https://expressjs.com/), [React](https://react.dev/), [Node.js](https://nodejs.org/docs/latest-v24.x/api/), [Vite](https://vite.dev/guide/), [Luxon](https://moment.github.io/luxon/).
