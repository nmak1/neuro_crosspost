import re
import time

import vk_api
from vk_api.exceptions import ApiError

import config

MAX_RETRIES = 3
BASE_DELAY = 2  # exponential backoff: 2s, 4s, 8s (ТЗ п.5)
VK_MIN_INTERVAL = 0.35  # до 3 запросов/сек — держим запас (ТЗ п.5)
_last_call = [0.0]

# LLM иногда всё-таки отдаёт markdown — VK его не понимает, чистим по ТЗ п.4.2
_MD_BOLD = re.compile(r'\*\*(.+?)\*\*', re.S)
_MD_ITAL = re.compile(r'(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)', re.S)
_MD_STRIKE = re.compile(r'~~(.+?)~~', re.S)
_MD_CODE = re.compile(r'`{1,3}')
_MD_LINK = re.compile(r'\[([^\]]+)\]\(([^)]+)\)')
_MD_HEADER = re.compile(r'^(#{1,6})[ \t]+(\S.*)$', re.M)


def clean_markdown(text: str) -> str:
    text = _MD_BOLD.sub(r'\1', text)
    text = _MD_ITAL.sub(r'\1', text)
    text = _MD_STRIKE.sub(r'\1', text)
    text = _MD_LINK.sub(r'\1 (\2)', text)
    text = _MD_CODE.sub('', text)
    # markdown-заголовки "## Текст" превращаем в обычный текст;
    # строки, начинающиеся с хэштега ("#nocnnov"), не трогаем — это валидные хэштеги VK
    text = _MD_HEADER.sub(lambda m: m.group(2) if not m.group(2).startswith('#') else m.group(0), text)
    return text.strip()


# стенка группы живёт по id=-group_id, это специфика vk api
def _wall_owner() -> int:
    return -int(config.VK_GROUP_ID)


def _throttle():
    gap = time.monotonic() - _last_call[0]
    if gap < VK_MIN_INTERVAL:
        time.sleep(VK_MIN_INTERVAL - gap)
    _last_call[0] = time.monotonic()


def publish_vk(text: str) -> str:
    """кидаем пост на стену с ретраями (5xx/429), возвращаем post_id вида 235314099_123"""
    text = clean_markdown(text)
    session = vk_api.VkApi(token=config.VK_TOKEN)
    vk = session.get_api()
    last_err = None
    for attempt in range(MAX_RETRIES):
        try:
            _throttle()
            res = vk.wall.post(owner_id=_wall_owner(), from_group=1, message=text)
            return f'{config.VK_GROUP_ID}_{res["post_id"]}'
        except ApiError as e:
            last_err = e
            code = getattr(e, 'code', None) or 0
            if code == 429 or code >= 500:
                delay = BASE_DELAY * (2 ** attempt)
                print(f'[vk] попытка {attempt + 1}: ошибка {code}, ждём {delay}s')
                time.sleep(delay)
                continue
            raise  # 15/27 и прочие фатальные — сразу наверх, в алертер
    raise RuntimeError(f'VK wall.post не удался после {MAX_RETRIES} попыток') from last_err
