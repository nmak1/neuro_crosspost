import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, Activity, Filter } from 'lucide-react';
import { LogEntry } from '../types';
import { useState } from 'react';

interface LogsPageProps {
  logs: LogEntry[];
}

export default function LogsPage({ logs }: LogsPageProps) {
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [componentFilter, setComponentFilter] = useState<string>('all');

  const components = [...new Set(logs.map(l => l.component))];

  const filtered = logs.filter(l => {
    const matchLevel = levelFilter === 'all' || l.level === levelFilter;
    const matchComponent = componentFilter === 'all' || l.component === componentFilter;
    return matchLevel && matchComponent;
  });

  const levelIcon = (level: string) => {
    switch (level) {
      case 'success': return <CheckCircle size={14} className="text-green-500" />;
      case 'info': return <Info size={14} className="text-blue-500" />;
      case 'warning': return <AlertTriangle size={14} className="text-yellow-500" />;
      case 'error': return <AlertTriangle size={14} className="text-red-500" />;
      default: return <Activity size={14} className="text-gray-500" />;
    }
  };

  const levelBg = (level: string) => {
    switch (level) {
      case 'success': return 'border-l-green-500 bg-green-50/50';
      case 'info': return 'border-l-blue-500 bg-blue-50/50';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50/50';
      case 'error': return 'border-l-red-500 bg-red-50/50';
      default: return 'border-l-gray-500 bg-gray-50/50';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Системные логи</h2>
        <p className="text-slate-500 mt-1">Журнал событий и обработка ошибок</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Filter size={14} />
          Фильтры:
        </div>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        >
          <option value="all">Все уровни</option>
          <option value="success">Успех</option>
          <option value="info">Инфо</option>
          <option value="warning">Предупреждение</option>
          <option value="error">Ошибка</option>
        </select>
        <select
          value={componentFilter}
          onChange={(e) => setComponentFilter(e.target.value)}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        >
          <option value="all">Все компоненты</option>
          {components.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Logs */}
      <div className="space-y-2">
        {filtered.map((log, i) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`flex items-start gap-3 p-3 rounded-xl border-l-4 ${levelBg(log.level)}`}
          >
            <div className="mt-0.5">{levelIcon(log.level)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700">{log.message}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs font-mono px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">
                  {log.component}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(log.timestamp).toLocaleString('ru-RU')}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Activity size={48} className="mx-auto mb-3 opacity-30" />
          <p>Записи не найдены</p>
        </div>
      )}
    </div>
  );
}
