#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/morro-frontend"
BRANCH="main"
PM2_APP="morro-frontend"

echo "==> Despliegue iniciado: $(date)"
cd "$APP_DIR"

echo "==> Obteniendo últimos cambios de origin/$BRANCH"
git fetch --all --prune
git reset --hard "origin/$BRANCH"

echo "==> Instalando dependencias"
npm ci

echo "==> Compilando (Next.js build)"
npm run build

echo "==> Reiniciando PM2"
if pm2 describe "$PM2_APP" > /dev/null 2>&1; then
  pm2 reload "$PM2_APP" --update-env
else
  pm2 start ecosystem.config.js
fi
pm2 save

echo "==> Despliegue completado: $(date)"
