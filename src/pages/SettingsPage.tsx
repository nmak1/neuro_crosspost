import { motion } from 'framer-motion';
import { Save, Eye, EyeOff, Key, Globe, Bot, Bell, Clock } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [showTokens, setShowTokens] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Настройки</h2>
        <p className="text-slate-500 mt-1">Конфигурация системы автопостинга</p>
      </div>

      {/* API Keys */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
      >
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Key size={20} className="text-amber-500" />
          API ключи
        </h3>
        <div className="space-y-4">
          <SettingField
            label="YandexGPT API Key"
            value="••••••••••••••••••••••••"
            icon={<Bot size={16} />}
            showValue={showTokens}
          />
          <SettingField
            label="VK Service Token"
            value="••••••••••••••••••••••••"
            icon={<Globe size={16} />}
            showValue={showTokens}
          />
          <SettingField
            label="Telegram Bot Token"
            value="••••••••••••••••••••••••"
            icon={<Globe size={16} />}
            showValue={showTokens}
          />
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setShowTokens(!showTokens)}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
            >
              {showTokens ? <EyeOff size={14} /> : <Eye size={14} />}
              {showTokens ? 'Скрыть токены' : 'Показать токены'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Channel IDs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
      >
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Globe size={20} className="text-blue-500" />
          Каналы и сообщества
        </h3>
        <div className="space-y-4">
          <SettingField
            label="VK Group ID"
            value="-235314099"
            icon={<span className="text-xs font-bold text-blue-500">VK</span>}
          />
          <SettingField
            label="Telegram Chat ID"
            value="@nocnnov"
            icon={<span className="text-xs font-bold text-sky-500">TG</span>}
          />
          <SettingField
            label="Developer Chat ID (для алертов)"
            value="123456789"
            icon={<Bell size={16} className="text-red-400" />}
          />
        </div>
      </motion.div>

      {/* Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
      >
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Clock size={20} className="text-purple-500" />
          Расписание
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-600 mb-1 block">Время публикации</label>
              <input
                type="time"
                defaultValue="09:00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <div>
              <label className="text-sm text-slate-600 mb-1 block">Часовой пояс</label>
              <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                <option>Europe/Moscow (UTC+3)</option>
                <option>UTC</option>
                <option>Asia/Yekaterinburg (UTC+5)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-1 block">Дни публикации</label>
            <div className="flex flex-wrap gap-2">
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, i) => (
                <button
                  key={day}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    i < 5
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-slate-50 text-slate-400 border border-slate-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* LLM Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
      >
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Bot size={20} className="text-green-500" />
          Настройки LLM
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-600 mb-1 block">Провайдер</label>
            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
              <option>YandexGPT</option>
              <option>GigaChat</option>
              <option>OpenAI (GPT-4)</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-600 mb-1 block">Тон (VK)</label>
              <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                <option>Информационный</option>
                <option>Дружелюбный</option>
                <option>Экспертный</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-600 mb-1 block">Тон (Telegram)</label>
              <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                <option>Краткий</option>
                <option>Деловой</option>
                <option>Неформальный</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-1 block">Температура генерации</label>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="70"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Точный (0)</span>
              <span>Креативный (1)</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Retry Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
      >
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Bell size={20} className="text-red-500" />
          Обработка ошибок
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-slate-600 mb-1 block">Макс. попыток</label>
            <input
              type="number"
              defaultValue={3}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-1 block">Базовая задержка (сек)</label>
            <input
              type="number"
              defaultValue={2}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-1 block">Стратегия</label>
            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
              <option>Exponential Backoff</option>
              <option>Linear</option>
              <option>Fixed</option>
            </select>
          </div>
        </div>
        <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <p className="text-xs text-amber-700">
            💡 Exponential Backoff: задержка удваивается с каждой попыткой (2с → 4с → 8с). 
            При превышении лимита попыток — алерт в Telegram разработчику.
          </p>
        </div>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm">
          <Save size={18} />
          Сохранить настройки
        </button>
      </div>
    </div>
  );
}

function SettingField({ label, value, icon, showValue }: { label: string; value: string; icon: React.ReactNode; showValue?: boolean }) {
  return (
    <div>
      <label className="text-sm text-slate-600 mb-1 flex items-center gap-2">
        {icon}
        {label}
      </label>
      <input
        type="text"
        defaultValue={value}
        readOnly
        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-600 focus:outline-none"
      />
    </div>
  );
}
