# Finish Khaleej / Liona Classified Railway staging setup.
# Requires: Node.js, one-time `railway login`, and a linked Railway project.
#
# Usage:
#   .\scripts\finish-railway-staging.ps1
#   .\scripts\finish-railway-staging.ps1 -BackendService backend -FrontendService frontend -MySqlService MySQL

param(
  [string]$BackendService = "",
  [string]$FrontendService = "",
  [string]$MySqlService = ""
)

$ErrorActionPreference = "Stop"
$env:NODE_OPTIONS = "--use-system-ca"

function Invoke-Railway {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
  & npx --yes @railway/cli@latest @Args
  if ($LASTEXITCODE -ne 0) {
    throw "Railway command failed: railway $($Args -join ' ')"
  }
}

function New-AppKey {
  $bytes = New-Object byte[] 32
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  return "base64:$([Convert]::ToBase64String($bytes))"
}

function Get-ServiceDomains {
  param([string]$Service)
  $json = Invoke-Railway @("domain", "list", "--service", $Service, "--json") 2>&1 | Out-String
  return @($json | ConvertFrom-Json)
}

function Pick-Service {
  param(
    [object[]]$Services,
    [string[]]$Hints,
    [string]$Prompt
  )
  foreach ($hint in $Hints) {
    $match = $Services | Where-Object { $_.name -match $hint }
    if ($match.Count -eq 1) { return $match[0].name }
  }
  Write-Host ""
  Write-Host $Prompt
  for ($i = 0; $i -lt $Services.Count; $i++) {
    Write-Host "  [$i] $($Services[$i].name)"
  }
  $idx = Read-Host "Enter number"
  return $Services[[int]$idx].name
}

Write-Host "=== Liona Classified — Railway staging setup ===" -ForegroundColor Cyan

try {
  Invoke-Railway @("whoami") | Out-Null
} catch {
  Write-Host "Not logged in to Railway. Opening browser for login..." -ForegroundColor Yellow
  Invoke-Railway @("login")
}

try {
  Invoke-Railway @("status") | Out-Null
} catch {
  Write-Host "Link this folder to your Railway project..." -ForegroundColor Yellow
  Invoke-Railway @("link")
}

$servicesJson = Invoke-Railway @("service", "list", "--json") 2>&1 | Out-String
$services = @($servicesJson | ConvertFrom-Json)
if ($services.Count -eq 0) {
  throw "No Railway services found in the linked project."
}

if (-not $BackendService) {
  $BackendService = Pick-Service $services @("backend", "api", "liona-classified") 'Select the BACKEND (Laravel API) service:'
}
if (-not $FrontendService) {
  $FrontendService = Pick-Service $services @("frontend", "web", "liona") 'Select the FRONTEND (React) service:'
}
if (-not $MySqlService) {
  $dbServices = $services | Where-Object { $_.name -match 'mysql|postgres|mariadb|database' -or $_.serviceType -eq 'database' }
  if ($dbServices.Count -eq 1) {
    $MySqlService = $dbServices[0].name
  } elseif ($dbServices.Count -gt 1) {
    $MySqlService = Pick-Service $dbServices @() "Select the DATABASE service:"
  } else {
    Write-Host "WARNING: No database service detected. Set MySQL variables manually in Railway." -ForegroundColor Yellow
    $MySqlService = "MySQL"
  }
}

$backendDomains = Get-ServiceDomains $BackendService
$frontendDomains = Get-ServiceDomains $FrontendService
if ($backendDomains.Count -eq 0) {
  Write-Host "Generating backend public domain..." -ForegroundColor Yellow
  Invoke-Railway @("domain", "--service", $BackendService) | Out-Null
  $backendDomains = Get-ServiceDomains $BackendService
}
if ($frontendDomains.Count -eq 0) {
  Write-Host "Generating frontend public domain..." -ForegroundColor Yellow
  Invoke-Railway @("domain", "--service", $FrontendService) | Out-Null
  $frontendDomains = Get-ServiceDomains $FrontendService
}

$backendHost = ($backendDomains | Select-Object -First 1).domain
$frontendHost = ($frontendDomains | Select-Object -First 1).domain
if (-not $backendHost -or -not $frontendHost) {
  throw "Could not resolve public domains. Add domains in Railway Settings -> Networking."
}

$apiUrl = "https://$backendHost/api/v1"
$appKey = New-AppKey

Write-Host ""
function Get-MySqlVarRef {
  param([string]$Field)
  return '$' + '{{' + $MySqlService + '.' + $Field + '}}'
}

Write-Host "Configuring backend service: $BackendService" -ForegroundColor Green
$backendVars = @{
  "APP_KEY" = $appKey
  "APP_ENV" = "staging"
  "APP_DEBUG" = "false"
  "APP_URL" = "https://$backendHost"
  "FRONTEND_URL" = "https://$frontendHost"
  "FRONTEND_PUBLIC_DOMAIN" = $frontendHost
  "SANCTUM_STATEFUL_DOMAINS" = $frontendHost
  "DB_CONNECTION" = "mysql"
  "DB_HOST" = Get-MySqlVarRef "MYSQLHOST"
  "DB_PORT" = Get-MySqlVarRef "MYSQLPORT"
  "DB_DATABASE" = Get-MySqlVarRef "MYSQLDATABASE"
  "DB_USERNAME" = Get-MySqlVarRef "MYSQLUSER"
  "DB_PASSWORD" = Get-MySqlVarRef "MYSQLPASSWORD"
}
foreach ($entry in $backendVars.GetEnumerator()) {
  Invoke-Railway @("variable", "set", "$($entry.Key)=$($entry.Value)", "--service", $BackendService, "--skip-deploys") | Out-Null
}

Write-Host "Configuring frontend service: $FrontendService" -ForegroundColor Green
$frontendVars = @{
  "VITE_API_URL" = $apiUrl
  "BACKEND_PUBLIC_DOMAIN" = $backendHost
}
foreach ($entry in $frontendVars.GetEnumerator()) {
  Invoke-Railway @("variable", "set", "$($entry.Key)=$($entry.Value)", "--service", $FrontendService, "--skip-deploys") | Out-Null
}

Write-Host "Redeploying backend and frontend..." -ForegroundColor Green
Invoke-Railway @("service", "redeploy", "--service", $BackendService, "--yes") | Out-Null
Invoke-Railway @("service", "redeploy", "--service", $FrontendService, "--yes") | Out-Null

Write-Host ""
Write-Host "=== Staging ready — open these links ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "  App (start here):  https://$frontendHost" -ForegroundColor White
Write-Host "  Login:             https://$frontendHost/auth/login" -ForegroundColor White
Write-Host "  API health:        https://$backendHost/railway-health.txt" -ForegroundColor White
Write-Host "  API root:          https://$backendHost/" -ForegroundColor White
Write-Host ""
Write-Host "Demo accounts (seeded on first backend deploy with MySQL linked):" -ForegroundColor Yellow
Write-Host "  admin@khaleej.ae / password  (admin)"
Write-Host "  aisha@khaleej.ae / password  (lister)"
Write-Host ""
Write-Host "Railway dashboard: https://railway.app/dashboard" -ForegroundColor DarkGray
