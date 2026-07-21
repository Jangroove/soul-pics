$ErrorActionPreference = 'Stop'
$project = Split-Path -Parent $PSScriptRoot
$workspace = Resolve-Path (Join-Path $project '..\..')
$output = Join-Path $workspace 'outputs'
$staging = Join-Path ([System.IO.Path]::GetTempPath()) ('soul-pics-submission-' + [guid]::NewGuid().ToString('N'))
$packageRoot = Join-Path $staging 'Soul_Pics_v0.7.20'
$zip = Join-Path $output 'Soul_Pics_v0.7.20_submission.zip'
$checksum = Join-Path $output 'Soul_Pics_v0.7.20_submission_SHA256.txt'

New-Item -ItemType Directory -Path $packageRoot -Force | Out-Null
New-Item -ItemType Directory -Path $output -Force | Out-Null

try {
  $excludedDirectories = @('node_modules', '.local-ai', '.git', '.codex-image-preview', 'artifacts', '__pycache__', 'work', 'handoff', 'legacy')
  $excludedFiles = @(
    'server-test.log',
    'api-billing-probe.mjs',
    'pnpm-lock.yaml',
    'docs\00_PACKAGE_INDEX_JA.md',
    'docs\01_INSTALL_GUIDE_JA.md',
    'docs\02_USER_GUIDE_JA.md',
    'docs\03_PROJECT_SPEC_JA.md',
    'docs\04_BILINGUAL_DELIVERY_PLAN.md',
    'submission\API_TEST_PLAN_2026-07-21.md'
  )
  Get-ChildItem -LiteralPath $project -File -Recurse | ForEach-Object {
    $relative = $_.FullName.Substring($project.Length).TrimStart('\')
    $parts = $relative -split '[\\/]'
    if ($parts | Where-Object { $_ -in $excludedDirectories }) { return }
    if ($relative -in $excludedFiles) { return }
    if ($_.Name -eq '.env' -or ($_.Name -like '.env.*' -and $_.Name -ne '.env.example')) { return }
    $destination = Join-Path $packageRoot $relative
    New-Item -ItemType Directory -Path (Split-Path -Parent $destination) -Force | Out-Null
    Copy-Item -LiteralPath $_.FullName -Destination $destination
  }

  if (Test-Path -LiteralPath $zip) { Remove-Item -LiteralPath $zip }
  Compress-Archive -LiteralPath $packageRoot -DestinationPath $zip -CompressionLevel Optimal
  $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $zip).Hash
  Set-Content -LiteralPath $checksum -Encoding ascii -Value "$hash  Soul_Pics_v0.7.20_submission.zip"
  Write-Host $zip
  Write-Host $checksum
} finally {
  $resolvedTemp = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
  $resolvedStaging = [System.IO.Path]::GetFullPath($staging)
  if ($resolvedStaging.StartsWith($resolvedTemp, [System.StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $resolvedStaging)) {
    Remove-Item -LiteralPath $resolvedStaging -Recurse -Force
  }
}
