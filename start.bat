@echo off
ECHO Checking Node.js version...
FOR /F "tokens=* USEBACKQ" %%F IN (`node -v`) DO (
SET v=%%F
)
ECHO %v%
IF /I %v% == v8.11.4 (
    npm install && start http://localhost:3000/ & npm start
) ELSE (
    ECHO Node.js version 8.11.4 not found!
    ECHO Ensure Node.js version 8.11.4 is installed
    ECHO If you have installed the correct version, try:
    ECHO    Resinstalling Node.js
    ECHO    Manually setting the PATH variable to Node.js
    pause
)
