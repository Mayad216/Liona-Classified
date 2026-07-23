#!/usr/bin/env bash
set -euo pipefail

log() {
  echo "[railway-start] $*"
}

if [[ -z "${APP_KEY:-}" ]]; then
  if [[ "${ALLOW_EPHEMERAL_APP_KEY:-}" == "true" ]]; then
    export APP_KEY="base64:$(php -r 'echo base64_encode(random_bytes(32));')"
    log "WARNING: Generated ephemeral APP_KEY (set APP_KEY in Railway for stable sessions)."
  else
    log "ERROR: APP_KEY is not set."
    log "Add APP_KEY in Railway variables, or set ALLOW_EPHEMERAL_APP_KEY=true for staging."
    exit 1
  fi
fi

if [[ "${DB_CONNECTION:-}" == "mysql" && -z "${DB_HOST:-}" ]]; then
  log "WARNING: DB_CONNECTION=mysql but DB_HOST is empty. Skipping migrations."
  log "Link MySQL service variables: DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD."
fi

chmod -R ug+rwx storage bootstrap/cache 2>/dev/null || true

log "Clearing config cache..."
php artisan config:clear

run_migrations() {
  sleep 2
  log "Running migrations..."
  if php artisan migrate --force --no-interaction; then
    log "Migrations complete."
  else
    log "WARNING: Migrations failed. Server is running; verify MySQL variables and service link."
  fi
}

if [[ -n "${DB_HOST:-}" ]]; then
  run_migrations &
fi

log "Starting HTTP server on 0.0.0.0:${PORT}..."
exec php artisan serve --host=0.0.0.0 --port="${PORT:?}"
