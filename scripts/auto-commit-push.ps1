param (
  [string]$Message = "Auto commit and push changes"
)

Set-Location -Path $PSScriptRoot\..\
$gitStatus = git status --porcelain
if (-not $gitStatus) {
  Write-Host "No changes detected. Nothing to commit."
  exit 0
}

$changedFiles = $gitStatus -split "\r?\n" | ForEach-Object { $_.Trim() } | Where-Object { $_ }
Write-Host "Detected changed files:"
$changedFiles | ForEach-Object { Write-Host "  $_" }

git add -A
git commit -m $Message
if ($LASTEXITCODE -ne 0) {
  Write-Error "Git commit failed."
  exit $LASTEXITCODE
}

git push origin master
if ($LASTEXITCODE -ne 0) {
  Write-Error "Git push failed."
  exit $LASTEXITCODE
}

Write-Host "Changes committed and pushed successfully."