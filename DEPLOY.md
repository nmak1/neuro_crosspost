# Деплой AutoPoster

Два контура:
1. **GitHub Pages** (`.github/workflows/deploy.yml`) — фронтенд на `<user>.github.io/<repo>` (опционально).
2. **VPS reg.ru 80.78.248.91** (`.github/workflows/deploy-server.yml`) — основной прод: nginx отдаёт собранный фронтенд, планировщик постинга работает как systemd-сервис `autoposter`.

ПОРТЫ: порт 80 на сервере уже занят другим приложением («My Cloud»), поэтому фронтенд AutoPoster отдаётся nginx'ом на **порту 8080** → http://80.78.248.91:8080/

## Что где лежит на сервере

- `/opt/autoposter` — код (бэкенд + собранный `dist/`)
- `/opt/autoposter/.env` — токены и ключи (**не перезаписывается деплоем**, создаётся один раз вручную)
- `/opt/autoposter/data/state.json` — состояние использованных тем (деплой не трогает)
- systemd-юнит `autoposter.service`, конфиг nginx `sites-available/autoposter`
- Логи бэкенда: `journalctl -u autoposter -f`

## Первый запуск (один раз)

Нужен доступ к серверу по SSH (пароль из панели cloud.reg.ru). С локальной машины:

```bash
# 1. подготовить сервер + положить деплой-ключ + первый выкат кода
bash deploy/bootstrap-server.sh root@80.78.248.91

# 2. в cloud.reg.ru → Сетевые правила (firewall) добавьте порт 8080 TCP
# 3. вписать реальные ключи на сервере
ssh root@80.78.248.91
nano /opt/autoposter/.env          # VK_TOKEN, TG_BOT_TOKEN, YANDEX_API_KEY...
systemctl restart autoposter
```

Если нет ssh-copy-id/rsync локально — можно всё руками с сервера:
```bash
# на сервере от root:
apt-get update && apt-get install -y nginx rsync python3-venv
mkdir -p /opt/autoposter && cd /opt/autoposter
git clone <URL_репозитория> .   # или выложить файлы
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
cp .env.example .env && nano .env
cp deploy/autoposter.service /etc/systemd/system/ && systemctl enable --now autoposter
cp deploy/nginx-site.conf /etc/nginx/sites-available/autoposter
ln -sf /etc/nginx/sites-available/autoposter /etc/nginx/sites-enabled/autoposter
rm -f /etc/nginx/sites-enabled/default && nginx -t && systemctl reload nginx
npm ci && npm run build          # соберёт dist для nginx
```

## Автоматизация GitHub → сервер (CI/CD)

1. Сгенерирован деплой-ключ: `deploy/deploy_key` (приватный, в git не попадает) и `deploy/deploy_key.pub`.
2. Публичный ключ добавлен в `~/.ssh/authorized_keys` на сервере (делает `bootstrap-server.sh`).
3. В GitHub: **Settings → Secrets and variables → Actions → New repository secret**:
   - `DEPLOY_SSH_KEY` — **полное содержимое файла `deploy/deploy_key`** (включая строки BEGIN/END)
   - `DEPLOY_SERVER` — `root@80.78.248.91`
4. Всё. Теперь любой `git push` в `main` запускает workflow **Deploy to VPS (reg.ru)**: typecheck → build → rsync на сервер → установка зависимостей (если менялись) → `systemctl restart autoposter` → health-check.

Ручной выкат без GitHub: `./deploy/deploy.sh` (нужен доступ по SSH с текущей машины).

## Полезные команды на сервере

```bash
systemctl status autoposter        # состояние планировщика
journalctl -u autoposter -f        # живые логи постинга
nginx -t && systemctl reload nginx
```

## Фронтенд на GitHub Pages (старый контур, опционально)

Settings → Pages → Source: **GitHub Actions**. Пуш в main собирает и публикует автоматически.
