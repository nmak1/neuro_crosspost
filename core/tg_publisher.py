import asyncio

from aiogram import Bot
from aiogram.exceptions import TelegramAPIError, TelegramRetryAfter
from aiogram.types import Message

import config

MAX_RETRIES = 3
BASE_DELAY = 2  # exponential backoff: 2s, 4s, 8s (ТЗ п.5)


async def _send(text: str, parse_mode: str = 'HTML') -> int:
    bot = Bot(token=config.TG_BOT_TOKEN)
    last_err = None
    try:
        for attempt in range(MAX_RETRIES):
            try:
                # канал принимает html-разметку, markdown тут режет эмодзи на ровном месте
                msg: Message = await bot.send_message(
                    chat_id=config.TG_CHAT_ID, text=text, parse_mode=parse_mode,
                    link_preview_options=None,  # disable_web_page_preview=False: ссылку разворачиваем (ТЗ п.4.3)
                )
                return msg.message_id
            except TelegramRetryAfter as e:
                # 429: Telegram сам говорит, сколько ждать — берём его паузу (ТЗ п.5 лимиты)
                last_err = e
                print(f'[tg] flood limit, ждём {e.retry_after}s (попытка {attempt + 1})')
                await asyncio.sleep(e.retry_after)
                continue
            except TelegramAPIError as e:
                last_err = e
                status = getattr(e, 'status_code', None) or 0
                if "can't parse entities" in str(e).lower() and parse_mode == 'HTML':
                    # LLM сломала HTML — fallback: тот же текст без разметки (ТЗ п.4.3)
                    print(f'[tg] битый HTML, переотправляем без разметки: {e}')
                    return await _send_plain_fallback(bot, text)
                if status >= 500:
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
