#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ "${STOP_FIRST:-0}" = "1" ]; then
  echo "[start-lite] Stopping first..."
  "$ROOT/scripts/stop.sh" || true
fi

is_free() { ! lsof -ti :"$1" >/dev/null 2>&1; }

FE_PORT="${FRONTEND_PORT:-}"
if [ -z "$FE_PORT" ]; then
  if is_free 5173; then FE_PORT=5173
  elif is_free 5174; then FE_PORT=5174
  else FE_PORT=5175
  fi
fi

API_PORT="${API_PORT:-3117}"
BFF_PORT="${BFF_PORT:-4117}"

if ! is_free "$API_PORT"; then
  if [ "${AUTO_KILL:-0}" = "1" ]; then
    echo "[start-lite] Port $API_PORT busy. Killing..."
    lsof -ti :"$API_PORT" | xargs -r kill -9 || true
  else
    echo "[start-lite] Note: port $API_PORT is busy. Consider STOP_FIRST=1 or AUTO_KILL=1."
  fi
fi

if ! is_free "$BFF_PORT"; then
  if [ "${AUTO_KILL:-0}" = "1" ]; then
    echo "[start-lite] Port $BFF_PORT busy. Killing..."
    lsof -ti :"$BFF_PORT" | xargs -r kill -9 || true
  else
    echo "[start-lite] Note: port $BFF_PORT is busy. Consider STOP_FIRST=1 or AUTO_KILL=1."
  fi
fi

export FRONTEND_PORT="$FE_PORT"
export API_PORT
export BFF_PORT
export VITE_API_BASE="${VITE_API_BASE:-http://localhost:$API_PORT}"

echo "[start-lite] Starting with FRONTEND_PORT=$FRONTEND_PORT, API_PORT=$API_PORT, BFF_PORT=$BFF_PORT, VITE_API_BASE=$VITE_API_BASE"
"$ROOT/scripts/start.sh"
