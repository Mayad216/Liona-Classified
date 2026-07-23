#!/usr/bin/env bash
# Railway runtime — must use LF line endings (see .gitattributes).
set -uo pipefail

log() {
  echo "[railway-start] $*"
}

on_railway() {
  [[ -n "${RAILWAY_PROJECT_ID:-}${RAILWAY_ENVIRONMENT_NAME:-}${RAILWAY_ENVIRONMENT:-}" ]]
}

PORT="${PORT:-8080}"
export PORT

if [[ -z "${APP_KEY:-}" ]]; then
  if on_railway; then
    export APP_KEY="base64:$(php -r 'echo base64_encode(random_bytes(32));')"
    log "Generated APP_KEY for Railway (set APP_KEY in Variables for a stable key)."
  else
    log "ERROR: APP_KEY is not set."
    exit 1
  fi
fi

if [[ -n "${RAILWAY_PUBLIC_DOMAIN:-}" ]]; then
  export APP_URL="${APP_URL:-https://${RAILWAY_PUBLIC_DOMAIN}}"
fi

if [[ -n "${FRONTEND_PUBLIC_DOMAIN:-}" ]]; then
  export FRONTEND_URL="${FRONTEND_URL:-https://${FRONTEND_PUBLIC_DOMAIN}}"
fi

if [[ -z "${SANCTUM_STATEFUL_DOMAINS:-}" && -n "${FRONTEND_PUBLIC_DOMAIN:-}" ]]; then
  export SANCTUM_STATEFUL_DOMAINS="${FRONTEND_PUBLIC_DOMAIN}"
elif [[ -z "${SANCTUM_STATEFUL_DOMAINS:-}" && -n "${FRONTEND_URL:-}" ]]; then
  export SANCTUM_STATEFUL_DOMAINS="$(echo "${FRONTEND_URL}" | sed -E 's#^https?://##; s#/.*##')"
fi

export APP_ENV="${APP_ENV:-staging}"
export APP_DEBUG="${APP_DEBUG:-true}"
export SESSION_DRIVER="${SESSION_DRIVER:-file}"
export CACHE_STORE="${CACHE_STORE:-file}"
export QUEUE_CONNECTION="${QUEUE_CONNECTION:-sync}"

# Normalize Railway / plugin MySQL variable names.
[[ -n "${MYSQL_URL:-}" && -z "${DB_URL:-}" ]] && export DB_URL="${MYSQL_URL}"
[[ -n "${MYSQLHOST:-}" && -z "${DB_HOST:-}" ]] && export DB_HOST="${MYSQLHOST}"
[[ -n "${MYSQLPORT:-}" && -z "${DB_PORT:-}" ]] && export DB_PORT="${MYSQLPORT}"
[[ -n "${MYSQLDATABASE:-}" && -z "${DB_DATABASE:-}" ]] && export DB_DATABASE="${MYSQLDATABASE}"
[[ -n "${MYSQLUSER:-}" && -z "${DB_USERNAME:-}" ]] && export DB_USERNAME="${MYSQLUSER}"
[[ -n "${MYSQLPASSWORD:-}" && -z "${DB_PASSWORD:-}" ]] && export DB_PASSWORD="${MYSQLPASSWORD}"

if on_railway; then
  export DB_CONNECTION=mysql
elif [[ -n "${DB_URL:-}" || -n "${DB_HOST:-}" ]]; then
  export DB_CONNECTION="${DB_CONNECTION:-mysql}"
fi

mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chmod -R ug+rwx storage bootstrap/cache 2>/dev/null || chmod -R 777 storage bootstrap/cache 2>/dev/null || true

log "PHP: $(php -r 'echo PHP_VERSION;')"
log "APP_URL: ${APP_URL:-unset}"
log "FRONTEND_URL: ${FRONTEND_URL:-unset}"
log "DB_CONNECTION: ${DB_CONNECTION:-unset}"
log "DB_HOST: ${DB_HOST:-unset}"
log "DB_DATABASE: ${DB_DATABASE:-unset}"
log "DB_URL set: $( [[ -n "${DB_URL:-}" ]] && echo yes || echo no )"
log "SESSION_DRIVER: ${SESSION_DRIVER}"
log "PORT: ${PORT}"

php artisan config:clear >/dev/null 2>&1 || log "config:clear skipped"

database_ready() {
  php -r "
    require 'vendor/autoload.php';
    \$app = require 'bootstrap/app.php';
    \$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
    if (!Illuminate\Support\Facades\Schema::hasTable('users')) {
      echo 'empty';
      exit(0);
    }
    echo Illuminate\Support\Facades\DB::table('users')->exists() ? 'seeded' : 'empty';
  " 2>/dev/null || echo "unknown"
}

if [[ -n "${DB_URL:-}" || -n "${DB_HOST:-}" ]]; then
  log "Waiting for database..."
  sleep 5
  log "Running migrations..."
  if php artisan migrate --force --no-interaction; then
    log "Migrations complete."
    state="$(database_ready)"
    if [[ "${state}" == "empty" ]]; then
      log "Seeding database (first run)..."
      php artisan db:seed --force --no-interaction && log "Seed complete." || log "WARNING: seed failed"
    else
      log "Database already seeded (${state})."
    fi
  else
    log "ERROR: migrations failed — verify MySQL service is linked to this backend service."
  fi
elif on_railway; then
  log "ERROR: No MySQL configured. Add these backend Variables (use Railway reference picker):"
  log "  DB_CONNECTION=mysql"
  log "  DB_HOST=\${{MySQL.MYSQLHOST}}"
  log "  DB_PORT=\${{MySQL.MYSQLPORT}}"
  log "  DB_DATABASE=\${{MySQL.MYSQLDATABASE}}"
  log "  DB_USERNAME=\${{MySQL.MYSQLUSER}}"
  log "  DB_PASSWORD=\${{MySQL.MYSQLPASSWORD}}"
  log "Or set DB_URL=\${{MySQL.MYSQL_URL}}"
  log "Without MySQL, the API uses SQLite and tables like listings do not exist."
fi

log "Starting web server on [::]:${PORT} ..."
cd public || exit 1
exec php -S "[::]:${PORT}" ../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php
