# Fais — pendrive and college setup guide

## Start here: your Windows college PC

You confirmed the college PC has Windows, internet and administrator access. Use **Windows 11 x64** for the automatic MongoDB 8 setup. Check **Settings → System → About** first. MongoDB 8's officially supported desktop Windows version is Windows 11; older Windows is covered in the fallback section below.

1. Copy `Fais-College.zip` from your pendrive to the PC's Desktop or Downloads.
2. Right-click → **Extract All**. Move the extracted `Fais` folder to a writable local location, for example `C:\Fais`. Do not run inside the ZIP or directly from the pendrive.
3. Start menu → search **Windows PowerShell** → **Run as administrator**.
4. Run this **one line** (change `C:\Fais` only if you used another location):

```powershell
cd C:\Fais; powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\setup.ps1
```

The execution policy option applies only to that PowerShell process; it does not permanently change your machine policy. Institutional policy can still block scripts. Use the manual method if it does.

5. Answer **y** to setup; press Enter for Compass, demo data and starting Fais. Allow installer/UAC dialogs. Do not close the terminal while it is working.
6. Once you see `Fais API ready at http://127.0.0.1:4000`, open **http://127.0.0.1:4000** in Edge or Chrome.
7. Demo login: **demo@fais.local** / **FaisDemo2026!**. Or register your own account.

First installation can take several minutes or longer depending on downloads. Test this on the college PC before your presentation slot. Internet and admin access do not guarantee that institutional proxy or security policies permit every download.

## What setup does

| Component | How it is handled |
|---|---|
| Node.js and npm | Checks for Node 24.14+ in the 24.x line. Installs Node 24.14.0 on Windows if needed; npm is bundled. |
| React, Vite, Express, Mongoose, bcrypt and other libraries | `npm ci` uses the included lockfile. No separate global React or Express installation is needed. |
| MongoDB Community Server | Reuses the default MongoDB service or installs the newest available 8.0 patch from winget, then starts it. |
| MongoDB Compass | Offers installation; a graphical viewer, **not the database server**. You can decline and add it later. |
| Configuration | Creates `backend/.env` with a new random session secret. Preserves existing configuration. |
| Database check | Actually connects and pings MongoDB; it does not rely only on a “service started” message. |
| Demo data | Optional seed creates the demo account and realistic tasks/routines. It does not overwrite an existing demo account. |
| Frontend | Builds the current React source, including the green/blue calendar bars. |
| Running | Offers to start the built app on port 4000. One terminal serves both the frontend and API. |

Git, Python, Java, VS Code, Docker and a global React/Express installation are **not required** to run this project. `mongosh` is optional; the setup uses the application's driver to check MongoDB.

The ZIP includes source, lockfile, setup scripts, screenshots and presentation files. It **does not include this Mac's installed packages, secrets, private database, or logged-in sessions**. Demo records are recreated on the new PC. It is an online setup package, not an offline Windows installer bundle.

## Every subsequent run on Windows

MongoDB normally runs as a Windows service. Double-click **start.cmd** inside the extracted Fais folder, or run:

```powershell
cd C:\Fais
npm.cmd start
```

Open **http://127.0.0.1:4000**. Keep the terminal open. Stop Fais with **Ctrl+C**. Closing Compass does not stop MongoDB; closing Fais does not delete your database.

If MongoDB is stopped, use Administrator PowerShell:

```powershell
Start-Service MongoDB
```

After editing frontend source, run `npm.cmd run build` before `npm.cmd start`. For development with immediate code updates instead, use `npm.cmd run dev`, then open **http://127.0.0.1:5173**. Do not run both start and dev simultaneously on port 4000.

## MongoDB and Compass: connect and view the data

### Understand the three parts

**Fais in browser → Express server → MongoDB Server** stores data. **Compass → MongoDB Server** lets you inspect those same records. Compass does not connect to the website and cannot replace MongoDB Server.

### Connect Compass

1. Start **MongoDB Compass** from the Start menu.
2. Click **Add new connection** / **New Connection** (wording depends on Compass version).
3. Paste this connection string:

```text
mongodb://127.0.0.1:27017
```

4. Give the saved connection a name such as **Fais local college**.
5. Click **Connect** / **Save & Connect**. For the default local setup, no database username or password is required. Your Fais login is an app account; do not put it in Compass authentication fields.
6. Select the **fais** database. Refresh the database list if it is not visible.
7. Open a collection and choose **Documents**.

| Collection | What you can demonstrate |
|---|---|
| `users` | App accounts, timezone and hashed passwords. Passwords cannot be read back as plain text. |
| `tasks` | Titles, priority, status, dates, owner and completion timestamp. |
| `routines` | Ritual definitions, schedules and schedule history. |
| `routinecompletions` | A ritual's completion for a particular local date; undo changes its active state. |
| `activitylogs` | Saved activity events with readable labels and timestamps. |
| `sessions` | Server-managed login sessions; internal data, not needed for the viva demonstration. |

