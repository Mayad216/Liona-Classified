#!/usr/bin/env bash
# Railway runtime — must use LF line endings (see .gitattributes).
set -uo pipefail

log() {
  echo "[railway-start] $*"
}

API_URL="${VITE_API_URL:-}"
if [[ -z "${API_URL}" && -n "${BACKEND_PUBLIC_DOMAIN:-}" ]]; then
  API_URL="https://${BACKEND_PUBLIC_DOMAIN}/api/v1"
fi

if [[ -n "${API_URL}" ]]; then
  API_URL="${API_URL%/}"
  printf '{"apiUrl":"%s"}\n' "${API_URL}" > dist/config.json
  log "Wrote dist/config.json -> ${API_URL}"
else
  log "WARNING: Set VITE_API_URL or BACKEND_PUBLIC_DOMAIN so the app can reach the API."
fi

log "Starting static server on port ${PORT} ..."
exec npx --yes serve@14 dist -s -l "${PORT:?}"
