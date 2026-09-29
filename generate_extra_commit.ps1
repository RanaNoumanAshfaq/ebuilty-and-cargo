# PowerShell script to add an extra dummy commit for waleedahmed-dot
# Ensure working directory is the repository root
$repoRoot = "C:\ebuilty-and-cargo-main"
Set-Location $repoRoot

# File to modify (choose an existing file)
$file = "utils/helpers.js"
if (!(Test-Path $file)) {
    New-Item -ItemType File -Force $file | Out-Null
}

# Append a dummy comment with timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Add-Content $file "\n// extra dummy commit added on $timestamp"
Add-Content $file "console.log('extra dummy commit $timestamp');"

# Stage and commit as waleedahmed-dot
git add $file
$env:GIT_AUTHOR_NAME = "waleedahmed-dot"
$env:GIT_AUTHOR_EMAIL = "46202@students.riphah.edu.pk"
$env:GIT_COMMITTER_NAME = "waleedahmed-dot"
$env:GIT_COMMITTER_EMAIL = "46202@students.riphah.edu.pk"
# Use current time for author/committer dates
git commit -m "chore: add extra dummy commit for waleedahmed-dot"