**The database is created by writing data**, not merely by installing MongoDB or connecting Compass. Run the seed or register an account and add a task. You do not need to manually create collections or import a schema.

### Demonstrate persistence

1. Log into Fais and create a task titled `College database demo`.
2. In Compass open `fais → tasks → Documents` and press Refresh.
3. Paste this in the Filter field and click Find:

```json
{ "title": "College database demo" }
```

4. Complete the task in Fais. Refresh Compass: `status` becomes `Completed` and `completedAt` is populated.
5. Refresh the browser. The task stays completed because MongoDB saved it.
6. Open Calendar: **green R bar = rituals; blue T bar = completed / listed tasks** for that date. Listed tasks are scheduled, due or completed on the date, counted once within the date.

For one account's records, find that user's `_id` in `users`, then filter tasks with `{ "owner": ObjectId("paste-the-id-here") }`. Use this only after replacing the placeholder with a real ID. View documents during the demo; make changes through Fais so validation and activity history stay consistent.

### Where configuration and data live

`backend/.env` contains:

```dotenv
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/fais
SESSION_SECRET=a-unique-random-value-created-by-setup
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:4000,http://127.0.0.1:4000
NODE_ENV=development
```

Do not replace the generated secret with the example above. Keep `127.0.0.1` rather than changing MongoDB to a public network address. Data lives in MongoDB's configured data directory on the **college PC**, outside your project folder. Copying the app back to the pendrive does not copy the database. The MongoDB MSI shows the data path; its service configuration is normally under `C:\Program Files\MongoDB\Server\8.0\bin\mongod.cfg`.

## Check everything before the viva

Inside the project folder:

```powershell
node scripts/setup/doctor.mjs
```

All checks should say **PASS**. Start Fais, then open **http://127.0.0.1:4000/api/v1/health**. It should show `{"ok":true,"app":"Fais"}`.

Then verify:

1. Login, create a task, set priority, complete it and refresh.
2. Complete/undo a ritual; inspect the two calendar bars.
3. Open statistics and activity.
4. Connect Compass and locate the task.
5. Open `docs/presentation/Fais-Presentation.pptx` and the PDF. Fill in student/college/guide placeholders before presenting; PDF is a fallback if PowerPoint is unavailable.

## Manual Windows installation / recovery

### winget is not recognized

Install or update **App Installer** from the Microsoft Store, reopen Administrator PowerShell, then run `winget --version`. If Store access is blocked, install the tools manually from the official links below. Rerun setup after tools are installed, or follow the manual project steps.

### Install the three tools manually

1. Install **Node.js 24.x**, version 24.14 or later, Windows x64 MSI. Keep npm and Add to PATH enabled. Close/reopen the terminal. Run `node -v` and `npm.cmd -v`.
2. Install **MongoDB Community Server 8.0**, Windows x64 MSI. Choose **Complete**, enable **Install MongoD as a Service**, keep the default service name **MongoDB**, and finish installation. It may offer Compass too.
3. Install **MongoDB Compass** separately if it was not installed with MongoDB. Compass is optional for running Fais but useful for the database demonstration.

If Node 22/25 or another version is already installed, use a Node version manager or have the administrator select Node 24. Do not remove shared lab software blindly. Setup stops rather than silently claiming an incompatible runtime works.

Official download pages:

- Node: https://nodejs.org/en/download
- MongoDB Community: https://www.mongodb.com/try/download/community
- Compass: https://www.mongodb.com/try/download/compass

After installing Node and MongoDB, run these from the extracted folder. The second command performs dependency installation, creates configuration, pings MongoDB and offers seed/build/start:

```powershell
cd C:\Fais
node scripts/setup/project.mjs
```

You can skip Compass during automatic setup if its package installation fails; install it manually later. The automatic setup preserves existing `.env` and data when rerun, but `npm ci` reinstalls the project's dependencies.

### MongoDB connection refused / database ping fails

1. Open `services.msc`. Find **MongoDB**, start it, and check it stays Running.
2. Or run `Get-Service MongoDB` and `Start-Service MongoDB` in Administrator PowerShell.
3. Check that `backend/.env` says `mongodb://127.0.0.1:27017/fais` unless you intentionally configured another database.
4. If the service is missing, modify/reinstall the MongoDB MSI with **Install MongoD as a Service**. A custom service name must be started manually.
5. If it starts then stops, check the MongoDB log path in `mongod.cfg`. A port conflict, unsupported CPU, missing data directory or permissions problem can prevent startup. Do not delete database files to “fix” it.
6. Rerun `node scripts/setup/doctor.mjs`.

Compass showing connection refused usually means MongoDB Server is stopped; reinstalling Compass alone will not fix that.

### Other common problems

