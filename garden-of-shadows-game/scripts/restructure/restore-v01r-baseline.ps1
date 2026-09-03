param(
  [switch]$ConfirmRestore
)

$ErrorActionPreference = 'Stop'

if (-not $ConfirmRestore) {
  Write-Error 'Refusing destructive restore. Re-run with -ConfirmRestore after reviewing docs/restructure/baseline/README.md.'
}

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$workspaceRoot = Split-Path -Parent $repoRoot
$source = Join-Path $workspaceRoot '.work\recovery-20260829\garden-of-shadows-game'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backup = Join-Path $workspaceRoot ('.work\pre-baseline-restore-' + $stamp + '\garden-of-shadows-game')

if (-not (Test-Path $source)) {
  Write-Error "Historical recovery snapshot not found: $source"
}

New-Item -ItemType Directory -Path $backup -Force | Out-Null

# Preserve the current tree before any overwrite. Git metadata is outside the app
# directory and is intentionally untouched.
robocopy $repoRoot $backup /MIR /XD node_modules .next dist coverage | Out-Host
if ($LASTEXITCODE -gt 7) {
  Write-Error "Backup robocopy failed with exit code $LASTEXITCODE"
}

robocopy $source $repoRoot /MIR /XD node_modules .next dist coverage | Out-Host
if ($LASTEXITCODE -gt 7) {
  Write-Error "Restore robocopy failed with exit code $LASTEXITCODE"
}

Write-Host "Restored V0.1R recovery snapshot from $source"
Write-Host "Pre-restore backup saved at $backup"
