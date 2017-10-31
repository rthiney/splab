@echo off

cls

set pluginListFile=update.plugin.list

if exist %pluginListFile% del %pluginListFile%

Echo "Reading installed Plugins"
Call cordova plugins > %pluginListFile%
echo.

for /F "tokens=1,2 delims= " %%a in ( %pluginListFile% ) do (
   Echo "Checking online version for %%a"

   for /F "delims=" %%I in ( 'npm info %%a version' ) do (
     Echo "Local : %%b"
     Echo "Online: %%I"
     if %%b LSS %%I Call :toUpdate %%a %~1
     :cont
     echo.
   )
)

if exist %pluginListFile% del %pluginListFile%

Exit /B

:toUpdate
Echo "Need Update !"
if '%~2' == 'autoupdate' Call :DoUpdate %~1
goto cont

:DoUpdate
Echo "Removing Plugin"
Call cordova plugin rm %~1
Echo "Adding Plugin"
Call cordova plugin add %~1
goto cont