import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, ExternalLink, Eye } from 'lucide-react';
import { Post } from '../types';
import { useState } from 'react';

interface PostsPageProps {
  posts: Post[];
}

export default function PostsPage({ posts }: PostsPageProps) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Публикации</h2>
        <p className="text-slate-500 mt-1">История опубликованных и неудачных постов</p>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Тема</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">VK</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Telegram</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Дата</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {posts.map((post, i) => (
                <motion.tr
                  key={post.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-700 max-w-xs truncate">{post.topicTitle}</p>
                  </td>
                  <td className="px-6 py-4">
                    <PostStatus status={post.vkStatus} platform="VK" />
                  </td>
                  <td className="px-6 py-4">
                    <PostStatus status={post.tgStatus} platform="TG" />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-500">
                      {new Date(post.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedPost(post)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Eye size={16} className="text-slate-400" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPost(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">{selectedPost.topicTitle}</h3>
              <button onClick={() => setSelectedPost(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {selectedPost.vkContent && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">VK</span>
                    </div>
                    <span className="text-sm font-medium text-blue-700">ВКонтакте</span>
                    <span className="text-xs text-blue-400 ml-auto">Post ID: {selectedPost.vkPostId}</span>
                  </div>
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">{selectedPost.vkContent}</pre>
                </div>
              )}

              {selectedPost.tgContent && (
                <div className="p-4 bg-sky-50 rounded-xl border border-sky-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">TG</span>
                    </div>
                    <span className="text-sm font-medium text-sky-700">Telegram</span>
                    <span className="text-xs text-sky-400 ml-auto">Message ID: {selectedPost.tgMessageId}</span>
                  </div>
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">{selectedPost.tgContent}</pre>
                </div>
              )}

              {selectedPost.error && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-sm text-red-600 font-medium">Ошибка:</p>
                  <p className="text-sm text-red-500 mt-1">{selectedPost.error}</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
              Опубликовано: {new Date(selectedPost.createdAt).toLocaleString('ru-RU')}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

function PostStatus({ status, platform }: { status: string; platform: string }) {
  if (status === 'success') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600">
        <CheckCircle size={14} />
        OK
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-600">
        <XCircle size={14} />
        Ошибка
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-yellow-600">
      <Clock size={14} />
      Ожидание
    </span>
  );
}
