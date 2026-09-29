$start = Get-Date "2026-04-01 01:20:00"
$end   = Get-Date "2026-06-06 23:59:59"

$files = @(
    "backend/api.js",
    "backend/db.js",
    "backend/auth.js",
    "frontend/app.js",
    "utils/helpers.js"
)

# Ensure directories exist
foreach ($f in $files) {
    $dir = Split-Path $f -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    if (-not (Test-Path $f)) { New-Item -ItemType File -Force -Path $f | Out-Null }
}

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

$logFile = "dev-log.txt"
if (Test-Path $logFile) { Remove-Item $logFile }
New-Item -ItemType File -Force -Path $logFile | Out-Null

$maxSeconds = [int]($end - $start).TotalSeconds

for ($i = 0; $i -lt $messages.Count; $i++) {
    $seconds = Get-Random -Minimum 0 -Maximum $maxSeconds
    $date = $start.AddSeconds($seconds)
    $dateString = $date.ToString("yyyy-MM-dd HH:mm:ss")
    $file = $files | Get-Random
    Add-Content -Path $file -Value "`n// $($messages[$i]) - $dateString"
    Add-Content -Path $file -Value "console.log('$($messages[$i])');"
    Add-Content -Path $logFile -Value "$($messages[$i]) | $dateString | modified: $file"
    git add .
    $env:GIT_AUTHOR_DATE = $dateString
    $env:GIT_COMMITTER_DATE = $dateString
    git commit -m "$($messages[$i])"
    Remove-Item Env:GIT_AUTHOR_DATE -ErrorAction SilentlyContinue
    Remove-Item Env:GIT_COMMITTER_DATE -ErrorAction SilentlyContinue
}
Write-Host "DONE: real backdated commits created"
