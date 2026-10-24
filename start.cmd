@echo off
cd /d "%~dp0"
echo Open http://127.0.0.1:4000 once Fais is ready. Keep this window open.
call npm.cmd start
pause
