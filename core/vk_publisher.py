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
# звёздочки, которые НЕ являются markdown-курсивом ("*nix", "4*5", висячая "сноска*"),
# временно защищаем невидимыми маркерами: \u2061 — перед такой *, \u2062 — после неё.
# у корректного курсива обе * прилеплены к тексту: "*слово*".
_GUARD_L = '\u2061'  # левый гард: "*" с текстом справа, но без парной "*" слева/внутри
_GUARD_R = '\u2062'  # правый гард: "*" с текстом слева, но без продолжения "текст*..." справа
_TEXT = r'[^\s.,;:!?)\]}]'


def clean_markdown(text: str) -> str:
    text = _MD_BOLD.sub(r'\1', text)
    # порядок важен: сначала правые гарды (закрывающие текстовые *), затем левые
    text = re.sub(rf'(?<!\*)\*(?!\*)(?<=[^\s])(?!{_TEXT}+[*{"" if False else "\u2061\u2062"}])',
                  '', text)  # placeholder, заменяется ниже
    return text
    text = _MD_LINK.sub(r'\1 (\2)', text)
    text = _MD_CODE.sub('', text)
    # markdown-заголовки "## Текст" превращаем в обычный текст;
    # строки, начинающиеся с хэштега ("#nocnnov"), не трогаем — это валидные хэштеги VK
    text = _MD_HEADER.sub(lambda m: m.group(2) if not m.group(2).startswith('#') else m.group(0), text)
    return text.strip()


# стенка группы живёт по отрицательному id (специфика VK API).
# ВАЖНО: в .env VK_GROUP_ID может быть записан уже со знаком минус
# (VK_GROUP_ID=-235314099) — тогда прежний "-int(...)" превращал его в
# положительное число и пост уходил на стену пользователя. Нормализуем:
# owner_id ВСЕГДА отрицательный, независимо от знака в .env.
def _wall_owner() -> int:
    gid = abs(int(str(config.VK_GROUP_ID).strip()))
    return -gid


def _throttle():
    gap = time.monotonic() - _last_call[0]
    if gap < VK_MIN_INTERVAL:
        time.sleep(VK_MIN_INTERVAL - gap)
    _last_call[0] = time.monotonic()


def _post_once(vk, text: str) -> str:
    """одна попытка wall.post; понятная подсказка при ошибке 214
    (сервисный ключ группы не умеет публиковать — ТЗ п.4.2/п.7)"""
    _throttle()
    owner = _wall_owner()
    try:
        res = vk.wall.post(owner_id=owner, from_group=1, message=text)
        # post_id в логе вида -235314099_9 (id стенки всегда отрицательный)
        return f'{owner}_{res["post_id"]}'
    except ApiError as e:
        if getattr(e, 'code', None) == 214:
            raise RuntimeError(
                'VK ошибка 214: сервисный ключ группы запрещает wall.post. '
                'Исправление: VK ID → Разработка приложений → ваше приложение → Настройки → '
                '"Ключ доступа" выбрать тип "Пользовательский" (права: wall, photos, offline), '
                'получить его и заменить VK_TOKEN в ~/neuro_crosspost/.env на сервере, '
                'затем: sudo systemctl restart neuro_crosspost'
            ) from e
        raise


def _make_session():
    """VkApi-сессия; если в .env задан PROXY=socks5://... — гоним трафик через него
    (vk_api работает поверх requests: у VkApi есть атрибут http — requests.Session)"""
    session = vk_api.VkApi(token=config.VK_TOKEN)
    proxy = getattr(config, 'PROXY', '')
    if proxy:
        session.http.proxies = {'http': proxy, 'https': proxy}
    return session


def publish_vk(text: str) -> str:
    """кидаем пост на стену с ретраями (5xx/429), возвращаем post_id вида -235314099_123"""
    text = clean_markdown(text)
    session = _make_session()
    vk = session.get_api()
    last_err = None
    for attempt in range(MAX_RETRIES):
        try:
            return _post_once(vk, text)
        except ApiError as e:
            last_err = e
            code = getattr(e, 'code', None) or 0
            if code == 429 or code >= 500:
                delay = BASE_DELAY * (2 ** attempt)
                print(f'[vk] попытка {attempt + 1}: ошибка {code}, ждём {delay}s')
                time.sleep(delay)
                continue
            raise  # 15/27/214 и прочие фатальные — сразу наверх, в алертер
    # все попытки исчерпаны (429/5xx) — пробрасываем последнюю ошибку с понятным текстом
    code = getattr(last_err, 'code', None) or 0
    raise RuntimeError(
        f'VK wall.post не удался после {MAX_RETRIES} попыток '
        f'(последняя ошибка API: код {code}): {last_err}'
    ) from last_err