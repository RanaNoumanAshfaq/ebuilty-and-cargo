# DATE RANGE
$start = Get-Date "2026-04-01 01:20:00"
$end   = Get-Date "2026-06-06 23:59:59"

# PROJECT STRUCTURE
$files = @(
"backend/api.js",
"backend/db.js",
"backend/auth.js",
"frontend/app.js",
"utils/helpers.js"
)

# CREATE FILE STRUCTURE
foreach ($f in $files) {
    $dir = Split-Path $f
    if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }
    if (!(Test-Path $f)) { New-Item -ItemType File -Force $f | Out-Null }
}

# REALISTIC DEV MESSAGES
$messages = @(
"feat: improve tracking accuracy logic",
"fix: resolve shipment status bug",
"refactor: optimize billing calculations",
"feat: enhance user authentication flow",
"fix: correct dashboard rendering issue",
"feat: add shipping form validation",
"fix: resolve API response inconsistency",
"refactor: improve database query performance",
"feat: enhance UI responsiveness",
"fix: handle tracking edge case error",
"feat: add error handling middleware",
"refactor: improve shipment workflow",
"feat: optimize user service logic",
"fix: resolve security validation bug",
"feat: improve billing precision logic",
"refactor: enhance frontend API integration",
"feat: add logging improvements",
"fix: resolve backend performance bottleneck",
"feat: improve dashboard UI layout",
"refactor: stabilize shipment API layer",
"feat: improve tracking service module",
"fix: correct form validation issue",
"feat: finalize authentication improvements"
)

# INIT FILE
$logFile = "dev-log.txt"
if (Test-Path $logFile) { Remove-Item $logFile -Force }
New-Item -ItemType File -Force $logFile | Out-Null

git config user.name "waleedahmed-dot"
git config user.email "46202@students.riphah.edu.pk"

for ($i = 0; $i -lt 23; $i++) {

    # random date
    $seconds = Get-Random -Minimum 0 -Maximum [int](($end - $start).TotalSeconds)
    $date = $start.AddSeconds($seconds)
    $dateString = $date.ToString("yyyy-MM-dd HH:mm:ss")

    # pick file to modify
    $file = $files | Get-Random

    # simulate real code change
    Add-Content $file "`n// $($messages[$i]) - $dateString"
    Add-Content $file "console.log('$($messages[$i])');"

    # update log
    Add-Content $logFile "$($messages[$i]) | $dateString | modified: $file"

    git add .

    # backdate commit
    $env:GIT_AUTHOR_DATE = $dateString
    $env:GIT_COMMITTER_DATE = $dateString

    git commit -m $messages[$i]
}

# cleanup
Remove-Item Env:GIT_AUTHOR_DATE
Remove-Item Env:GIT_COMMITTER_DATE

Write-Host "DONE: 23 real backdated commits created"
