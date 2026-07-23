#!/usr/bin/env bash
# Railway runtime — must use LF line endings (see .gitattributes).
set -uo pipefail

log() {
  echo "[railway-start] $*"
}

PORT="${PORT:-8080}"
export PORT

if [[ -z "${APP_KEY:-}" ]]; then
  if [[ -n "${RAILWAY_PROJECT_ID:-}${RAILWAY_ENVIRONMENT_NAME:-}${RAILWAY_ENVIRONMENT:-}" ]]; then
    export APP_KEY="base64:$(php -r 'echo base64_encode(random_bytes(32));')"
    log "Generated APP_KEY for Railway (set APP_KEY in Variables for a stable key)."
  else
    log "ERROR: APP_KEY is not set."
    exit 1
  fi
fi

mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chmod -R ug+rwx storage bootstrap/cache 2>/dev/null || chmod -R 777 storage bootstrap/cache 2>/dev/null || true

log "PHP: $(php -r 'echo PHP_VERSION;')"
log "PWD: $(pwd)"
log "PORT: ${PORT}"

php artisan config:clear >/dev/null 2>&1 || log "config:clear skipped"

if [[ -n "${DB_HOST:-}" ]]; then
  (
    sleep 2
    log "Running migrations..."
    php artisan migrate --force --no-interaction || log "WARNING: migrations failed (server still starting)"
  ) &
fi

ROUTER="vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php"
if [[ ! -f "${ROUTER}" ]]; then
  log "ERROR: Laravel server router missing — vendor may not be installed."
  exit 1
fi

# Railway's healthcheck prober may use IPv6; binding only 0.0.0.0 leaves nothing listening on [::].
log "Starting web server on [::]:${PORT} ..."
exec php -S "[::]:${PORT}" -t public "${ROUTER}"
