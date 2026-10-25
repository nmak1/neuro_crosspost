import { motion } from 'framer-motion';
import {
  FolderTree,
  FileCode,
  ArrowRight,
  Database,
  Globe,
  Bot,
  Clock,
  Shield,
  Zap,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

export default function ArchitecturePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Архитектура системы</h2>
        <p className="text-slate-500 mt-1">Структура проекта и схема работы автопостера</p>
      </div>

      {/* File Structure */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
      >
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <FolderTree size={20} className="text-amber-500" />
          Структура проекта
        </h3>
        <div className="bg-slate-900 rounded-xl p-5 font-mono text-sm text-slate-300 overflow-x-auto">
          <pre className="leading-relaxed">
            <span className="text-slate-300">auto_poster/</span>{'\n'}
            <span className="text-slate-500">│</span>{'\n'}
            <span className="text-slate-300">├── .env                 </span><span className="text-red-400"># Токены, ID каналов, ключи API</span>{'\n'}
            <span className="text-slate-300">├── config.py            </span><span className="text-blue-400"># Загрузка переменных из .env</span>{'\n'}
            <span className="text-slate-300">├── main.py              </span><span className="text-green-400"># Точка входа, планировщик</span>{'\n'}
            <span className="text-slate-500">│</span>{'\n'}
            <span className="text-slate-300">├── core/</span>{'\n'}
            <span className="text-slate-300">│   ├── llm_client.py    </span><span className="text-purple-400"># Логика обращения к нейросети</span>{'\n'}
            <span className="text-slate-300">│   ├── vk_publisher.py  </span><span className="text-blue-400"># Публикация в VK</span>{'\n'}
            <span className="text-slate-300">│   └── tg_publisher.py  </span><span className="text-sky-400"># Публикация в Telegram</span>{'\n'}
            <span className="text-slate-500">│</span>{'\n'}
            <span className="text-slate-300">├── data/</span>{'\n'}
            <span className="text-slate-300">│   ├── topics.json      </span><span className="text-yellow-400"># База тем/идей для постов</span>{'\n'}
            <span className="text-slate-300">│   └── state.json       </span><span className="text-yellow-400"># Состояние (использованные темы)</span>{'\n'}
            <span className="text-slate-500">│</span>{'\n'}
            <span className="text-slate-300">├── prompts/</span>{'\n'}
            <span className="text-slate-300">│   ├── vk_prompt.txt    </span><span className="text-green-400"># Шаблон промпта для VK</span>{'\n'}
            <span className="text-slate-300">│   └── tg_prompt.txt    </span><span className="text-green-400"># Шаблон промпта для TG</span>{'\n'}
            <span className="text-slate-500">│</span>{'\n'}
            <span className="text-slate-300">└── logs/</span>{'\n'}
            <span className="text-slate-300">    └── app.log          </span><span className="text-slate-500"># Файл логов</span>
          </pre>
        </div>
      </motion.div>

      {/* Workflow */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
      >
        <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
          <Zap size={20} className="text-yellow-500" />
          Рабочий процесс (Workflow)
        </h3>
        <div className="space-y-4">
          <WorkflowStep
            step={1}
            title="Выбор темы"
            description="Скрипт берет случайную неиспользованную тему из topics.json"
            icon={<Database size={18} />}
            color="blue"
          />
          <WorkflowStep
            step={2}
            title="Генерация контента"
            description="Два запроса к LLM: один для VK (1000-1500 символов, эмодзи, хэштеги), другой для TG (500-800 символов, HTML-разметка)"
            icon={<Bot size={18} />}
            color="purple"
          />
          <WorkflowStep
            step={3}
            title="Публикация в VK"
            description="Очистка Markdown → wall.post с параметрами owner_id, message, from_group=1"
            icon={<Globe size={18} />}
            color="blue"
          />
          <WorkflowStep
            step={4}
            title="Публикация в Telegram"
            description="sendMessage с parse_mode='HTML'. Fallback на отправку без разметки при ошибке"
            icon={<Globe size={18} />}
            color="sky"
          />
          <WorkflowStep
            step={5}
            title="Финализация"
            description="Пометить тему в state.json → Записать в лог → Отправить алерт при ошибке"
            icon={<CheckCircle size={18} />}
            color="green"
          />
        </div>
      </motion.div>

      {/* Tech Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
      >
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <FileCode size={20} className="text-green-500" />
          Технологический стек
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <TechCard name="Python 3.10+" description="Основной язык" color="from-blue-500 to-blue-600" />
          <TechCard name="asyncio" description="Асинхронные запросы" color="from-purple-500 to-purple-600" />
          <TechCard name="YandexGPT / GigaChat" description="LLM API" color="from-green-500 to-green-600" />
          <TechCard name="vk_api / httpx" description="VK API клиент" color="from-blue-500 to-indigo-600" />
          <TechCard name="aiogram 3.x" description="Telegram Bot API" color="from-sky-500 to-sky-600" />
          <TechCard name="APScheduler" description="Планировщик задач" color="from-amber-500 to-amber-600" />
          <TechCard name="SQLite / JSON" description="Хранение данных" color="from-orange-500 to-orange-600" />
          <TechCard name="pydantic-settings" description="Конфигурация" color="from-red-500 to-red-600" />
          <TechCard name="python-dotenv" description=".env управление" color="from-teal-500 to-teal-600" />
        </div>
      </motion.div>

      {/* Reliability */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
      >
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Shield size={20} className="text-red-500" />
          Надежность и отказоустойчивость
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReliabilityCard
            icon={<RefreshCw size={18} className="text-blue-500" />}
            title="Exponential Backoff"
            description="При ошибке 500/429: задержка 2с → 4с → 8с. До 3 попыток."
          />
          <ReliabilityCard
            icon={<AlertTriangle size={18} className="text-yellow-500" />}
            title="Алертинг"
            description="При провале всех попыток — уведомление в Telegram разработчику."
          />
          <ReliabilityCard
            icon={<Clock size={18} className="text-purple-500" />}
            title="Лимиты API"
            description="TG: 1 сообщ./сек. VK: 3 запроса/сек. asyncio.sleep между отправками."
          />
          <ReliabilityCard
            icon={<Shield size={18} className="text-green-500" />}
            title="Безопасность"
            description="Все токены в .env. Не коммитятся в git. Защита от дублей через state.json."
          />
        </div>
      </motion.div>

      {/* Prompts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
      >
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Bot size={20} className="text-purple-500" />
          Шаблоны промптов
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">VK</span>
              <span className="text-sm font-medium text-blue-700">Промпт для ВКонтакте</span>
            </div>
            <p className="text-xs text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">
              &quot;Напиши пост для ВКонтакте на тему{'\n'}
              [ТЕМА]. Используй эмодзи для списков,{'\n'}
              добавь 3-5 хэштегов в конце.{'\n'}
              Тон: [ТОН].{'\n'}
              Объем: 1000-1500 символов.{'\n'}
              Не используй Markdown, не выдумывай{'\n'}
              факты, не используй мат.&quot;
            </p>
          </div>
          <div className="p-4 bg-sky-50 rounded-xl border border-sky-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center text-white text-xs font-bold">TG</span>
              <span className="text-sm font-medium text-sky-700">Промпт для Telegram</span>
            </div>
            <p className="text-xs text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">
              &quot;Напиши пост для Telegram на тему{'\n'}
              [ТЕМА]. Используй HTML-разметку{'\n'}
              (&lt;b&gt;жирный&lt;/b&gt;, &lt;i&gt;курсив&lt;/i&gt;).{'\n'}
              Пиши кратко, без воды.{'\n'}
              Объем: 500-800 символов.{'\n'}
              Не используй Markdown, не выдумывай{'\n'}
              факты, не используй мат.&quot;
            </p>
          </div>
        </div>
      </motion.div>

      {/* Roadmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
      >
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Zap size={20} className="text-amber-500" />
          Roadmap
        </h3>
        <div className="space-y-3">
          <RoadmapItem step="Шаг 1" title="MVP: Текст без картинок" status="done" items={['Настройка .env и токенов', 'llm_client.py — генерация текстов', 'tg_publisher.py — отправка в TG', 'Тест в тестовом канале']} />
          <RoadmapItem step="Шаг 2" title="Подключение VK" status="done" items={['vk_publisher.py — публикация', 'Очистка Markdown → VK формат', 'Тест в тестовом сообществе']} />
          <RoadmapItem step="Шаг 3" title="Автоматизация" status="done" items={['APScheduler по Cron', 'topics.json + state.json', 'Логирование и алертинг']} />
          <RoadmapItem step="Шаг 4" title="V2.0 — Продвинутый" status="planned" items={['Модерация через закрытый канал', 'Генерация картинок (Kandinsky)', 'RSS-парсинг для дайджестов']} />
        </div>
      </motion.div>
    </div>
  );
}

function WorkflowStep({ step, title, description, icon, color }: { step: number; title: string; description: string; icon: React.ReactNode; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600 border-blue-200',
    purple: 'bg-purple-100 text-purple-600 border-purple-200',
    sky: 'bg-sky-100 text-sky-600 border-sky-200',
    green: 'bg-green-100 text-green-600 border-green-200',
  };

  return (
    <div className="flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorClasses[color]}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">ШАГ {step}</span>
          <h4 className="font-medium text-slate-800">{title}</h4>
        </div>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>
    </div>
  );
}

function TechCard({ name, description, color }: { name: string; description: string; color: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
        <FileCode size={14} className="text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700">{name}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function ReliabilityCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-sm font-medium text-slate-700">{title}</p>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      </div>
    </div>
  );
}

function RoadmapItem({ step, title, status, items }: { step: string; title: string; status: 'done' | 'planned'; items: string[] }) {
  return (
    <div className={`p-4 rounded-xl border ${status === 'done' ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-200'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status === 'done' ? 'bg-green-200 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
          {step}
        </span>
        <h4 className="text-sm font-medium text-slate-700">{title}</h4>
        {status === 'done' && <CheckCircle size={14} className="text-green-500 ml-auto" />}
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-slate-500 flex items-center gap-2">
            <ArrowRight size={10} className="text-slate-300" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
