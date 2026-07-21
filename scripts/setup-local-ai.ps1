$ErrorActionPreference = 'Stop'
$project = Split-Path -Parent $PSScriptRoot
$runtime = Join-Path $project '.local-ai'
$venv = Join-Path $runtime '.venv'
$python = Join-Path $venv 'Scripts\python.exe'
$cache = Join-Path $runtime 'model-cache'

function Test-Python312 {
  param(
    [Parameter(Mandatory = $true)][string]$Executable,
    [string[]]$PrefixArguments = @()
  )
  try {
    $version = & $Executable @PrefixArguments -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")' 2>$null
    return (($version | Select-Object -Last 1).Trim() -eq '3.12')
  } catch {
    return $false
  }
}

if (-not (Test-Path -LiteralPath $python)) {
  $bootstrap = $null
  $bootstrapArguments = @()

  if ($env:SOUL_PICS_PYTHON -and (Test-Path -LiteralPath $env:SOUL_PICS_PYTHON) -and (Test-Python312 -Executable $env:SOUL_PICS_PYTHON)) {
    $bootstrap = $env:SOUL_PICS_PYTHON
  } else {
    $launcher = Get-Command py -ErrorAction SilentlyContinue
    if ($launcher -and (Test-Python312 -Executable $launcher.Source -PrefixArguments @('-3.12'))) {
      $bootstrap = $launcher.Source
      $bootstrapArguments = @('-3.12')
    } else {
      $pythonCommand = Get-Command python -ErrorAction SilentlyContinue
      if ($pythonCommand -and (Test-Python312 -Executable $pythonCommand.Source)) {
        $bootstrap = $pythonCommand.Source
      }
    }
  }

  if (-not $bootstrap) {
    throw 'Python 3.12 was not found. Install Python 3.12 with Python Launcher, or set SOUL_PICS_PYTHON to the full path of python.exe, then run setup again.'
  }

  Write-Host 'Creating the Soul Pics local AI environment...'
  & $bootstrap @bootstrapArguments -m venv $venv
}

& $python -m pip install --upgrade pip
& $python -m pip install torch==2.11.0+cu128 torchvision==0.26.0+cu128 --index-url https://download.pytorch.org/whl/cu128
& $python -m pip install -r (Join-Path $project 'local_ai\requirements.txt')
$env:SOUL_PICS_MODEL_CACHE = $cache
& $python (Join-Path $project 'local_ai\download_models.py')

Write-Host ''
Write-Host 'Local cutout setup completed. Start Soul Pics with npm run server and npm run dev.'
