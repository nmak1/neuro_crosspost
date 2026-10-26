import os
from dotenv import load_dotenv

load_dotenv()

# всё, что чувствительное, только через окружение. ключи лежат в .env (он в gitignore)
VK_GROUP_ID = os.getenv('VK_GROUP_ID', '235314099')
VK_TOKEN = os.getenv('VK_TOKEN', '')
TG_BOT_TOKEN = os.getenv('TG_BOT_TOKEN', '')
TG_CHAT_ID = os.getenv('TG_CHAT_ID', '@nocnnov')
LLM_PROVIDER = os.getenv('LLM_PROVIDER', 'yandex_gpt')
YANDEX_API_KEY = os.getenv('YANDEX_API_KEY', '')
YANDEX_FOLDER_ID = os.getenv('YANDEX_FOLDER_ID', '')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
POST_TIMES_UTC = [t.strip() for t in os.getenv('POST_TIMES_UTC', '06:00,13:00,20:00').split(',')]
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')


def check_env():
    """перед стартом сверяем, что обязательные ключи на месте — иначе падать сразу и понятно"""
    missing = [name for name, val in {
        'VK_TOKEN': VK_TOKEN,
        'TG_BOT_TOKEN': TG_BOT_TOKEN,
        'YANDEX_API_KEY': YANDEX_API_KEY if LLM_PROVIDER == 'yandex_gpt' else OPENAI_API_KEY,
    }.items() if not val]
    return missing
