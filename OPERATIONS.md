# Руководство по эксплуатации neuro_crosspost

Бот работает на сервере как systemd-сервис `neuro_crosspost` (папка `/home/nmak1/neuro_crosspost`).
Каждый пост: случайная неиспользованная тема из `data/topics.json` → генерация двух текстов LLM → публикация в VK и Telegram → тема помечается использованной в `data/state.json`.

## Базовые команды (по SSH: `ssh nmak1@80.78.248.91`)

```bash
systemctl status neuro_crosspost --no-pager      # состояние сервиса
sudo systemctl restart neuro_crosspost           # перезапуск (нужен после изменений!)
journalctl -u neuro_crosspost -f                 # живой лог сервиса
tail -50 /home/nmak1/neuro_crosspost/logs/app.log  # лог приложения с ротацией
cd ~/neuro_crosspost && git pull origin main     # обновить код из GitHub вручную
```

## 1. Изменение расписания

Расписание задаётся ДВУМЯ переменными в файле `.env` на сервере (не в коде!):

| Переменная | Что значит | Пример |
|---|---|---|
| `POST_TIME_MSK` | время публикации, МСК (ЧЧ:ММ) | `10:00` |
| `POST_DAYS` | дни недели через запятую: mon,tue,wed,thu,fri,sat,sun | `mon,wed,fri` |

Принцип: **один пост в день** в выбранные дни. `POST_DAYS=mon,thu` = 2 поста в неделю.

### Как изменить (вариант А — быстро, только на сервере)
```bash
nano ~/neuro_crosspost/.env          # правим POST_TIME_MSK / POST_DAYS
sudo systemctl restart neuro_crosspost
journalctl -u neuro_crosspost -n 5   # должна появиться строка "планировщик взлетел: ..."
```

### Как изменить (вариант Б — правильно, через GitHub Actions)
На локальном компьютере репозиторий НЕ должен содержать `.env` (он в .gitignore).
Если хотите хранить расписание в репозитории — меняйте значения по умолчанию в `config.py`:
```python
POST_TIME_MSK = os.getenv('POST_TIME_MSK', '10:00')          # было
POST_TIME_MSK = os.getenv('POST_TIME_MSK', '09:30')          # стало
POST_DAYS = [... os.getenv('POST_DAYS', 'mon,thu') ...]      # было
POST_DAYS = [... os.getenv('POST_DAYS', 'mon,wed,fri') ...]  # стало
```
⚠️ Важно: если на сервере в `.env` заданы `POST_TIME_MSK`/`POST_DAYS`, они ПЕРЕБИВАЮТ config.py. Тогда одновременно поправьте и `.env` на сервере (или удалите там эти строки), иначе изменение не применится.

Затем: `git add config.py && git commit -m "schedule" && git push origin main` → Actions сам стянет код и перезапустит сервис.

### Проверка расписания без ожидания
```bash
cd ~/neuro_crosspost && venv/bin/python -c "
import config; print(config.POST_TIME_MSK, config.POST_DAYS)"
```
Должно вывести актуальные значение и список дней.

## 2. Добавление тем для постов

Файл: `data/topics.json` — массив объектов вида:
```json
{"id": "47", "title": "Заголовок темы — его читает нейросеть", "category": "Остеопатия"}
```

Правила:
- `id` — уникальная строка, НЕ должна совпадать с уже существующими (текущий максимум смотрите внизу файла);
- `title` — тема поста (что именно писать);
- `category` — рубрика, попадает в промпт (`Остеопатия`, `Наука и медицина`, `Интересные факты` или своя);
- файл обязан оставаться валидным JSON: массив закрыт `]`, объект `}`, кавычки двойные, последней запятой нет.

### Вариант А — добавить прямо на сервере (мгновенно, без git)
```bash
cd ~/neuro_crosspost
cp data/topics.json data/topics.json.bak                    # страховка
venv/bin/python - <<'EOF'
import json
p = 'data/topics.json'
d = json.load(open(p, encoding='utf-8'))
new = {"id": "47", "title": "Как сесть на стул и не убить спину: эргономика рабочего места", "category": "Остеопатия"}
if any(t['id'] == new['id'] for t in d['topics']):
    raise SystemExit('такой id уже есть!')
d['topics'].append(new)
json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('добавлено, всего тем:', len(d['topics']))
EOF
```
Перезапуск не обязателен — темы читаются перед каждым постом. Но если правили руками в nano, проверьте валидность:
```bash
venv/bin/python -m json.tool data/topics.json > /dev/null && echo OK
```

