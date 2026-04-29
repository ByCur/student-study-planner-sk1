#!/usr/bin/env bash
set -euo pipefail

echo "== TaskNotes Cloud: remove local app =="
docker compose down -v
echo "Local containers and local PostgreSQL volume removed."

echo ""
echo "Cloud removal:"
echo "Delete/suspend the Render Blueprint or services from Render, or use Render CLI/API if available for your account."
echo "Do not delete only the frontend; remove backend and database too if you want to stop all resources."
