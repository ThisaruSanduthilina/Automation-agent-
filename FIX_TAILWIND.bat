@echo off
echo ========================================
echo    FIXING TAILWIND CSS CONFIGURATION
echo ========================================
echo.

echo Step 1: Stopping any running dev servers...
echo Please press Ctrl+C in any terminal running npm run dev
echo.
pause

echo Step 2: Deleting .next cache...
if exist .next (
    rmdir /s /q .next
    echo Cache deleted successfully
) else (
    echo No cache found
)
echo.

echo Step 3: Deleting node cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo Node cache deleted
)
echo.

echo Step 4: Reinstalling Tailwind CSS...
call npm uninstall tailwindcss postcss autoprefixer
call npm install -D tailwindcss@latest postcss@latest autoprefixer@latest
echo.

echo Step 5: Reinitializing Tailwind...
call npx tailwindcss init -p
echo.

echo Step 6: Tailwind config will be overwritten. Press any key to continue...
pause
echo.

echo Step 7: Starting dev server on port 3008...
echo.
echo Frontend will be available at: http://localhost:3008
echo After it starts, press Ctrl+Shift+R in your browser to hard refresh
echo.
npm run dev
