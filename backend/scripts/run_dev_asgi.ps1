# Start Daphne with local development settings (WebSockets + HTTP)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

$env:ENVIRONMENT = "development"
$env:DJANGO_SETTINGS_MODULE = "config.settings.development"

Write-Host "Starting Daphne on http://127.0.0.1:8000 (ENVIRONMENT=development)" -ForegroundColor Cyan
daphne -b 127.0.0.1 -p 8000 config.asgi:application
