#!/usr/bin/env bash
# Run frontend and backend locally together for ACW website
# - Starts backend Express server (backend/local-server.js) on port 3001
# - Starts CRA frontend dev server (frontend) on port 3000 with /api proxy
#
# Usage:
#   chmod +x run-local.sh
#   ./run-local.sh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

info() { echo "[run-local] $*"; }

# Ensure backend deps
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
  info "Installing backend dependencies..."
  (cd "$BACKEND_DIR" && npm install)
fi

# Load backend env if present (for local dev)
if [ -f "$BACKEND_DIR/.env" ]; then
  info "Loading backend environment from backend/.env"
  # export all variables defined in .env
  set -a
  # shellcheck disable=SC1091
  source "$BACKEND_DIR/.env"
  set +a
fi

# Start backend server in background
info "Starting backend (port ${PORT:-3001})..."
(
  cd "$BACKEND_DIR"
  node local-server.js
) &
BACKEND_PID=$!
info "Backend started with PID $BACKEND_PID"

# Ensure frontend deps
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  info "Installing frontend dependencies..."
  (cd "$FRONTEND_DIR" && npm install)
fi

# Trap to clean up backend on exit
cleanup() {
  info "Shutting down..."
  if ps -p "$BACKEND_PID" >/dev/null 2>&1; then
    info "Stopping backend PID $BACKEND_PID"
    kill "$BACKEND_PID" 2>/dev/null || true
    # Give it a moment to exit gracefully
    sleep 1
  fi
}
trap cleanup EXIT INT TERM

# Start CRA dev server (blocks until user stops)
info "Starting frontend (port 3000)..."
cd "$FRONTEND_DIR"
npm start
