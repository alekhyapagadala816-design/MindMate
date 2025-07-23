export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'admin' | 'counsellor';
  avatar?: string;
  joinedAt: Date;
  isOnline?: boolean;
}

export interface Resource {
  id: string;
  title: string;
  content: string;
  category: 'stress' | 'anxiety' | 'motivation' | 'self-care' | 'academic';
  type: 'article' | 'video' | 'guide';
  author: string;
  createdAt: Date;
  views: number;
  thumbnail?: string;
  url: string;
}

export interface Post {
  id: string;
  content: string;
  mood: 'happy' | 'sad' | 'anxious' | 'stressed' | 'neutral' | 'motivated';
  anonymous: boolean;
  author?: User;
  createdAt: Date;
  reactions: { type: 'heart' | 'hug' | 'support'; count: number }[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
}

export interface ForumTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  author: User;
  createdAt: Date;
  replies: number;
  lastActivity: Date;
  pinned?: boolean;
}

export interface ForumReply {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
  upvotes: number;
  downvotes: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: User;
  timestamp: Date;
  read: boolean;
}

export interface ChatRoom {
  id: string;
  participants: User[];
  messages: ChatMessage[];
  lastMessage?: ChatMessage;
  type: 'counsellor' | 'peer';
}

export interface MoodEntry {
  id: string;
  date: Date;
  mood: number; // 1-10 scale
  notes?: string;
  activities?: string[];
}

export interface Analytics {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalResources: number;
  mostViewedResources: Resource[];
  moodTrends: { date: string; averageMood: number }[];
}