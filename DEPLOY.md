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

### Windows (PowerShell) — важно!

В PowerShell **нельзя** писать `bash deploy/bootstrap-server.sh ...` — bash там нет (ошибка WSL `execvpe(/bin/bash)`).
Для Windows есть готовый скрипт **`deploy/bootstrap-server.ps1`** (использует встроенные в Windows `ssh`/`scp`, bash на локальной машине не нужен):

```powershell
cd D:\Project\neuro_crosspost

# если на сервер заходите как root:
.\deploy\bootstrap-server.ps1 -Server root@80.78.248.91

# если как обычный пользователь с sudo:
.\deploy\bootstrap-server.ps1 -Server nmak1@80.78.248.91 -Sudo
```

Скрипт: проверит доступ по SSH, положит публичный деплой-ключ в `authorized_keys`, установит пакеты (git, rsync, nginx, python3, ufw) и откроет порты. Дальше — шаги, которые он выведет в конце.

Если ExecutionPolicy запрещает запуск .ps1, выполните один раз:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Можно и совсем без скрипта, вручную (то же самое, что делает bootstrap-server.ps1):
```powershell
scp deploy\deploy_key.pub nmak1@80.78.248.91:/tmp/deploy_key.pub
ssh nmak1@80.78.248.91 "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat /tmp/deploy_key.pub >> ~/.ssh/authorized_keys && sort -u ~/.ssh/authorized_keys -o ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && rm /tmp/deploy_key.pub"
ssh nmak1@80.78.248.91 "sudo apt-get update && sudo apt-get install -y git rsync nginx python3 python3-venv python3-pip ufw && sudo mkdir -p /opt/autoposter/data && sudo ufw allow 22,80,443,8080/tcp && sudo ufw --force enable"
```

Деплой кода с Windows — проще всего через GitHub Actions (секреты ниже), либо запустив `deploy/deploy.sh` из Git Bash.

### Linux / macOS

```bash
# 1. подготовить сервер + положить деплой-ключ + первый выкат кода
bash deploy/bootstrap-server.sh root@80.78.248.91

# 2. в cloud.reg.ru → Сетевые правила (firewall) добавьте порт 8080 TCP
# 3. вписать реальные ключи на сервере
ssh root@80.78.248.91
nano /opt/autoposter/.env          # VK_TOKEN, TG_BOT_TOKEN, YANDEX_API_KEY...
# при необходимости — SOCKS5-прокси для всех исходящих запросов (VK/TG/LLM):
# PROXY=socks5://user:pass@host:port  (строку с паролем в git не светить!)
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
