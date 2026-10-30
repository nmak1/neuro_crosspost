import asyncio
import random
import httpx
import config

MAX_RETRIES = 3
BASE_DELAY = 2

# Официальный endpoint YandexGPT (Foundation Models API)
YANDEX_URLS = [
    'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
    # резерв: региональные адреса на случай сбоя DNS одного из них
    'https://llm.api.ru-central1.cloud.yandex.net/foundationModels/v1/completion',
]


async def _post_yandex(prompt: str, system: str) -> str:
    payload = {
        'modelUri': f'gpt://{config.YANDEX_FOLDER_ID}/yandexgpt/latest',
        'completionOptions': {
            'temperature': 0.7,
            'maxTokens': '1200',  # по спецификации API — строка
        },
        'messages': [
            {'role': 'system', 'text': system},
            {'role': 'user', 'text': prompt},
        ],
    }
    headers = {
        'Authorization': f'Api-Key {config.YANDEX_API_KEY}',
        'x-yandex-req-id': '1',
    }
    last_err = None
    # PROXY=socks5://user:pass@host:port из .env — гоним запросы к LLM через него (нужен socksio)
    proxy = getattr(config, 'PROXY', '') or None
    async with httpx.AsyncClient(timeout=60, proxy=proxy) as client:
        for url in YANDEX_URLS:
            try:
                r = await client.post(url, json=payload, headers=headers)
                r.raise_for_status()
                data = r.json()
                return data['result']['alternatives'][0]['message']['text']
            except Exception as e:
                last_err = e
    raise last_err


def _strip_code_fences(text: str) -> str:
    """LLM иногда оборачивает ответ в ```html ... ``` / ```markdown ... ``` — снимаем обёртку."""
    t = text.strip()
    if t.startswith('```'):
        first_nl = t.find('\n')
        if first_nl != -1:
            t = t[first_nl + 1:]
        if t.rstrip().endswith('```'):
            t = t.rstrip()[:-3]
    return t.strip()


async def generate_post_text(topic_title: str, category: str) -> dict:
    """на входе тема, на выходе {'vk': ..., 'tg': ...}"""
    from prompts import loader
    vk_prompt = loader.build_vk_prompt(topic_title, category)
    tg_prompt = loader.build_tg_prompt(topic_title, category)

    last_err = None
    for attempt in range(MAX_RETRIES):
        try:
            vk_text, tg_text = await asyncio.gather(
                _post_yandex(vk_prompt, loader.VK_SYSTEM),
                _post_yandex(tg_prompt, loader.TG_SYSTEM),
            )
            return {'vk': _strip_code_fences(vk_text), 'tg': _strip_code_fences(tg_text)}
        except Exception as e:
            last_err = e
            delay = BASE_DELAY * (2 ** attempt) + random.uniform(0, 1)
            print(f'[llm] попытка {attempt+1} не удалась: {e}; ждём {delay:.1f}s')
            await asyncio.sleep(delay)

    raise RuntimeError(f'LLM API failed after {MAX_RETRIES} retries') from last_err