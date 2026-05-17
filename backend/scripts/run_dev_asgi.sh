#!/usr/bin/env sh
# Start Daphne with local development settings (WebSockets + HTTP)
cd "$(dirname "$0")/.." || exit 1

export ENVIRONMENT=development
export DJANGO_SETTINGS_MODULE=config.settings.development

echo "Starting Daphne on http://127.0.0.1:8000 (ENVIRONMENT=development)"
exec daphne -b 127.0.0.1 -p 8000 config.asgi:application
