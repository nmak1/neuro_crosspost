import json
import os
from datetime import datetime, timezone

STATE_FILE = os.path.join('data', 'state.json')


def load_state() -> dict:
    if not os.path.exists(STATE_FILE):
        return {'used_topic_ids': [], 'last_run': None}
    with open(STATE_FILE, encoding='utf-8') as f:
        return json.load(f)


def mark_used(topic_id: str):
    st = load_state()
    if topic_id not in st['used_topic_ids']:
        st['used_topic_ids'].append(topic_id)
    st['last_run'] = datetime.now(timezone.utc).isoformat()
    os.makedirs('data', exist_ok=True)
    with open(STATE_FILE, 'w', encoding='utf-8') as f:
        json.dump(st, f, ensure_ascii=False, indent=2)
