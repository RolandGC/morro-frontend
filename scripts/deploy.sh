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
# startOrReload vuelve a leer ecosystem.config.js, por lo que aplica cambios
# de args/env (p. ej. el puerto). 'pm2 reload <name>' NO re-lee el archivo.
pm2 startOrReload ecosystem.config.js --update-env
pm2 save

echo "==> Despliegue completado: $(date)"
