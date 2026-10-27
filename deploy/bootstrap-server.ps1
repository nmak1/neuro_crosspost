# Одноразовая подготовка сервера reg.ru с Windows (PowerShell).
# Использование (из корня проекта):
#   .\deploy\bootstrap-server.ps1 -Server nmak1@80.78.248.91
#   или от root:  .\deploy\bootstrap-server.ps1 -Server root@80.78.248.91
# Требуется встроенный в Windows клиент OpenSSH (ssh/scp).
param(
    [Parameter(Mandatory = $true)][string]$Server,
    [string]$PubKeyFile = "deploy\deploy_key.pub",
    # если под этим пользователем нужны root-права, ставьте $true — команды будут через sudo
    [switch]$Sudo
)
$ErrorActionPreference = "Stop"
$pre = if ($Sudo) { "sudo " } else { "" }

if (-not (Test-Path $PubKeyFile)) {
    Write-Host "Нет файла $PubKeyFile" -ForegroundColor Red
    Write-Host "Сгенерируйте ключ: ssh-keygen -t ed25519 -f deploy\deploy_key -N '""'"
    exit 1
}

Write-Host "==> Проверяю доступ по SSH к $Server (может понадобиться пароль)" -ForegroundColor Cyan
ssh -o StrictHostKeyChecking=accept-new $Server "echo OK; whoami"
if ($LASTEXITCODE -ne 0) { throw "SSH недоступен для $Server" }

Write-Host "==> Кладу публичный деплой-ключ в authorized_keys" -ForegroundColor Cyan
scp $PubKeyFile "${Server}:/tmp/deploy_key.pub"
if ($LASTEXITCODE -ne 0) { throw "scp не удался" }
ssh $Server "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat /tmp/deploy_key.pub >> ~/.ssh/authorized_keys && sort -u ~/.ssh/authorized_keys -o ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && rm /tmp/deploy_key.pub"
if ($LASTEXITCODE -ne 0) { throw "Не удалось добавить ключ" }

Write-Host "==> Подготовка сервера: пакеты, структура каталогов, ufw" -ForegroundColor Cyan
$remote = @"
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
$pre apt-get update -qq
$pre apt-get install -y -qq git rsync nginx python3 python3-venv python3-pip ufw
$pre mkdir -p /opt/autoposter/data
$pre ufw allow 22,80,443,8080/tcp >/dev/null 2>&1 || true
$pre ufw --force enable >/dev/null 2>&1 || true
echo 'Сервер подготовлен'
"@
ssh $Server $remote
if ($LASTEXITCODE -ne 0) { throw "Подготовка сервера не удалась" }

Write-Host ""
Write-Host "Готово! Дальнейшие шаги:" -ForegroundColor Green
Write-Host @"
1) Выкатите код на сервер одним из способов:
   а) самый простой — включите GitHub Actions: добавьте секреты в репозитории
      Settings -> Secrets and variables -> Actions:
        DEPLOY_SSH_KEY  = полное содержимое файла deploy\deploy_key (приватный ключ, включая BEGIN/END)
        DEPLOY_SERVER   = $Server
      затем git push origin main — код сам заедет на сервер и всё настроится.
   б) вручную: scp -r всего проекта на сервер + команды из DEPLOY.md (раздел 'Ручной способ').
2) В панели cloud.reg.ru -> Сетевые правила откройте порт 8080 TCP.
3) Впишите токены: ssh $Server, затем nano /opt/autoposter/.env
4) systemctl restart autoposter  (при необходимости sudo)
Фронтенд будет доступен по адресу http://80.78.248.91:8080/
"@
