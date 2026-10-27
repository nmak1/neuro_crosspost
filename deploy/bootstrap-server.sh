#!/usr/bin/env bash
# Одноразовая подготовка сервера reg.ru (80.78.248.91) к приёму деплоя.
# Запускать с машины, у которой есть доступ к серверу по паролю/SSH:
#   bash deploy/bootstrap-server.sh root@80.78.248.91
set -euo pipefail

SERVER="${1:-root@80.78.248.91}"
PUBKEY_FILE="${PUBKEY_FILE:-deploy/deploy_key.pub}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

[ -f "$PUBKEY_FILE" ] || { echo "Нет $PUBKEY_FILE — сгенерируйте: ssh-keygen -t ed25519 -f deploy/deploy_key -N ''"; exit 1; }

echo "==> Кладём деплой-ключ в authorized_keys на $SERVER"
ssh -o StrictHostKeyChecking=accept-new "$SERVER" "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && sort -u ~/.ssh/authorized_keys -o ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys" < "$PUBKEY_FILE"

echo "==> Базовые пакеты и структура приложения"
ssh "$SERVER" 'bash -s' <<'REMOTE'
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq git rsync nginx python3 python3-venv python3-pip ufw
mkdir -p /opt/autoposter/data
ufw allow 22,80,443/tcp >/dev/null 2>&1 || true
ufw --force enable >/dev/null 2>&1 || true
echo "Сервер подготовлен"
REMOTE

echo "==> Первый деплой кода"
DEPLOY_SERVER="$SERVER" bash deploy/deploy.sh

echo "==> Создаём .env на сервере из шаблона (ключи нужно вписать вручную!)"
ssh "$SERVER" '[ -f /opt/autoposter/.env ] || cp /opt/autoposter/.env.example /opt/autoposter/.env; ls -l /opt/autoposter/.env'

cat <<INFO

Готово. Дальше:
1) Впишите реальные ключи:  ssh $SERVER  →  nano /opt/autoposter/.env
2) Перезапустите планировщик: systemctl restart autoposter
3) Секрет для GitHub Actions (вкладка Settings → Secrets → Actions):
   DEPLOY_SSH_KEY = содержимое файла deploy/deploy_key (ПРИВАТНЫЙ ключ, целиком)
   после этого любой push в main будет сам выкатываться на сервер.
INFO
