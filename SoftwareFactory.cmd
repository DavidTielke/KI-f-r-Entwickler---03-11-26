@echo off
rem Startet die Software Factory auf diesem Rechner und oeffnet sie im Browser.
cd /d "%~dp0code\factory"
if not exist node_modules call npm install --no-audit --no-fund
call npm run build
start "" http://localhost:4000
node server\index.js
