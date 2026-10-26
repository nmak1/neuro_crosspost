# Деплой

Фронтенд уходит на GitHub Pages через GitHub Actions (`.github/workflows/deploy.yml`).
Бэкенд крутится локально или на сервере — ему нужен только Python 3.10+ и .env.

## Фронтенд (GitHub Pages)

1. Settings -> Pages -> Source: **GitHub Actions** (без этого workflow падает с HttpError: Not Found)
2. Пуш в `main` запускает сборку автоматически: typecheck -> build -> deploy
3. Сайт живёт по адресу вида `https://<user>.github.io/<repo>/`

Локальная проверка перед пушем:

```bash
npm ci
npm run typecheck
npm run build
```

## Бэкенд

```bash
python -m venv .venv
# windows:
.venv\Scripts\activate
# linux/mac:
source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # windows, на linux cp
# вписать VK_TOKEN, TG_BOT_TOKEN, YANDEX_API_KEY

python main.py           # планировщик стартует и ждёт своих слотов
```

Полезно держать в фоне на сервере:

```bash
nohup python main.py >> posts.log 2>&1 &
```

## Что где лежит

- `data/topics.json` — очередь тем (для club235314099 / @nocnnov)
- `data/state.json` — какие темы уже использованы, не коммитится
- `prompts/*.txt` — шаблоны промптов, правятся без перекомпиляции
