import asyncio
import random
import httpx
import config

MAX_RETRIES = 3
BASE_DELAY = 2

async def _post_yandex(prompt: str, system: str) -> str:
    # ИСПРАВЛЕНО: правильный официальный URL YandexGPT API
    url = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion'
    
    payload = {
        'modelUri': f'gpt://{config.YANDEX_FOLDER_ID}/yandexgpt/latest',
        'completionOptions': {
            'temperature': 0.7,
            'maxTokens': '1200'  # ИСПРАВЛЕНО: должно быть строкой
        },
        'messages': [
            {'role': 'system', 'text': system},
            {'role': 'user', 'text': prompt},
        ]
    }
    
    headers = {'Authorization': f'Api-Key {config.YANDEX_API_KEY}'}
    
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(url, json=payload, headers=headers)
        r.raise_for_status()
        data = r.json()
        return data['result']['alternatives'][0]['message']['text']


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
            return {'vk': vk_text, 'tg': tg_text}
        except Exception as e:
            last_err = e
            delay = BASE_DELAY * (2 ** attempt) + random.uniform(0, 1)
            print(f'[llm] попытка {attempt+1} не удалась: {e}; ждём {delay:.1f}s')
            await asyncio.sleep(delay)
            
    raise RuntimeError(f'LLM API timeout after {MAX_RETRIES} retries') from last_err