import { Topic, Post, SystemStatus, LogEntry } from './types';

export const mockTopics: Topic[] = [
  { id: '1', title: 'Тренды искусственного интеллекта в 2026 году', category: 'Технологии', status: 'used', createdAt: '2026-01-15T10:00:00Z', usedAt: '2026-01-16T09:00:00Z' },
  { id: '2', title: 'Как начать свой бизнес в IT', category: 'Бизнес', status: 'used', createdAt: '2026-01-15T10:00:00Z', usedAt: '2026-01-17T09:00:00Z' },
  { id: '3', title: '10 привычек продуктивных людей', category: 'Саморазвитие', status: 'pending', createdAt: '2026-01-15T10:00:00Z' },
  { id: '4', title: 'Обзор новых фреймворков для веб-разработки', category: 'Технологии', status: 'pending', createdAt: '2026-01-15T10:00:00Z' },
  { id: '5', title: 'Психология ценообразования', category: 'Бизнес', status: 'pending', createdAt: '2026-01-15T10:00:00Z' },
  { id: '6', title: 'Нейросети в медицине: прорывы 2026', category: 'Технологии', status: 'pending', createdAt: '2026-01-15T10:00:00Z' },
  { id: '7', title: 'Медитация для начинающих программистов', category: 'Саморазвитие', status: 'failed', createdAt: '2026-01-15T10:00:00Z' },
  { id: '8', title: 'Как читать техническую документацию', category: 'Саморазвитие', status: 'pending', createdAt: '2026-01-15T10:00:00Z' },
  { id: '9', title: 'Квантовые компьютеры: что нужно знать', category: 'Технологии', status: 'pending', createdAt: '2026-01-15T10:00:00Z' },
  { id: '10', title: 'Финансовая грамотность для фрилансеров', category: 'Бизнес', status: 'pending', createdAt: '2026-01-15T10:00:00Z' },
  { id: '11', title: 'DevOps практики для стартапов', category: 'Технологии', status: 'pending', createdAt: '2026-01-15T10:00:00Z' },
  { id: '12', title: 'Эмоциональный интеллект в управлении командой', category: 'Бизнес', status: 'pending', createdAt: '2026-01-15T10:00:00Z' },
];

export const mockPosts: Post[] = [
  {
    id: 'p1',
    topicId: '1',
    topicTitle: 'Тренды искусственного интеллекта в 2026 году',
    vkPostId: '12345_678',
    tgMessageId: '4521',
    vkStatus: 'success',
    tgStatus: 'success',
    vkContent: '🤖 Тренды ИИ в 2026 году\n\n1️⃣ Мультимодальные модели стали стандартом\n2️⃣ Локальные LLM на потребительских GPU\n3️⃣ ИИ-агенты для автоматизации\n4️⃣ Генерация видео в реальном времени\n5️⃣ Персональные ИИ-ассистенты\n\n#ИИ #технологии #тренды2026 #нейросети #будущее',
    tgContent: '<b>🤖 Тренды ИИ в 2026 году</b>\n\nМультимодальные модели стали стандартом. Локальные LLM работают на потребительских GPU. ИИ-агенты автоматизируют рутину. Генерация видео в реальном времени стала реальностью.',
    createdAt: '2026-01-16T09:00:00Z',
  },
  {
    id: 'p2',
    topicId: '2',
    topicTitle: 'Как начать свой бизнес в IT',
    vkPostId: '12345_679',
    tgMessageId: '4522',
    vkStatus: 'success',
    tgStatus: 'success',
    vkContent: '💼 Как начать свой бизнес в IT\n\n🔹 Определите проблему, которую решаете\n🔹 Изучите рынок и конкурентов\n🔹 Создайте MVP за 2-4 недели\n🔹 Найдите первых клиентов\n🔹 Масштабируйте то, что работает\n\n#бизнес #IT #стартап #предпринимательство',
    tgContent: '<b>💼 Бизнес в IT: первые шаги</b>\n\nОпределите проблему → Изучите рынок → Создайте MVP → Найдите клиентов → Масштабируйте.\n\n<i>Главное — начать действовать, а не бесконечно планировать.</i>',
    createdAt: '2026-01-17T09:00:00Z',
  },
  {
    id: 'p3',
    topicId: '7',
    topicTitle: 'Медитация для начинающих программистов',
    vkStatus: 'failed',
    tgStatus: 'failed',
    createdAt: '2026-01-18T09:00:00Z',
    error: 'LLM API timeout after 3 retries',
  },
];

export const mockSystemStatus: SystemStatus = {
  llmApi: 'online',
  vkApi: 'online',
  tgApi: 'online',
  scheduler: 'active',
  lastRun: '2026-01-17T09:00:00Z',
  nextRun: '2026-01-18T09:00:00Z',
};

export const mockLogs: LogEntry[] = [
  { id: 'l1', timestamp: '2026-01-17T09:00:15Z', level: 'success', message: 'Пост успешно опубликован в VK (post_id: 12345_679)', component: 'vk_publisher' },
  { id: 'l2', timestamp: '2026-01-17T09:00:16Z', level: 'success', message: 'Пост успешно опубликован в TG (message_id: 4522)', component: 'tg_publisher' },
  { id: 'l3', timestamp: '2026-01-17T09:00:16Z', level: 'info', message: 'Тема "Как начать свой бизнес в IT" помечена как использованная', component: 'state_manager' },
  { id: 'l4', timestamp: '2026-01-17T09:00:10Z', level: 'info', message: 'Генерация текста для VK завершена (1247 символов)', component: 'llm_client' },
  { id: 'l5', timestamp: '2026-01-17T09:00:08Z', level: 'info', message: 'Генерация текста для TG завершена (612 символов)', component: 'llm_client' },
  { id: 'l6', timestamp: '2026-01-17T09:00:01Z', level: 'info', message: 'Выбрана тема: "Как начать свой бизнес в IT"', component: 'topic_selector' },
  { id: 'l7', timestamp: '2026-01-17T09:00:00Z', level: 'info', message: 'Запущена задача публикации по расписанию', component: 'scheduler' },
  { id: 'l8', timestamp: '2026-01-18T09:00:30Z', level: 'error', message: 'LLM API timeout после 3 попыток (exponential backoff: 2s, 4s, 8s)', component: 'llm_client' },
  { id: 'l9', timestamp: '2026-01-18T09:00:31Z', level: 'warning', message: 'Алерт отправлен разработчику в Telegram', component: 'alerter' },
  { id: 'l10', timestamp: '2026-01-18T09:00:31Z', level: 'error', message: 'Публикация отменена: "Медитация для начинающих программистов"', component: 'scheduler' },
];
