import os

PROMPTS_DIR = os.path.dirname(os.path.abspath(__file__))

VK_SYSTEM = 'Ты ведёшь паблик об остеопатии, науке и медицине. Пиши по-русски, без эзотерики, с эмодзи умеренно, в конце 3-5 хэштегов.'
TG_SYSTEM = 'Ты ведёшь телеграм-канал @nocnnov. Коротко, разметка HTML (<b>, <i>), без маркдауна, до 700 символов.'


def _read(fname: str, fallback: str) -> str:
    path = os.path.join(PROMPTS_DIR, fname)
    if os.path.exists(path):
        with open(path, encoding='utf-8') as f:
            return f.read()
    return fallback


def build_vk_prompt(topic_title: str, category: str) -> str:
    tpl = _read('vk_template.txt', 'Тема: {topic}\nРубрика: {category}\nНапиши пост для ВК на 900-1500 знаков.')
    return tpl.format(topic=topic_title, category=category)


def build_tg_prompt(topic_title: str, category: str) -> str:
    tpl = _read('tg_template.txt', 'Тема: {topic}\nРубрика: {category}\nНапиши пост для Telegram с HTML-разметкой.')
    return tpl.format(topic=topic_title, category=category)
