import asyncio
import re  # НОВОЕ: для очистки markdown-обёрток от LLM

from aiogram import Bot
from aiogram.client.session.aiohttp import AiohttpSession
from aiogram.exceptions import TelegramAPIError, TelegramRetryAfter
from aiogram.types import Message

import config

MAX_RETRIES = 3
BASE_DELAY = 2  # exponential backoff: 2s, 4s, 8s (ТЗ п.5)

# НОВОЕ: очистка Markdown и ```-обёрток, которые LLM иногда добавляет к HTML-ответу
_MD_BOLD = re.compile(r'\*\*(.+?)\*\*', re.DOTALL)
_MD_ITALIC = re.compile(r'(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)', re.DOTALL)


def _clean_markdown(text: str) -> str:
    """LLM не умеет стабильно отдавать чистый HTML: убираем md-разметку и код-фенсы."""
    t = text.strip()
    if t.startswith('```'):  # срезать обёртку ```html ... ```
        first_nl = t.find('\n')
        if first_nl != -1:
            t = t[first_nl + 1:]
        if t.rstrip().endswith('```'):
            t = t.rstrip()[:-3]
        t = t.strip()
    t = _MD_BOLD.sub(r'<b>\1</b>', t)
    t = _MD_ITALIC.sub(r'<i>\1</i>', t)
    return t.replace('~~', '').replace('`', '')


def _tg_session():
    """сессия aiogram через SOCKS5-прокси из .env (PROXY=socks5://user:pass@host:port);
    без PROXY — обычная прямая сессия"""
    proxy = getattr(config, 'PROXY', '')
    if proxy:
        return AiohttpSession(proxy=proxy)
    return AiohttpSession()


async def _send(text: str, parse_mode: str = 'HTML') -> int:
    text = _clean_markdown(text)  # НОВОЕ: чистим ДО отправки
    bot = Bot(token=config.TG_BOT_TOKEN, session=_tg_session())
    last_err = None
    try:
        for attempt in range(MAX_RETRIES):
            try:
                msg: Message = await bot.send_message(
                    chat_id=config.TG_CHAT_ID, text=text, parse_mode=parse_mode,
                    link_preview_options=None,
                )
                return msg.message_id
            except TelegramRetryAfter as e:
                last_err = e
                print(f'[tg] flood limit, ждём {e.retry_after}s (попытка {attempt + 1})')
                await asyncio.sleep(e.retry_after)
                continue
            except TelegramAPIError as e:
                last_err = e
                status = getattr(e, 'status_code', None) or 0
                if "can't parse entities" in str(e).lower() and parse_mode == 'HTML':
                    print(f'[tg] битый HTML, переотправляем без разметки: {e}')
                    return await _send_plain_fallback(bot, text)
                if status >= 500 or status == 429:
                    delay = BASE_DELAY * (2 ** attempt)
                    print(f'[tg] попытка {attempt + 1}: ошибка {status}, ждём {delay}s')
                    await asyncio.sleep(delay)
                    continue
                raise
        raise RuntimeError(f'TG sendMessage не удался после {MAX_RETRIES} попыток') from last_err
    finally:
        await bot.session.close()


async def _send_plain_fallback(bot: Bot, text: str) -> int:
    msg = await bot.send_message(chat_id=config.TG_CHAT_ID, text=text, parse_mode=None)
    return msg.message_id


def publish_tg(text: str) -> str:
    loop = asyncio.new_event_loop()
    try:
        return str(loop.run_until_complete(_send(text)))
    finally:
        loop.close()