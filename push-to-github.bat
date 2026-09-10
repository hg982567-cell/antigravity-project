@echo off
echo ==============================================
echo Pushing DropAI complete codebase to GitHub...
echo ==============================================
cd /d "%~dp0"
git push -u origin main
echo.
echo ==============================================
echo Complete! Code has been pushed to GitHub.
echo Vercel will now automatically re-deploy your site.
echo ==============================================
pause