### Вариант Б — через GitHub (темы попадут в репозиторий)
Отредактируйте `data/topics.json` локально (можно прямо на странице GitHub: кнопка карандаша ✏️ → Edit → Commit) и сделайте push. Workflow `Deploy Neuro Crosspost (Python bot)` выполнит `git pull` на сервере и перезапустит сервис.
⚠️ Нюанс: `git reset --hard` при деплое НЕ трогает `state.json` (его нет в git), но если вы добавляли темы вручную на сервере, а в git их нет — pull их не удалит (topics.json в git — конфликтовать будет append-only, но лучше вести один источник правды: либо локально+push, либо только на сервере).

### Полезные проверки
```bash
# сколько тем осталось неиспользованными
cd ~/neuro_crosspost && venv/bin/python -c "
import json
used = set(json.load(open('data/state.json'))['used_topic_ids']) if __import__('os').path.exists('data/state.json') else set()
free = [t for t in json.load(open('data/topics.json'))['topics'] if t['id'] not in used]
print('всего:', len(json.load(open('data/topics.json'))['topics']), '| свободно:', len(free))"
```

## 3. Сброс «использованных» тем (круговой повтор)

Когда темы кончаются, бот шлёт алерт в Telegram (если задан `ALERT_TG_CHAT_ID`) и ждёт. Чтобы начать новый круг:
```bash
echo '{"used_topic_ids": [], "last_run": null}' > ~/neuro_crosspost/data/state.json
# или точечно вернуть одну тему:
cd ~/neuro_crosspost && venv/bin/python -c "
import json; st=json.load(open('data/state.json')); st['used_topic_ids'].remove('12'); json.dump(st,open('data/state.json','w'),ensure_ascii=False,indent=2)"
```

## 4. Ручной тестовый пост (не дожидаясь расписания)

```bash
cd ~/neuro_crosspost && venv/bin/python -c "
from main import setup_logging, run_job
setup_logging(); run_job()"
```
⚠️ Это опубликует РЕАЛЬНЫЙ пост в VK и Telegram и пометит тему использованной. Для отладки без публикации запускайте только генерацию:
```bash
venv/bin/python -c "
import asyncio, json
from core import llm_client
t = json.load(open('data/topics.json'))['topics'][0]
r = asyncio.run(llm_client.generate_post_text(t['title'], t['category']))
print(r['vk'][:300]); print('---'); print(r['tg'][:300])"
```

## 5. Прочие настройки (.env на сервере)

| Переменная | Назначение |
|---|---|
| `VK_TOKEN`, `VK_GROUP_ID` | токен сообщества (права wall, photos, offline) и id группы |
| `TG_BOT_TOKEN`, `TG_CHAT_ID` | токен бота и канал (@nocnnov или -100...) |
| `LLM_PROVIDER` | `yandex_gpt` или `openai` |
| `YANDEX_API_KEY`, `YANDEX_FOLDER_ID` | ключи YandexGPT |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | ключи OpenAI (если провайдер openai) |
| `ALERT_TG_CHAT_ID` | ваш числовой user_id для алертов об ошибках |
| `LOG_LEVEL` | DEBUG/INFO/WARNING |

После ЛЮБОЙ правки `.env` — `sudo systemctl restart neuro_crosspost`.

## 6. Частые проблемы

| Симптом | Причина / решение |
|---|---|
| Сервис «active», но постов нет | Подождите слота расписания; проверьте `journalctl -u neuro_crosspost` — там строка «планировщик взлетел: HH:MM МСК по дням ...» |
| Ошибка «не хватает переменных окружения» | В `.env` пустые токены; заполните и перезапустите |
| Алерт «темы закончились» | Пополните topics.json или сбросьте state.json (раздел 3) |
| 400 Bad Request в TG | Сломанный HTML от LLM — fallback на обычный текст уже встроен; если пост уходит без форматирования, это норма |
| VK error code 5 (токен) | Токен просрочен/без прав — перевыпустите ключ сообщества |
| Правка не применилась после push | На сервере в `.env` переопределены значения (см. раздел 1, вариант Б) |
