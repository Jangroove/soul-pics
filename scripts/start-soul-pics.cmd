@echo off
setlocal
cd /d "%~dp0.."
start "Soul Pics API" cmd /k npm.cmd run server
start "Soul Pics UI" cmd /k npm.cmd run dev
echo Soul Pics is starting. Open http://127.0.0.1:5173/ after both windows are ready.
endlocal
