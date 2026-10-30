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
        # прокси из .env (PROXY=socks5://...) — тот же путь, что и у остального TG-трафика
        proxy = getattr(config, 'PROXY', '') or None
        httpx.post(url, json={'chat_id': chat_id, 'text': f'⚠️ neuro-crosspost: {text}'},
                   timeout=15, proxy=proxy)
    except Exception as e:
        print(f'[alerter] алерт не ушёл ({e}), лог только в консоли: {text}')
