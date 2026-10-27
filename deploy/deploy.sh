#!/usr/bin/env bash
# Ручной деплой AutoPoster на сервер reg.ru (80.78.248.91)
#   ./deploy/deploy.sh            — собрать и выложить
# GitHub Actions делает то же самое автоматически при пуше в main
set -euo pipefail

SERVER="${DEPLOY_SERVER:-root@80.78.248.91}"
APP_DIR="/opt/autoposter"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "==> 1. Сборка фронтенда"
[ -d node_modules ] || npm ci --no-audit --no-fund
npm run build

echo "==> 2. Копия исходников для передачи (без секретов и мусора)"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT
mkdir -p "$STAGE/app"
tar --exclude=.git --exclude=node_modules --exclude=dist --exclude=.venv \
    --exclude=__pycache__ --exclude='*.log' --exclude=.env -cf - . | tar -xf - -C "$STAGE/app"
cp -r dist "$STAGE/app/dist"

echo "==> 3. Копия файлов на сервер без удаления бэкенда (.env, state.json не трогаем)"
ssh -o StrictHostKeyChecking=accept-new "$SERVER" "mkdir -p $APP_DIR"
rsync -az --delete \
  --exclude='.env' --exclude='data/state.json' --exclude='.venv/' \
  "$STAGE/app/" "$SERVER:$APP_DIR/"
rsync -az deploy/autoposter.service deploy/nginx-site.conf "$SERVER:/tmp/"

echo "==> 4. Настройка сервера (venv, systemd, nginx)"
ssh "$SERVER" 'bash -s' < deploy/remote-setup.sh

echo "==> Готово. Фронтенд: http://80.78.248.91:8080/  Бэкенд: systemctl status autoposter (на сервере)"
