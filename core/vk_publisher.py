import vk_api
from vk_api.exceptions import VkApiError

import config

# стенка группы живёт по id=-group_id, это специфика vk api
def _wall_owner() -> int:
    return -int(config.VK_GROUP_ID)


def publish_vk(text: str) -> str:
    """кидаем пост на стену, возвращаем post_id вида 235314099_123"""
    session = vk_api.VkApi(token=config.VK_TOKEN)
    vk = session.get_api()
    res = vk.wall.post(owner_id=_wall_owner(), from_group=1, message=text)
    return f'{config.VK_GROUP_ID}_{res["post_id"]}'
