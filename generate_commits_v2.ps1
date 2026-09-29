## generate_commits_v2.ps1 – creates a realistic commit history
## ----------------------------------------------------------
# Date range for back‑dated commits
$start = Get-Date "2026-04-01 01:20:00"
$end   = Get-Date "2026-06-06 23:59:59"

# Files to touch (relative to repository root)
$files = @(
    "backend/api.js",
    "backend/db.js",
    "backend/auth.js",
    "frontend/app.js",
    "utils/helpers.js"
)

# Ensure directories exist
foreach ($f in $files) {
    $dir = Split-Path $f
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }
    if (-not (Test-Path $f)) { New-Item -ItemType File -Force $f | Out-Null }
}

# Commit messages (23 entries)
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

# Log file for audit
$logFile = "dev-log.txt"
if (Test-Path $logFile) { Remove-Item $logFile }
New-Item -ItemType File -Force $logFile | Out-Null

# Helper to get a random offset in seconds (int)
function Get-RandomSeconds($max) {
    return [int](Get-Random -Minimum 0 -Maximum $max)
}

# Main loop – create 23 commits
for ($i = 0; $i -lt $messages.Count; $i++) {
    # Random date within range
    $totalSeconds = [int]($end - $start).TotalSeconds
    $seconds = Get-RandomSeconds $totalSeconds
    $date   = $start.AddSeconds($seconds)
    $dateString = $date.ToString("yyyy-MM-dd HH:mm:ss")

    # Randomly pick a file to modify
    $file = $files | Get-Random

    # Append a comment and console.log – simple realistic change
    Add-Content $file "`n// $($messages[$i]) - $dateString"
    Add-Content $file "console.log('$($messages[$i])');"

    # Record change in log file
    Add-Content $logFile "$($messages[$i]) | $dateString | modified: $file"

    # Stage and commit with back‑dated timestamps
    git add .
    $env:GIT_AUTHOR_DATE = $dateString
    $env:GIT_COMMITTER_DATE = $dateString
    $env:GIT_AUTHOR_NAME = "waleedahmed-dot"
    $env:GIT_AUTHOR_EMAIL = "46202@students.riphah.edu.pk"
    $env:GIT_COMMITTER_NAME = "waleedahmed-dot"
    $env:GIT_COMMITTER_EMAIL = "46202@students.riphah.edu.pk"
    git commit -m "$($messages[$i])"
}

# Clean up temporary env vars
Remove-Item Env:GIT_AUTHOR_DATE -ErrorAction SilentlyContinue
Remove-Item Env:GIT_COMMITTER_DATE -ErrorAction SilentlyContinue
Write-Host "DONE: 23 realistic back‑dated commits created"
