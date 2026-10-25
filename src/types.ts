export interface Topic {
  id: string;
  title: string;
  category: string;
  status: 'pending' | 'used' | 'failed';
  createdAt: string;
  usedAt?: string;
}

export interface Post {
  id: string;
  topicId: string;
  topicTitle: string;
  vkPostId?: string;
  tgMessageId?: string;
  vkStatus: 'success' | 'failed' | 'pending';
  tgStatus: 'success' | 'failed' | 'pending';
  vkContent?: string;
  tgContent?: string;
  createdAt: string;
  error?: string;
}

export interface SystemStatus {
  llmApi: 'online' | 'offline' | 'degraded';
  vkApi: 'online' | 'offline' | 'degraded';
  tgApi: 'online' | 'offline' | 'degraded';
  scheduler: 'active' | 'paused' | 'error';
  lastRun?: string;
  nextRun?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  component: string;
}
