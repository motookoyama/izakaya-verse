#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env ]]; then
  cp .env.example .env
fi
set -a; source .env; set +a

FRONT_PORT="${FRONTEND_PORT:-5173}"
API_PORT="${API_PORT:-3117}"
BFF_PORT="${BFF_PORT:-4117}"

start_vue() {
  echo "[start] Vue dev server on port ${FRONT_PORT}"
  npm -w apps/web run dev -- --port "${FRONT_PORT}" 2>&1
}

start_bff() {
  echo "[start] BFF server on port ${BFF_PORT}"
  PORT="${BFF_PORT}" npm -w bff run dev 2>&1
}

start_rails() {
  if [[ -x apps/api/bin/dev ]]; then
    echo "[start] Rails server via bin/dev on port ${API_PORT}"
    (cd apps/api && PORT="${API_PORT}" bin/dev) 2>&1
  else
    echo "[warn] Rails app not yet provisioned (expected apps/api/bin/dev). Skipping."
    return 0
  fi
}

mkdir -p logs
TS="$(date +%Y%m%d_%H%M%S)"
STACK_LOG="logs/stack.${TS}.log"

start_vue | tee -a "${STACK_LOG}" &
VUE_PID=$!

start_bff | tee -a "${STACK_LOG}" &
BFF_PID=$!

start_rails | tee -a "${STACK_LOG}" &
RAILS_PID=$!

trap 'echo Stopping...; kill $VUE_PID $BFF_PID $RAILS_PID 2>/dev/null || true; wait || true' INT TERM
wait
