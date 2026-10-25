import { motion } from 'framer-motion';
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Zap,
  MessageSquare,
  Users,
} from 'lucide-react';
import { SystemStatus, LogEntry, Post, Topic } from '../types';

interface DashboardProps {
  status: SystemStatus;
  logs: LogEntry[];
  posts: Post[];
  topics: Topic[];
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    online: 'bg-green-500',
    offline: 'bg-red-500',
    degraded: 'bg-yellow-500',
    active: 'bg-green-500',
    paused: 'bg-yellow-500',
    error: 'bg-red-500',
  };
  return (
    <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors[status] || 'bg-gray-500'} animate-pulse`} />
  );
}

export default function Dashboard({ status, logs, posts, topics }: DashboardProps) {
  const totalTopics = topics.length;
  const usedTopics = topics.filter(t => t.status === 'used').length;
  const pendingTopics = topics.filter(t => t.status === 'pending').length;
  const successPosts = posts.filter(p => p.vkStatus === 'success' && p.tgStatus === 'success').length;
  const failedPosts = posts.filter(p => p.vkStatus === 'failed' || p.tgStatus === 'failed').length;

  const stats = [
    { label: 'Всего тем', value: totalTopics, icon: ListTodo, color: 'from-blue-500 to-blue-600' },
    { label: 'Опубликовано', value: successPosts, icon: CheckCircle, color: 'from-green-500 to-green-600' },
    { label: 'Ошибки', value: failedPosts, icon: AlertTriangle, color: 'from-red-500 to-red-600' },
    { label: 'В очереди', value: pendingTopics, icon: Clock, color: 'from-purple-500 to-purple-600' },
  ];

  const recentLogs = logs.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Панель управления</h2>
        <p className="text-slate-500 mt-1">Обзор системы автопостинга контента</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon size={22} className="text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
      >
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Activity size={20} className="text-blue-500" />
          Статус системы
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatusCard label="LLM API" status={status.llmApi} description="YandexGPT / GigaChat" />
          <StatusCard label="VK API" status={status.vkApi} description="wall.post" />
          <StatusCard label="Telegram API" status={status.tgApi} description="sendMessage" />
          <StatusCard label="Планировщик" status={status.scheduler} description="APScheduler" />
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-6 text-sm text-slate-500">
          <span className="flex items-center gap-2">
            <Clock size={14} />
            Последний запуск: {status.lastRun ? new Date(status.lastRun).toLocaleString('ru-RU') : '—'}
          </span>
          <span className="flex items-center gap-2">
            <Zap size={14} />
            Следующий: {status.nextRun ? new Date(status.nextRun).toLocaleString('ru-RU') : '—'}
          </span>
        </div>
      </motion.div>

      {/* Recent Logs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
      >
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <MessageSquare size={20} className="text-purple-500" />
          Последние события
        </h3>
        <div className="space-y-3">
          {recentLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
              <LogIcon level={log.level} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 truncate">{log.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400">{log.component}</span>
                  <span className="text-xs text-slate-300">•</span>
                  <span className="text-xs text-slate-400">
                    {new Date(log.timestamp).toLocaleString('ru-RU')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
      >
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-green-500" />
          Прогресс использования тем
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Использовано тем</span>
              <span className="font-medium text-slate-800">{usedTopics} / {totalTopics}</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(usedTopics / totalTopics) * 100}%` }}
                transition={{ duration: 1, delay: 0.8 }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-xl">
              <p className="text-2xl font-bold text-green-600">{usedTopics}</p>
              <p className="text-xs text-green-600">Опубликовано</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">{pendingTopics}</p>
              <p className="text-xs text-blue-600">В очереди</p>
            </div>
            <div className="p-3 bg-red-50 rounded-xl">
              <p className="text-2xl font-bold text-red-600">{topics.filter(t => t.status === 'failed').length}</p>
              <p className="text-xs text-red-600">Ошибки</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatusCard({ label, status, description }: { label: string; status: string; description: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
      <StatusBadge status={status} />
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function LogIcon({ level }: { level: string }) {
  const icons: Record<string, { icon: typeof CheckCircle; color: string }> = {
    success: { icon: CheckCircle, color: 'text-green-500' },
    info: { icon: Activity, color: 'text-blue-500' },
    warning: { icon: AlertTriangle, color: 'text-yellow-500' },
    error: { icon: AlertTriangle, color: 'text-red-500' },
  };
  const { icon: Icon, color } = icons[level] || icons.info;
  return <Icon size={16} className={`${color} mt-0.5 flex-shrink-0`} />;
}

function ListTodo({ size, className }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="5" width="6" height="6" rx="1" />
      <path d="m3 17 2 2 4-4" />
      <path d="M13 6h8" />
      <path d="M13 12h8" />
      <path d="M13 18h8" />
    </svg>
  );
}
