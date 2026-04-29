#!/usr/bin/env bash
set -euo pipefail

echo "== TaskNotes Cloud: prepare app =="

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required for local testing."
  exit 1
fi

if ! command -v git >/dev/null 2>&1; then
  echo "Git is required."
  exit 1
fi

echo "1) Testing the application locally with Docker Compose..."
docker compose up -d --build

echo "2) Waiting for backend health endpoint..."
for i in {1..30}; do
  if curl -fsS http://localhost:10000/health >/dev/null 2>&1; then
    echo "Backend is healthy."
    break
  fi
  sleep 2
done

echo "3) Local app is running:"
echo "   Frontend: http://localhost:8080"
echo "   Backend health: http://localhost:10000/health"

echo ""
echo "4) Cloud deployment:"
echo "   Push this repository to GitHub/GitLab/Bitbucket and create a Render Blueprint using render.yaml."
echo "   After backend is deployed, set VITE_API_URL in the frontend service to:"
echo "   https://tasknotes-backend.onrender.com"
echo "   If Render adds a suffix to the URL, use the real backend URL shown by Render."
echo ""
echo "Optional validation if Render CLI is installed:"
echo "   render blueprints validate render.yaml"
