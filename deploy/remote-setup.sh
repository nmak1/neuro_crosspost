#!/usr/bin/env bash
# Выполняется НА сервере: ssh root@80.78.248.91 'bash -s' < deploy/remote-setup.sh
set -euo pipefail
APP=/opt/autoposter

if ! command -v python3 >/dev/null; then apt-get update -qq && apt-get install -y -qq python3 python3-venv; fi
command -v rsync  >/dev/null || { apt-get update -qq && apt-get install -y -qq rsync; }
command -v nginx  >/dev/null || { apt-get update -qq && apt-get install -y -qq nginx; }

cd "$APP"
[ -d .venv ] || python3 -m venv .venv
if ! cmp -s requirements.txt .venv/.requirements.hash 2>/dev/null; then
  .venv/bin/pip install -q --upgrade pip
  .venv/bin/pip install -q -r requirements.txt
  cp requirements.txt .venv/.requirements.hash
fi

cp /tmp/autoposter.service /etc/systemd/system/autoposter.service
cp /tmp/nginx-site.conf /etc/nginx/sites-available/autoposter
ln -sf /etc/nginx/sites-available/autoposter /etc/nginx/sites-enabled/autoposter
# НЕ удаляем default: на 80-м порту живёт другое приложение (My Cloud), наш сайт на 8080
nginx -t && systemctl reload nginx

systemctl daemon-reload
if [ -f "$APP/.env" ]; then
  systemctl enable autoposter >/dev/null 2>&1 || true
  systemctl restart autoposter
else
  echo "ВНИМАНИЕ: $APP/.env отсутствует — планировщик не перезапущен. Создайте .env из .env.example"
fi
systemctl status autoposter --no-pager -l | head -12 || true
