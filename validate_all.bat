@echo off
chcp 65001 > nul
echo ==========================================================
echo VALIDATING NATIONAL ID SYSTEM
echo ==========================================================
cd ".\Somalia Identity Portal\backend"
call npx prisma format
call npx prisma validate
call npx prisma generate
call npx prisma db push --accept-data-loss
cd ..\..

echo.
echo ==========================================================
echo VALIDATING NATIONAL HEALTH SYSTEM
echo ==========================================================
cd ".\National Health Portal\backend"
call npx prisma format
call npx prisma validate
call npx prisma generate
call npx prisma db push --accept-data-loss
cd ..\..

echo.
echo ==========================================================
echo VALIDATING SOMALIA POLICE FORCE SYSTEM
echo ==========================================================
cd ".\Somalia Police Force System\backend"
call npx prisma format
call npx prisma validate
call npx prisma generate
call npx prisma db push --accept-data-loss
cd ..\..

echo.
echo ALL VALIDATIONS COMPLETED.
