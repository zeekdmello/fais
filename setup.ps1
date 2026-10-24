$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
Write-Host "Fais setup - detected Windows / $env:PROCESSOR_ARCHITECTURE"
Write-Host 'Internet is required. Run PowerShell as Administrator for system installation.'
if ((Read-Host 'Check/install tools and set up Fais? [y/N]') -notmatch '^[Yy]$') { exit }
function Refresh-Path {
  $env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')
}
function Install-Package($Id, $Version = '') {
  if (-not (Get-Command winget -ErrorAction SilentlyContinue)) { throw 'Install App Installer from Microsoft Store to enable winget, or use the manual guide in SETUP-COLLEGE.md.' }
  $arguments = @('install','--id',$Id,'--exact','--source','winget','--accept-package-agreements','--accept-source-agreements')
  if ($Version) { $arguments += @('--version',$Version) }
  & winget @arguments
  if ($LASTEXITCODE -ne 0) { throw "Installation failed for $Id. Use the manual guide, then rerun setup." }
  Refresh-Path
}
try {
  if (-not [Environment]::Is64BitOperatingSystem -or $env:PROCESSOR_ARCHITECTURE -eq 'ARM64') { throw 'Automatic Windows setup requires an x64 PC.' }
  if ([Environment]::OSVersion.Version.Build -lt 22000) { throw 'This automatic MongoDB 8 setup targets Windows 11. See the older-Windows fallback in SETUP-COLLEGE.md.' }
  $goodNode = $false
  if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = [version]((& node -p 'process.versions.node').Trim())
    $goodNode = $nodeVersion.Major -eq 24 -and $nodeVersion.Minor -ge 14
  }
  if (-not $goodNode) { Install-Package 'OpenJS.NodeJS.LTS' '24.14.0' }
  $mongo = Get-Service MongoDB -ErrorAction SilentlyContinue
  if (-not $mongo) {
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) { throw 'Install App Installer from Microsoft Store, or follow SETUP-COLLEGE.md.' }
    $versions = & winget show --id MongoDB.Server --exact --source winget --versions --accept-source-agreements
    if ($LASTEXITCODE -ne 0) { throw 'Cannot query MongoDB packages. Check internet or use the manual guide.' }
    $mongoVersion = $versions | ForEach-Object { if ($_.Trim() -match '^8\.0\.\d+$') { [version]$_.Trim() } } | Sort-Object -Descending | Select-Object -First 1
    if (-not $mongoVersion) { throw 'No MongoDB 8.0 package found. Install Community 8.0 using the official MSI, then rerun.' }
    Install-Package 'MongoDB.Server' ($mongoVersion.ToString())
    $mongo = Get-Service MongoDB -ErrorAction SilentlyContinue
  }
  if (-not $mongo) { throw 'MongoDB service is missing. Run the MongoDB MSI and select Install MongoD as a Service. See SETUP-COLLEGE.md.' }
  if ($mongo.Status -ne 'Running') { Start-Service MongoDB }
  if ((Read-Host 'Install MongoDB Compass graphical viewer? [Y/n]') -notmatch '^[Nn]$') {
    $compass = @("$env:LOCALAPPDATA\MongoDBCompass\MongoDBCompass.exe", "$env:ProgramFiles\MongoDB Compass\MongoDBCompass.exe") | Where-Object { Test-Path $_ }
    if (-not $compass) {
      & winget list --id MongoDB.Compass.Full --exact --accept-source-agreements
      if ($LASTEXITCODE -ne 0) { Install-Package 'MongoDB.Compass.Full' }
    }
  }
  & node scripts/setup/project.mjs
  if ($LASTEXITCODE -ne 0) { throw 'Project setup failed. Read the error above and SETUP-COLLEGE.md.' }
} catch { Write-Error $_; exit 1 }
