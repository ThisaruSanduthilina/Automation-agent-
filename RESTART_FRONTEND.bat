@echo off
echo ========================================
echo   RESTARTING FRONTEND WITH TAILWIND
echo ========================================
echo.

echo Step 1: Deleting .next directory...
if exist .next (
    rmdir /s /q .next
    echo [OK] .next directory deleted
) else (
    echo [SKIP] .next directory not found
)
echo.

echo Step 2: Deleting node_modules/.cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo [OK] Cache deleted
) else (
    echo [SKIP] Cache not found
)
echo.

echo Step 3: Clearing Tailwind cache...
if exist node_modules\.cache\tailwindcss (
    rmdir /s /q node_modules\.cache\tailwindcss
    echo [OK] Tailwind cache cleared
) else (
    echo [SKIP] Tailwind cache not found
)
echo.

echo Step 4: Verifying Tailwind configuration...
if exist tailwind.config.js (
    echo [OK] tailwind.config.js found
) else (
    echo [ERROR] tailwind.config.js not found!
)
if exist postcss.config.js (
    echo [OK] postcss.config.js found
) else (
    echo [ERROR] postcss.config.js not found!
)
echo.

echo Step 5: Starting Next.js dev server on port 3008...
echo.
echo ========================================
echo   Frontend: http://localhost:3008
echo   Press Ctrl+C to stop
echo ========================================
echo.
set NODE_OPTIONS=--max-old-space-size=4096
npm run dev
