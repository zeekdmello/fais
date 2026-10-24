# Fais verification record

Checked locally on 13 October 2026, using Node 24.14.0, npm 11.9.0, MongoDB Community 8.0.34 and installed Google Chrome. This is a local development verification, not a production certification.

## Commands and results

| Command | Result |
|---|---|
| `npm install` | Dependencies installed; npm reported 0 vulnerabilities at installation |
| `npm run build` | PASS: Vite production bundle generated in `frontend/dist` |
| `npm test` | PASS: 6 backend tests and 2 frontend autosave tests |
| `npm run seed` | PASS: explicit demo account created; existing accounts are not overwritten |
| `node scripts/browser-check.mjs` | PASS: 64 recorded checks; no uncaught browser JavaScript errors |
| `node scripts/capture-evidence.mjs` | PASS: clean desktop/mobile screenshots and focused evidence captures |
| `node scripts/build-smoke.mjs` | PASS: built frontend, API health, login, statistics month navigation, timezone persistence and restoration |
| `npm run format` | Source formatted consistently with Prettier |
| `node scripts/calendar-check.mjs` | PASS: completing an undated task on Today appears in calendar count/details; reopening refreshes on focus; completion refreshes within 30 seconds; no overflow at all seven widths |

## Automated coverage

- Cross-account task reads, edits and deletion are denied; reports and activity are owner scoped.
- Registration, login/logout, session restoration, normalized accounts and CSRF enforcement.
- Task create/read/update/delete, explicit priority order, date validation, optimistic stale-edit rejection, and duplicate-request keys.
- Routine completion unique per owner/routine/date, repeated requests idempotent, undo works, other accounts denied, future completion rejected.
- Schedule history and prospective archive changes preserve past eligibility.
- Date-only deadlines use local end-of-day; midnight timezone conversion, leap February and scheduled-day streaks are covered.
- Routine statistics exclude future denominators.
- Autosave failure retains text and does not report Saved. Queued edits use confirmed versions and serialize requests.
- Browser flow covers search, completion/reopen, refresh persistence, simulated network failure and retry, routine creation/completion/undo/archive, registration and clean initial accounts.

The API tests create and remove only a uniquely named `fais_test_*` database. Browser tests use the labeled demo account and a separate `browser-<timestamp>@test.local` QA account. Named browser fixtures were removed from the demo account after testing; the final screenshots show its clean seeded state.

## Responsive and visual review

The browser checked page-level horizontal overflow at **320, 375, 390, 768, 1024, 1366 and 1920 pixels**, on eight routes: landing, Today, tasks, routines, calendar, statistics, activity and settings. All 56 width/route combinations passed. Actual screenshots in `docs/screenshots` were captured from Chrome; desktop and mobile outputs were visually inspected. Mobile full-page screenshots show fixed navigation at the captured viewport edge, as expected.

Fixes found during verification:

- Removed a one-pixel narrow-screen overflow from the landing sticker.
- Corrected the routine board path to snake between desktop rows.
- Added an explicit textarea label association.
- Cleared the expired client CSRF token after logout, enabling a fresh login or registration.
- Changed month navigation to select month mode when switching from the weekly statistics view.
- Ensured startup awaits database indexes before serving requests.
- Kept Asia/Kolkata available in timezone settings even when the browser lists its Asia/Calcutta alias; verified a change to Europe/London survives refresh and can be restored.
- Calendar now distinguishes routine fills from task completion counts and includes undated tasks completed on the selected date. The calendar regression uses an isolated `calendar-<timestamp>@test.local` account. Production build passed after this fix.

## Presentation verification

- Exactly **16 slides**, in the brief's prescribed order, with editable text, an editable native block diagram, actual app screenshots and speaker notes.
- PPTX package, geometry and font checks passed with zero findings; first-party reimport passed with 16 slides.
- Every slide was rendered and visually inspected. This is not a claim of opening it in Microsoft PowerPoint.
- Matching PDF: exactly **16 pages**, 16:9.
- Handout: exactly **4 A4 landscape pages**, with four slides per page in left-to-right, top-to-bottom order. All handout pages were rendered and visually inspected.
- PDFs preserve the checked slide appearance as high-resolution rendered images. Edit text and diagrams in the PPTX.
- Academic identity fields intentionally remain placeholders until actual student/college/guide details are supplied.

## Remaining limitations

- No production deployment, real-device Safari/Firefox testing, load testing, or guaranteed transactional audit history.
- No mood journal, native Android client/widgets, notifications, shared teams, email verification/password reset or full offline sync.
- Existing idle pages may need refresh after local midnight.
- Task/routine list queries target small personal workloads; large-account pagination and reporting aggregation would be future improvements.
- A tab-close warning is browser-controlled and cannot guarantee unsaved delivery.
- Git identity is not configured on this machine. Source and the dependency lockfile are saved, but no Git commit was created.

Calendar blue-bar refinement: build and all 8 existing tests passed. The calendar browser regression verified 1/2 tasks produces a 50% blue bar, 2/2 produces 100%, and a task scheduled and due on the same day is counted once. All seven responsive widths passed; the mobile screenshot was visually inspected.
