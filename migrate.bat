@echo off
echo Migrating media from PC to Lenovo (Z:)...
robocopy D:\ktltc\public Z:\ /E /MOVE /NP /R:3 /W:3 /XF .gitkeep
echo.
echo Migration finished! Please check if your files are on Z: drive.
pause
