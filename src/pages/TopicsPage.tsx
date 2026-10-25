import { motion } from 'framer-motion';
import { CheckCircle, Clock, XCircle, Tag, Plus, Search } from 'lucide-react';
import { Topic } from '../types';
import { useState } from 'react';

interface TopicsPageProps {
  topics: Topic[];
}

export default function TopicsPage({ topics }: TopicsPageProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'used' | 'failed'>('all');

  const filtered = topics.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || t.status === filter;
    return matchSearch && matchFilter;
  });

  const statusIcon = (status: string) => {
    switch (status) {
      case 'used': return <CheckCircle size={16} className="text-green-500" />;
      case 'pending': return <Clock size={16} className="text-blue-500" />;
      case 'failed': return <XCircle size={16} className="text-red-500" />;
      default: return null;
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'used': return 'Опубликовано';
      case 'pending': return 'В очереди';
      case 'failed': return 'Ошибка';
      default: return status;
    }
  };

  const statusBadgeColor = (status: string) => {
    switch (status) {
      case 'used': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-blue-100 text-blue-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Темы и идеи</h2>
          <p className="text-slate-500 mt-1">Управление базой тем для генерации контента</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
          <Plus size={16} />
          Добавить тему
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск тем..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'used', 'failed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f === 'all' ? 'Все' : f === 'pending' ? 'В очереди' : f === 'used' ? 'Опубликовано' : 'Ошибки'}
            </button>
          ))}
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-3">
        {filtered.map((topic, i) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {statusIcon(topic.status)}
                  <h4 className="font-medium text-slate-800">{topic.title}</h4>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeColor(topic.status)}`}>
                    {statusLabel(topic.status)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Tag size={12} />
                    {topic.category}
                  </span>
                  {topic.usedAt && (
                    <span className="text-xs text-slate-400">
                      Использована: {new Date(topic.usedAt).toLocaleDateString('ru-RU')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Clock size={48} className="mx-auto mb-3 opacity-30" />
          <p>Темы не найдены</p>
        </div>
      )}
    </div>
  );
}