| Symptom | Action |
|---|---|
| `npm.ps1 cannot be loaded` | Use `npm.cmd` on Windows, or use `start.cmd`. |
| Script blocked by college policy | Use the manual installers and `node scripts/setup/project.mjs`; ask the lab administrator if the application itself is blocked. |
| `node` not recognized after install | Close/reopen terminal. Check Node's Add to PATH installation option. |
| winget package/version unavailable | Use the official installers above and rerun the common Node setup command. |
| Download/TLS/proxy error | Ask the lab admin to permit official Node/npm/MongoDB endpoints. Do not disable certificate checks. Retry on a permitted connection. |
| `npm ci` fails on bcrypt/native binaries | Confirm Node 24 x64 and internet; read the first error. A restricted machine may need C++ build tools if the prebuilt binary cannot be used. |
| `EADDRINUSE` / port 4000 occupied | Stop the other Fais terminal. If another app owns 4000, set `PORT=4001` and add `http://127.0.0.1:4001` to `ALLOWED_ORIGINS`, then open that URL. |
| Blank/stale UI | Run `npm.cmd run build`, restart Fais, hard refresh. |
| `fais` missing in Compass | Connect to the correct local server, seed/register/create data, then refresh. |
| Demo login fails | Run `npm.cmd run seed`. It skips an existing demo account; it does not reset a changed password. Register a fresh account if needed. |
| Compass fails but app works | Install Compass separately; the app does not depend on the GUI. |

### Windows 10 or another unsupported local-server platform

The automatic script stops on Windows versions older than Windows 11. Do not promise MongoDB 8 support on the lab's older OS. Use a supported Windows 11 PC, or ask the lab administrator for a compatible existing MongoDB server. Another option is MongoDB Atlas with an internet connection: install Node, configure `backend/.env` using the Atlas steps in the main README, and run `node scripts/setup/project.mjs`. Atlas requires its own account, database user and network access configuration; it is not created automatically. Compass can use the same Atlas connection string. Never put credentials in screenshots or shared slides.

## macOS and Linux alternatives

After extracting, open Terminal inside the Fais folder and use:

```bash
bash setup.sh
```

The script detects macOS versus Linux; no OS selection is needed. On macOS it uses Homebrew, installs Node 24 and MongoDB 8 if missing, starts the Homebrew service and offers Compass. Homebrew may first require Apple Command Line Tools. Do not run the whole script with sudo.

On Linux it automatically supports **Ubuntu 22.04/24.04** on x64 or arm64 with systemd. It uses the official MongoDB apt repository. Compass's automatic `.deb` path is x64 only. Other distributions must install supported Node 24 and MongoDB using their official platform instructions, start MongoDB, then run `node scripts/setup/project.mjs`.

Later runs:

```bash
bash start.sh
```

The launcher uses the runtime path recorded by setup. If the project moves to another computer, run setup again. On Ubuntu the downloaded Node runtime is under `~/.local/share/fais-tools`; setup does not edit shell profiles. On macOS Node from Homebrew may also be version-specific, so use `start.sh` if `npm` is not on your normal PATH.

Database start commands:

```bash
# macOS
brew services start mongodb-community@8.0
# Ubuntu
sudo systemctl start mongod
```

## Pendrive preparation and offline limits

Take the ZIP **and** the presentation PDFs on the pendrive. Keep a backup copy elsewhere. Copy to the PC's local disk before extracting. The setup downloads dependencies for that computer; Mac `node_modules` cannot be reused as Windows `node_modules`.

Once dependencies are installed, the app built and local MongoDB running, ordinary app use works without internet. External web fonts fall back to system fonts offline. A completely fresh offline PC cannot install everything from this ZIP: take OS-specific installers and a dependency cache prepared on a matching Windows machine if offline installation becomes necessary. Since you confirmed internet/admin access, the online setup is the intended route.

This ZIP creates fresh demo data. To transfer your real current database as well, use MongoDB Database Tools `mongodump` on the original computer and `mongorestore` on the destination. Keep that backup separate and private because it includes accounts and personal records. Do not use `--drop` against a database you want to preserve. Copying raw database files while MongoDB is running is not a safe substitute. For tomorrow's demonstration, the provided seed is the simplest option.

## Verification and limits of this delivery

The Fais app and calendar were tested on this Mac. The setup shell syntax, JavaScript syntax, ZIP integrity and extracted app installation/build/database check were checked as recorded in `docs/PORTABLE-VERIFICATION.md`. A fresh Windows/Linux installation cannot be executed on this Mac; those installer branches are provided with official package sources and manual recovery steps. The Windows PC still needs a real pre-demo check.

Official references (checked during preparation):

- Windows MongoDB install/service/support: https://www.mongodb.com/docs/v8.0/tutorial/install-mongodb-on-windows/
- Ubuntu MongoDB install: https://www.mongodb.com/docs/v8.0/tutorial/install-mongodb-on-ubuntu/
- Compass installation: https://www.mongodb.com/docs/compass/install/
- Node 24.14.0 winget manifest: https://github.com/microsoft/winget-pkgs/tree/master/manifests/o/OpenJS/NodeJS/LTS/24.14.0
- Homebrew: https://brew.sh/
