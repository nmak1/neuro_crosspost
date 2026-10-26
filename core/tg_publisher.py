import asyncio

from aiogram import Bot, Dispatcher
from aiogram.types import Message

import config


async def _send(text: str, parse_mode: str = 'HTML') -> int:
    bot = Bot(token=config.TG_BOT_TOKEN)
    try:
        # канал принимает html-разметку, markdown тут режет эмодзи на ровном месте
        msg: Message = await bot.send_message(chat_id=config.TG_CHAT_ID, text=text, parse_mode=parse_mode)
        return msg.message_id
    finally:
        await bot.session.close()


def publish_tg(text: str) -> str:
    loop = asyncio.new_event_loop()
    try:
        return str(loop.run_until_complete(_send(text)))
    finally:
        loop.close()
