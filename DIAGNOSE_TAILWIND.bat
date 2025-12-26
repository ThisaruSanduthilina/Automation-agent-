@echo off
echo ========================================
echo   TAILWIND CSS DIAGNOSTIC TOOL
echo ========================================
echo.

echo [1] Checking configuration files...
echo.
if exist tailwind.config.js (
    echo [OK] tailwind.config.js exists
    echo Content:
    type tailwind.config.js | findstr /N "content:"
) else (
    echo [FAIL] tailwind.config.js NOT FOUND
)
echo.

if exist postcss.config.js (
    echo [OK] postcss.config.js exists
    echo Content:
    type postcss.config.js
) else (
    echo [FAIL] postcss.config.js NOT FOUND
)
echo.

if exist app\globals.css (
    echo [OK] app\globals.css exists
    echo First 5 lines:
    more +0 app\globals.css | findstr /N "@tailwind"
) else (
    echo [FAIL] app\globals.css NOT FOUND
)
echo.

echo [2] Checking Tailwind installation...
if exist node_modules\tailwindcss\package.json (
    echo [OK] Tailwind is installed
    type node_modules\tailwindcss\package.json | findstr /C:"\"version\""
) else (
    echo [FAIL] Tailwind NOT installed
)
echo.

if exist node_modules\postcss\package.json (
    echo [OK] PostCSS is installed
    type node_modules\postcss\package.json | findstr /C:"\"version\""
) else (
    echo [FAIL] PostCSS NOT installed
)
echo.

if exist node_modules\autoprefixer\package.json (
    echo [OK] Autoprefixer is installed
    type node_modules\autoprefixer\package.json | findstr /C:"\"version\""
) else (
    echo [FAIL] Autoprefixer NOT installed
)
echo.

echo [3] Checking page files for Tailwind classes...
echo.
if exist app\register\page.tsx (
    echo [CHECK] app\register\page.tsx
    type app\register\page.tsx | findstr /C:"className=" | more +0
)
echo.

echo [4] Checking package.json dependencies...
type package.json | findstr /C:"tailwindcss" /C:"postcss" /C:"autoprefixer"
echo.

echo [5] Testing Tailwind CLI...
echo Running: npx tailwindcss --version
npx tailwindcss --version
echo.

echo [6] Checking for conflicting CSS files...
dir /b /s *.css | findstr /V "node_modules"
echo.

echo ========================================
echo   DIAGNOSTIC COMPLETE
echo ========================================
echo.
echo Next steps:
echo 1. Review the output above for any [FAIL] messages
echo 2. If all checks pass, run FORCE_TAILWIND_REBUILD.bat
echo 3. Visit http://localhost:3008/test-tailwind to verify
echo.
pause
