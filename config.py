import os
from dotenv import load_dotenv

load_dotenv()

# всё, что чувствительное, только через окружение. ключи лежат в .env (он в gitignore)
VK_GROUP_ID = os.getenv('VK_GROUP_ID', '235314099')
VK_TOKEN = os.getenv('VK_TOKEN', '')
TG_BOT_TOKEN = os.getenv('TG_BOT_TOKEN', '')
TG_CHAT_ID = os.getenv('TG_CHAT_ID', '@nocnnov')
# чат разработчика для служебных алертов (core/alerter.py); без него алерты уходят только в консоль
ALERT_TG_CHAT_ID = os.getenv('ALERT_TG_CHAT_ID', '')
LLM_PROVIDER = os.getenv('LLM_PROVIDER', 'yandex_gpt')
YANDEX_API_KEY = os.getenv('YANDEX_API_KEY', '')
YANDEX_FOLDER_ID = os.getenv('YANDEX_FOLDER_ID', '')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
# расписание постинга. по умолчанию 1 пост в день, 2 дня в неделю (пн и чт)
# POST_DAYS — дни недели: mon,tue,wed,thu,fri,sat,sun; POST_TIME — когда публикуем
POST_TIME_MSK = os.getenv('POST_TIME_MSK', '10:00')
POST_DAYS = [d.strip().lower() for d in os.getenv('POST_DAYS', 'mon,thu').split(',') if d.strip()]
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
# SOCKS5-прокси для всех исходящих запросов (VK/TG/LLM), если провайдер блокирует API.
# Формат: socks5://user:pass@host:port — кладём в .env как PROXY=socks5://...
# Пусто — работаем напрямую. Для httpx нужен пакет socksio (requirements: httpx[socks]).
PROXY = os.getenv('PROXY', '').strip()

# для совместимости со старым форматом, если кто ещё держит POST_TIMES_UTC в .env
LEGACY_POST_TIMES_UTC = [t.strip() for t in os.getenv('POST_TIMES_UTC', '').split(',') if t.strip()]


def check_env():
    """перед стартом сверяем, что обязательные ключи на месте — иначе падать сразу и понятно"""
    missing = [name for name, val in {
        'VK_TOKEN': VK_TOKEN,
        'TG_BOT_TOKEN': TG_BOT_TOKEN,
        'YANDEX_API_KEY': YANDEX_API_KEY if LLM_PROVIDER == 'yandex_gpt' else OPENAI_API_KEY,
    }.items() if not val]
    return missing
