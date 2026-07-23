#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${APP_KEY:-}" ]]; then
  echo "ERROR: APP_KEY is not set. Run: php artisan key:generate --show"
  exit 1
fi

if [[ "${DB_CONNECTION:-}" == "mysql" && -z "${DB_HOST:-}" ]]; then
  echo "ERROR: DB_HOST is not set. Link the MySQL service variables."
  exit 1
fi

chmod -R ug+rwx storage bootstrap/cache 2>/dev/null || true

php artisan config:clear
php artisan migrate --force --no-interaction

exec php artisan serve --host=0.0.0.0 --port="${PORT:?}"
