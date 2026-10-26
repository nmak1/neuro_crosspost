import httpx

import config


def send_alert(text: str):
    """алерт летит разработчику в личку ботом; чат берём из ALERT_TG_CHAT_ID"""
    chat_id = config.__dict__.get('ALERT_TG_CHAT_ID') or ''
    if not chat_id or not config.TG_BOT_TOKEN:
        print(f'[alerter] нет настроек для алерта, пишем в консоль: {text}')
        return
    url = f'https://api.telegram.org/bot{config.TG_BOT_TOKEN}/sendMessage'
    try:
        httpx.post(url, json={'chat_id': chat_id, 'text': f'⚠️ neuro-crosspost: {text}'}, timeout=15)
    except Exception as e:
        print(f'[alerter] алерт не ушёл ({e}), лог только в консоли: {text}')
