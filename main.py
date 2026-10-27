import asyncio
import json
import logging
import logging.handlers
import random
from datetime import datetime

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger

import config
from core import alerter, llm_client, state_manager
from core.tg_publisher import publish_tg
from core.vk_publisher import publish_vk

TOPICS_FILE = 'data/topics.json'


def setup_logging():
    """консоль + ротация в logs/app.log (ТЗ п.3/п.4.4)"""
    import os
    os.makedirs('logs', exist_ok=True)
    root = logging.getLogger()
    root.setLevel(getattr(logging, config.LOG_LEVEL.upper(), logging.INFO))
    fmt = logging.Formatter('%(asctime)s %(levelname)s %(name)s: %(message)s')
    sh = logging.StreamHandler()
    sh.setFormatter(fmt)
    fh = logging.handlers.RotatingFileHandler(
        os.path.join('logs', 'app.log'), maxBytes=1_000_000, backupCount=3, encoding='utf-8')
    fh.setFormatter(fmt)
    root.addHandler(sh)
    root.addHandler(fh)
    logging.captureWarnings(True)


log = logging.getLogger('main')


def pick_topic() -> dict | None:
    """берём случайную ещё не использованную тему; все закончились — None"""
    with open(TOPICS_FILE, encoding='utf-8') as f:
        topics = json.load(f)['topics']
    used = set(state_manager.load_state()['used_topic_ids'])
    free = [t for t in topics if t['id'] not in used]
    return random.choice(free) if free else None


def run_job():
    log.info('пора постить')
    topic = pick_topic()
    if not topic:
        # ТЗ п.7: когда темы кончились — не молчим, а алертим
        msg = 'темы в data/topics.json закончились — пополните базу или сбросьте data/state.json'
        log.error(msg)
        alerter.send_alert(msg)
        return
    try:
        texts = asyncio_run(llm_client.generate_post_text(topic['title'], topic['category']))
        vk_id = publish_vk(texts['vk'])
        tg_id = publish_tg(texts['tg'])
        state_manager.mark_used(topic['id'])
        log.info('Успешно опубликовано: VK post_id=%s, TG message_id=%s, тема: %s',
                 vk_id, tg_id, topic['title'])
    except Exception as e:
        # сюда кидаем всё, что упало — разработчику в личку, детали в лог
        err = str(e)
        log.exception('публикация не удалась: %s', err)
        alerter.send_alert(f'Сбой на теме "{topic["title"]}": {err}')


def asyncio_run(coro):
    # asyncio.run() нельзя вызывать из уже работающего event loop —
    # на всякий случай поддерживаем запуск и в sync, и в async контексте
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        return asyncio.run(coro)
    import concurrent.futures
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
        return pool.submit(asyncio.run, coro).result()


if __name__ == '__main__':
    setup_logging()
    missing = config.check_env()
    if missing:
        raise SystemExit(f'не хватает переменных окружения: {", ".join(missing)}. скопируйте .env.example в .env')

    sched = BlockingScheduler(timezone='Europe/Moscow')

    day_codes = {'mon': 'mon', 'tue': 'tue', 'wed': 'wed', 'thu': 'thu',
                 'fri': 'fri', 'sat': 'sat', 'sun': 'sun'}
    bad = [d for d in config.POST_DAYS if d not in day_codes]
    if bad:
        raise SystemExit(f'непонятные дни в POST_DAYS: {", ".join(bad)}. ждём mon,tue,wed,thu,fri,sat,sun')

    hh, mm = config.POST_TIME_MSK.split(':')
    days_expr = ','.join(day_codes[d] for d in config.POST_DAYS)
    # один слот на каждый выбранный день — значит ровно 1 пост в день и N штук в неделю
    for d in config.POST_DAYS:
        sched.add_job(run_job, CronTrigger(day_of_week=d, hour=int(hh), minute=int(mm),
                                           timezone='Europe/Moscow'))
    print(f'планировщик взлетел: {config.POST_TIME_MSK} МСК по дням {days_expr} '
          f'({len(config.POST_DAYS)} пост/нед, 1 в день)')
    sched.start()
