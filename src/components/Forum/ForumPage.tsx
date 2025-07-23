import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  MessageCircle, 
  Plus, 
  Pin,
  Clock,
  User,
  ArrowUp,
  ArrowDown,
  Flag,
  Search,
  Filter
} from 'lucide-react';
import { ForumTopic, ForumReply } from '../../types';

const ForumPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newTopicData, setNewTopicData] = useState({
    title: '',
    description: '',
    category: 'general'
  });

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'general', label: 'General Discussion' },
    { id: 'academic', label: 'Academic Stress' },
    { id: 'anxiety', label: 'Anxiety Support' },
    { id: 'relationships', label: 'Relationships' },
    { id: 'motivation', label: 'Motivation & Goals' },
    { id: 'self-care', label: 'Self Care Tips' }
  ];

  const topics: ForumTopic[] = [
    {
      id: '1',
      title: 'How do you deal with imposter syndrome?',
      description: 'I constantly feel like I don\'t belong in my program and that everyone is smarter than me. How do you overcome these feelings?',
      category: 'academic',
      author: {
        id: '1',
        name: 'Alex Johnson',
        email: 'alex@example.com',
        role: 'student',
        joinedAt: new Date()
      },
      createdAt: new Date('2024-01-15T09:30:00'),
      replies: 23,
      lastActivity: new Date('2024-01-15T14:20:00'),
      pinned: true
    },
    {
      id: '2',
      title: 'Study group for anxiety management techniques',
      description: 'Looking to form a study group to learn and practice different anxiety management techniques together. Who\'s interested?',
      category: 'anxiety',
      author: {
        id: '2',
        name: 'Sarah Chen',
        email: 'sarah@example.com',
        role: 'student',
        joinedAt: new Date()
      },
      createdAt: new Date('2024-01-14T16:45:00'),
      replies: 18,
      lastActivity: new Date('2024-01-15T11:30:00')
    },
    {
      id: '3',
      title: 'Healthy sleep schedule during finals week',
      description: 'Finals are approaching and I\'m struggling to maintain a healthy sleep schedule. Any tips for balancing study time and rest?',
      category: 'self-care',
      author: {
        id: '3',
        name: 'Mike Rodriguez',
        email: 'mike@example.com',
        role: 'student',
        joinedAt: new Date()
      },
      createdAt: new Date('2024-01-14T12:15:00'),
      replies: 31,
      lastActivity: new Date('2024-01-15T10:45:00')
    },
    {
      id: '4',
      title: 'Motivational Monday - Share your wins!',
      description: 'Let\'s start the week by celebrating our small victories and progress. What are you proud of this week?',
      category: 'motivation',
      author: {
        id: '4',
        name: 'Emily Davis',
        email: 'emily@example.com',
        role: 'student',
        joinedAt: new Date()
      },
      createdAt: new Date('2024-01-14T08:00:00'),
      replies: 45,
      lastActivity: new Date('2024-01-15T09:15:00')
    }
  ];

  const replies: ForumReply[] = [
    {
      id: '1',
      content: 'I totally understand this feeling! What helped me was remembering that everyone has moments of doubt. The fact that you\'re here and asking questions shows you DO belong. Try keeping a journal of your accomplishments, no matter how small.',
      author: {
        id: '5',
        name: 'Jordan Kim',
        email: 'jordan@example.com',
        role: 'student',
        joinedAt: new Date()
      },
      createdAt: new Date('2024-01-15T10:15:00'),
      upvotes: 12,
      downvotes: 0
    },
    {
      id: '2',
      content: 'Imposter syndrome is so common in academic settings. I found that talking to older students really helped - they all went through the same feelings. Also, remember that you were accepted for a reason!',
      author: {
        id: '6',
        name: 'Taylor Brown',
        email: 'taylor@example.com',
        role: 'student',
        joinedAt: new Date()
      },
      createdAt: new Date('2024-01-15T11:30:00'),
      upvotes: 8,
      downvotes: 0
    }
  ];

  const filteredTopics = topics.filter(topic => {
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicData.title.trim() || !newTopicData.description.trim()) return;

    // In a real app, this would send to backend
    console.log('New topic:', newTopicData);
    
    setNewTopicData({ title: '', description: '', category: 'general' });
    setShowNewTopic(false);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (selectedTopic) {
    const topic = topics.find(t => t.id === selectedTopic);
    if (!topic) return null;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => setSelectedTopic(null)}
          className="text-blue-600 hover:text-blue-800 mb-6 flex items-center"
        >
          ← Back to Forum
        </button>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              {topic.pinned && <Pin className="h-5 w-5 text-yellow-500 mr-2" />}
              <h1 className="text-2xl font-bold text-gray-900">{topic.title}</h1>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <Flag className="h-4 w-4" />
            </button>
          </div>
          
          <p className="text-gray-700 mb-4">{topic.description}</p>
          
          <div className="flex items-center text-sm text-gray-500">
            <User className="h-4 w-4 mr-1" />
            <span className="mr-4">{topic.author.name}</span>
            <Clock className="h-4 w-4 mr-1" />
            <span className="mr-4">{formatTime(topic.createdAt)}</span>
            <MessageCircle className="h-4 w-4 mr-1" />
            <span>{topic.replies} replies</span>
          </div>
        </div>

        <div className="space-y-4">
          {replies.map(reply => (
            <div key={reply.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-white">
                      {reply.author.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{reply.author.name}</p>
                    <p className="text-sm text-gray-500">{formatTime(reply.createdAt)}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <Flag className="h-4 w-4" />
                </button>
              </div>
              
              <p className="text-gray-800 mb-4">{reply.content}</p>
              
              <div className="flex items-center space-x-4">
                <button className="flex items-center text-sm text-gray-600 hover:text-green-600">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  {reply.upvotes}
                </button>
                <button className="flex items-center text-sm text-gray-600 hover:text-red-600">
                  <ArrowDown className="h-4 w-4 mr-1" />
                  {reply.downvotes}
                </button>
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  Reply
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Your Reply</h3>
          <textarea
            placeholder="Share your thoughts..."
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={4}
          />
          <div className="flex justify-end mt-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Post Reply
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Forum</h1>
          <p className="text-gray-600">
            Connect with peers, share experiences, and support each other
          </p>
        </div>
        <button
          onClick={() => setShowNewTopic(true)}
          className="mt-4 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Topic
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search discussions..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-400 mr-2" />
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-4">
        {filteredTopics.map(topic => (
          <div
            key={topic.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedTopic(topic.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  {topic.pinned && <Pin className="h-4 w-4 text-yellow-500 mr-2" />}
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                    {topic.title}
                  </h3>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">{topic.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <User className="h-4 w-4 mr-1" />
                  <span className="mr-4">{topic.author.name}</span>
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="mr-4">{formatTime(topic.createdAt)}</span>
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {categories.find(c => c.id === topic.category)?.label}
                  </span>
                </div>
              </div>
              <div className="text-right ml-6">
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {topic.replies}
                </div>
                <p className="text-xs text-gray-500">
                  Last: {formatTime(topic.lastActivity)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Topic Modal */}
      {showNewTopic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Start a New Discussion</h2>
              <form onSubmit={handleCreateTopic} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic Title
                  </label>
                  <input
                    type="text"
                    value={newTopicData.title}
                    onChange={(e) => setNewTopicData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="What would you like to discuss?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newTopicData.description}
                    onChange={(e) => setNewTopicData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Provide more details about your topic..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newTopicData.category}
                    onChange={(e) => setNewTopicData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.slice(1).map(category => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewTopic(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Topic
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumPage;