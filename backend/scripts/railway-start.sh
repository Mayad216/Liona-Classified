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
[[ -n "${DATABASE_URL:-}" && -z "${DB_URL:-}" ]] && export DB_URL="${DATABASE_URL}"
[[ -n "${MYSQL_URL:-}" && -z "${DB_URL:-}" ]] && export DB_URL="${MYSQL_URL}"
[[ -n "${MYSQLURL:-}" && -z "${DB_URL:-}" ]] && export DB_URL="${MYSQLURL}"
[[ -n "${MYSQLHOST:-}" && -z "${DB_HOST:-}" ]] && export DB_HOST="${MYSQLHOST}"
[[ -n "${MYSQL_HOST:-}" && -z "${DB_HOST:-}" ]] && export DB_HOST="${MYSQL_HOST}"
[[ -n "${MYSQLPORT:-}" && -z "${DB_PORT:-}" ]] && export DB_PORT="${MYSQLPORT}"
[[ -n "${MYSQL_PORT:-}" && -z "${DB_PORT:-}" ]] && export DB_PORT="${MYSQL_PORT}"
[[ -n "${MYSQLDATABASE:-}" && -z "${DB_DATABASE:-}" ]] && export DB_DATABASE="${MYSQLDATABASE}"
[[ -n "${MYSQL_DATABASE:-}" && -z "${DB_DATABASE:-}" ]] && export DB_DATABASE="${MYSQL_DATABASE}"
[[ -n "${MYSQLUSER:-}" && -z "${DB_USERNAME:-}" ]] && export DB_USERNAME="${MYSQLUSER}"
[[ -n "${MYSQL_USER:-}" && -z "${DB_USERNAME:-}" ]] && export DB_USERNAME="${MYSQL_USER}"
[[ -n "${MYSQLPASSWORD:-}" && -z "${DB_PASSWORD:-}" ]] && export DB_PASSWORD="${MYSQLPASSWORD}"
[[ -n "${MYSQL_PASSWORD:-}" && -z "${DB_PASSWORD:-}" ]] && export DB_PASSWORD="${MYSQL_PASSWORD}"
[[ -n "${MYSQL_ROOT_PASSWORD:-}" && -z "${DB_PASSWORD:-}" ]] && export DB_PASSWORD="${MYSQL_ROOT_PASSWORD}"

if on_railway; then
  export DB_CONNECTION=mysql
elif [[ -n "${DB_URL:-}" || -n "${DB_HOST:-}" ]]; then
  export DB_CONNECTION="${DB_CONNECTION:-mysql}"
fi

mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chmod -R ug+rwx storage bootstrap/cache 2>/dev/null || chmod -R 777 storage bootstrap/cache 2>/dev/null || true

log "PHP: $(php -r 'echo PHP_VERSION;')"
log "APP_URL: ${APP_URL:-unset}"
log "DB_CONNECTION: ${DB_CONNECTION:-unset}"
log "DB_HOST: ${DB_HOST:-unset}"
log "DB_PORT: ${DB_PORT:-unset}"
log "DB_DATABASE: ${DB_DATABASE:-unset}"
log "DB_URL set: $( [[ -n "${DB_URL:-}" ]] && echo yes || echo no )"
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

has_mysql_config() {
  [[ -n "${DB_URL:-}" || -n "${DB_HOST:-}" || -n "${MYSQLHOST:-}" || -n "${MYSQL_HOST:-}" ]]
}

db_connect_ok=false

if has_mysql_config; then
  if [[ "${DB_HOST:-}" == "127.0.0.1" || "${DB_HOST:-}" == "localhost" ]] && [[ -z "${DB_URL:-}" ]]; then
    log "ERROR: DB_HOST is ${DB_HOST:-empty} with no DB_URL — Laravel connects to localhost and gets 'Connection refused'."
    log "Fix: backend Variables → Add Reference → MySQL → MYSQL_URL as DB_URL"
  fi

  log "Waiting for MySQL (up to 60s)..."
  if php scripts/wait-for-db.php; then
    db_connect_ok=true
    log "Running migrations..."
    if php artisan migrate --force --no-interaction; then
      log "Migrations complete."
      state="$(database_ready)"
      if [[ "${state}" == "empty" ]]; then
        log "Seeding database..."
        php artisan db:seed --force --no-interaction && log "Seed complete." || log "WARNING: seed failed"
      else
        log "Database already seeded (${state})."
      fi
    else
      log "ERROR: migrations failed."
      db_connect_ok=false
    fi
  else
    log "ERROR: could not connect to MySQL. Ensure:"
    log "  1) MySQL service is running in the SAME Railway project/environment"
    log "  2) Backend has DB_URL=\${{MySQL.MYSQL_URL}} (use Variable Reference, not typed localhost)"
    log "  3) Redeploy backend AFTER MySQL finishes provisioning"
  fi
elif on_railway; then
  log "ERROR: No MySQL configured on backend service."
  log "Add Variable Reference: DB_URL=\${{MySQL.MYSQL_URL}} (replace MySQL with your DB service name)"
fi

if on_railway && [[ "${db_connect_ok}" != "true" ]]; then
  log "Refusing to start API without a working MySQL connection."
  exit 1
fi

log "Starting web server on [::]:${PORT} ..."
cd public || exit 1
exec php -S "[::]:${PORT}" ../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php
