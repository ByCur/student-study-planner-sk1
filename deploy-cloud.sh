#!/usr/bin/env bash

set -e

echo "========================================"
echo " Student Study Planner - Cloud deploy"
echo "========================================"

echo ""
echo "This script triggers a public deployment on Render."
echo "It requires Render deploy hook URLs as environment variables."
echo ""

if ! command -v curl >/dev/null 2>&1; then
  echo "ERROR: curl is not installed."
  exit 1
fi

if [ -z "$RENDER_BACKEND_DEPLOY_HOOK" ]; then
  echo "ERROR: RENDER_BACKEND_DEPLOY_HOOK is not set."
  echo ""
  echo "Set it with:"
  echo "export RENDER_BACKEND_DEPLOY_HOOK='https://api.render.com/deploy/....'"
  exit 1
fi

if [ -z "$RENDER_FRONTEND_DEPLOY_HOOK" ]; then
  echo "ERROR: RENDER_FRONTEND_DEPLOY_HOOK is not set."
  echo ""
  echo "Set it with:"
  echo "export RENDER_FRONTEND_DEPLOY_HOOK='https://api.render.com/deploy/....'"
  exit 1
fi

echo "Triggering backend deploy..."
curl -fsS -X POST "$RENDER_BACKEND_DEPLOY_HOOK"

echo ""
echo "Triggering frontend deploy..."
curl -fsS -X POST "$RENDER_FRONTEND_DEPLOY_HOOK"

echo ""
echo "========================================"
echo "Deploy triggered successfully."
echo "========================================"
echo ""
echo "Public frontend:"
echo "https://tasknotes-frontend.onrender.com"
echo ""
echo "Backend health endpoint:"
echo "https://tasknotes-backend.onrender.com/health"
echo ""
echo "Note: Render free instances may take some seconds to wake up."
echo "========================================"
