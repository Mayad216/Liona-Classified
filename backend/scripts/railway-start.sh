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
export APP_DEBUG="${APP_DEBUG:-false}"

mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chmod -R ug+rwx storage bootstrap/cache 2>/dev/null || chmod -R 777 storage bootstrap/cache 2>/dev/null || true

log "PHP: $(php -r 'echo PHP_VERSION;')"
log "APP_URL: ${APP_URL:-unset}"
log "FRONTEND_URL: ${FRONTEND_URL:-unset}"
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

if [[ -n "${DB_HOST:-}" ]]; then
  (
    sleep 2
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
      log "WARNING: migrations failed (server still starting)"
    fi
  ) &
fi

ROUTER="vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php"
if [[ ! -f "${ROUTER}" ]]; then
  log "ERROR: Laravel server router missing — vendor may not be installed."
  exit 1
fi

log "Starting web server on [::]:${PORT} ..."
exec php -S "[::]:${PORT}" -t public "${ROUTER}"
