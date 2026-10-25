import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import TopicsPage from './pages/TopicsPage';
import PostsPage from './pages/PostsPage';
import LogsPage from './pages/LogsPage';
import ArchitecturePage from './pages/ArchitecturePage';
import SettingsPage from './pages/SettingsPage';
import { mockTopics, mockPosts, mockSystemStatus, mockLogs } from './data';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            status={mockSystemStatus}
            logs={mockLogs}
            posts={mockPosts}
            topics={mockTopics}
          />
        );
      case 'topics':
        return <TopicsPage topics={mockTopics} />;
      case 'posts':
        return <PostsPage posts={mockPosts} />;
      case 'logs':
        return <LogsPage logs={mockLogs} />;
      case 'architecture':
        return <ArchitecturePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard status={mockSystemStatus} logs={mockLogs} posts={mockPosts} topics={mockTopics} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      
      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
