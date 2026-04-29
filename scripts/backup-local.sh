#!/usr/bin/env bash
set -euo pipefail

mkdir -p backups
docker exec tasknotes-db pg_dump -U tasknotes -d tasknotes > "backups/tasknotes-$(date +%Y%m%d-%H%M%S).sql"
echo "Backup created in backups/"
