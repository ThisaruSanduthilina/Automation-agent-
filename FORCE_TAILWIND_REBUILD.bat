@echo off
echo ========================================
echo   FORCE TAILWIND CSS REBUILD
echo ========================================
echo.
echo This will completely rebuild the frontend
echo with fresh Tailwind CSS compilation.
echo.
pause

echo Step 1: Stopping any running Next.js servers...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo [OK] Servers stopped
echo.

echo Step 2: Deleting ALL caches...
if exist .next (
    rmdir /s /q .next
    echo [OK] .next deleted
)
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo [OK] node_modules cache deleted
)
if exist .swc (
    rmdir /s /q .swc
    echo [OK] .swc cache deleted
)
echo.

echo Step 3: Verifying Tailwind configuration...
if exist tailwind.config.js (
    echo [OK] tailwind.config.js found
    type tailwind.config.js | findstr "content" >nul && echo [OK] Content paths configured
) else (
    echo [ERROR] tailwind.config.js NOT FOUND!
    pause
    exit /b 1
)

if exist postcss.config.js (
    echo [OK] postcss.config.js found
    type postcss.config.js | findstr "tailwindcss" >nul && echo [OK] Tailwind plugin configured
) else (
    echo [ERROR] postcss.config.js NOT FOUND!
    pause
    exit /b 1
)

if exist app\globals.css (
    echo [OK] globals.css found
    type app\globals.css | findstr "@tailwind" >nul && echo [OK] Tailwind directives present
) else (
    echo [ERROR] globals.css NOT FOUND!
    pause
    exit /b 1
)
echo.

echo Step 4: Verifying Tailwind installation...
if exist node_modules\tailwindcss (
    echo [OK] Tailwind CSS installed
) else (
    echo [WARNING] Tailwind not found, installing...
    npm install tailwindcss@latest postcss@latest autoprefixer@latest
)
echo.

echo Step 5: Testing Tailwind CLI...
echo Running: npx tailwindcss --help
npx tailwindcss --help >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Tailwind CLI works
) else (
    echo [ERROR] Tailwind CLI failed!
)
echo.

echo Step 6: Building Tailwind CSS manually as a test...
echo Running: npx tailwindcss -i ./app/globals.css -o ./test-output.css --minify
npx tailwindcss -i ./app/globals.css -o ./test-output.css --minify
if exist test-output.css (
    echo [OK] Tailwind compiled successfully!
    echo [INFO] Output size:
    dir test-output.css | findstr test-output.css
    del test-output.css
) else (
    echo [ERROR] Tailwind compilation failed!
    pause
)
echo.

echo Step 7: Starting Next.js dev server...
echo.
echo ========================================
echo   Frontend: http://localhost:3008
echo   Test page: http://localhost:3008/test-tailwind
echo   Press Ctrl+C to stop
echo ========================================
echo.
set NODE_ENV=development
set NODE_OPTIONS=--max-old-space-size=4096
npm run dev
