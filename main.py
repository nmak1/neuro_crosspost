import json
import random
from datetime import datetime

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger

import config
from core import alerter, llm_client, state_manager
from core.tg_publisher import publish_tg
from core.vk_publisher import publish_vk

TOPICS_FILE = 'data/topics.json'


def pick_topic() -> dict | None:
    """берём случайную ещё не использованную тему; все закончились — None"""
    with open(TOPICS_FILE, encoding='utf-8') as f:
        topics = json.load(f)['topics']
    used = set(state_manager.load_state()['used_topic_ids'])
    free = [t for t in topics if t['id'] not in used]
    return random.choice(free) if free else None


def run_job():
    print(f"[{datetime.now():%H:%M:%S}] пора постить")
    topic = pick_topic()
    if not topic:
        print('темы кончились, пополните data/topics.json')
        return
    try:
        texts = asyncio_run(llm_client.generate_post_text(topic['title'], topic['category']))
        vk_id = publish_vk(texts['vk'])
        tg_id = publish_tg(texts['tg'])
        state_manager.mark_used(topic['id'])
        print(f'готово: vk={vk_id}, tg={tg_id}, тема: {topic["title"]}')
    except Exception as e:
        # сюда кидаем всё, что упало — разработчику в личку, детали в консоль
        err = str(e)
        print(f'публикация не удалась: {err}')
        alerter.send_alert(f'Сбой на теме "{topic["title"]}": {err}')


def asyncio_run(coro):
    import asyncio
    return asyncio.run(coro)


if __name__ == '__main__':
    missing = config.check_env()
    if missing:
        raise SystemExit(f'не хватает переменных окружения: {", ".join(missing)}. скопируйте .env.example в .env')

    sched = BlockingScheduler(timezone='Europe/Moscow')
    for hm in config.POST_TIMES_UTC:
        hh, mm = hm.split(':')
        sched.add_job(run_job, CronTrigger(hour=int(hh), minute=int(mm)))
    print(f'планировщик взлетел, слоты UTC: {config.POST_TIMES_UTC}')
    sched.start()
