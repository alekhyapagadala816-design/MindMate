import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Heart, 
  MessageCircle, 
  Send,
  Plus,
  Clock,
  Flag,
  Users
} from 'lucide-react';
import { Post } from '../../types';

const FeelingsWall: React.FC = () => {
  const { user } = useAuth();
  const [newPost, setNewPost] = useState('');
  const [selectedMood, setSelectedMood] = useState<'happy' | 'sad' | 'anxious' | 'stressed' | 'neutral' | 'motivated'>('neutral');
  const [showNewPost, setShowNewPost] = useState(false);

  const moods = [
    { id: 'happy', emoji: '😊', label: 'Happy', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'sad', emoji: '😢', label: 'Sad', color: 'bg-blue-100 text-blue-800' },
    { id: 'anxious', emoji: '😰', label: 'Anxious', color: 'bg-orange-100 text-orange-800' },
    { id: 'stressed', emoji: '😤', label: 'Stressed', color: 'bg-red-100 text-red-800' },
    { id: 'neutral', emoji: '😐', label: 'Neutral', color: 'bg-gray-100 text-gray-800' },
    { id: 'motivated', emoji: '💪', label: 'Motivated', color: 'bg-green-100 text-green-800' }
  ];

  const posts: Post[] = [
    {
      id: '1',
      content: 'Feeling really overwhelmed with midterm exams coming up. The pressure is getting to me and I can\'t seem to focus. Anyone else feeling this way?',
      mood: 'stressed',
      anonymous: true,
      createdAt: new Date('2024-01-15T10:30:00'),
      reactions: [
        { type: 'heart', count: 12 },
        { type: 'hug', count: 8 },
        { type: 'support', count: 15 }
      ],
      comments: []
    },
    {
      id: '2',
      content: 'Had a great conversation with a counsellor today. Feeling so much lighter and more hopeful. Remember, it\'s okay to ask for help! 💙',
      mood: 'happy',
      anonymous: false,
      author: {
        id: '2',
        name: 'Sarah M.',
        email: 'sarah@example.com',
        role: 'student',
        joinedAt: new Date()
      },
      createdAt: new Date('2024-01-15T08:15:00'),
      reactions: [
        { type: 'heart', count: 24 },
        { type: 'support', count: 18 }
      ],
      comments: []
    },
    {
      id: '3',
      content: 'Starting my morning with meditation and it\'s making such a difference. Small steps towards better mental health. What are your morning rituals?',
      mood: 'motivated',
      anonymous: true,
      createdAt: new Date('2024-01-14T18:45:00'),
      reactions: [
        { type: 'heart', count: 19 },
        { type: 'support', count: 22 }
      ],
      comments: []
    },
    {
      id: '4',
      content: 'Some days are harder than others. Today feels like everything is too much. But I know this feeling will pass. Sending strength to anyone who needs it.',
      mood: 'sad',
      anonymous: true,
      createdAt: new Date('2024-01-14T14:20:00'),
      reactions: [
        { type: 'hug', count: 31 },
        { type: 'support', count: 28 }
      ],
      comments: []
    }
  ];

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    // In a real app, this would send to backend
    console.log('New post:', { content: newPost, mood: selectedMood });
    
    setNewPost('');
    setShowNewPost(false);
  };

  const getMoodStyle = (mood: string) => {
    const moodData = moods.find(m => m.id === mood);
    return moodData ? moodData.color : 'bg-gray-100 text-gray-800';
  };

  const getMoodEmoji = (mood: string) => {
    const moodData = moods.find(m => m.id === mood);
    return moodData ? moodData.emoji : '😐';
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Feelings Wall</h1>
        <p className="text-gray-600 mb-6">
          Share your thoughts and feelings in a safe, supportive community
        </p>
        
        <button
          onClick={() => setShowNewPost(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
        >
          <Plus className="h-5 w-5 mr-2" />
          Share Your Feelings
        </button>
      </div>

      {/* New Post Form */}
      {showNewPost && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How are you feeling?</h2>
          <form onSubmit={handleSubmitPost}>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share what's on your mind... Your post can be anonymous."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
            />
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How are you feeling right now?
              </label>
              <div className="flex flex-wrap gap-2">
                {moods.map(mood => (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => setSelectedMood(mood.id as any)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedMood === mood.id
                        ? mood.color + ' ring-2 ring-blue-500'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {mood.emoji} {mood.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowNewPost(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Send className="h-4 w-4 mr-2" />
                Share Anonymously
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                  {post.anonymous ? (
                    <Users className="h-5 w-5 text-gray-600" />
                  ) : (
                    <span className="text-sm font-medium text-gray-700">
                      {post.author?.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {post.anonymous ? 'Anonymous' : post.author?.name}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatTime(post.createdAt)}
                    <span className={`ml-3 px-2 py-1 rounded-full text-xs ${getMoodStyle(post.mood)}`}>
                      {getMoodEmoji(post.mood)} {post.mood}
                    </span>
                  </div>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <Flag className="h-4 w-4" />
              </button>
            </div>
            
            <p className="text-gray-800 mb-4 leading-relaxed">{post.content}</p>
            
            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex space-x-4">
                {post.reactions.map((reaction, index) => (
                  <button
                    key={index}
                    className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {reaction.type === 'heart' && <Heart className="h-4 w-4 mr-1" />}
                    {reaction.type === 'hug' && <span className="mr-1">🤗</span>}
                    {reaction.type === 'support' && <span className="mr-1">💪</span>}
                    {reaction.count}
                  </button>
                ))}
              </div>
              <button className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors">
                <MessageCircle className="h-4 w-4 mr-1" />
                Comment
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Support Message */}
      <div className="mt-12 bg-blue-50 rounded-lg p-6 text-center">
        <Heart className="h-8 w-8 text-blue-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          You're Not Alone
        </h3>
        <p className="text-gray-600 mb-4">
          Remember that seeking help is a sign of strength. Our community and counsellors are here to support you.
        </p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Talk to a Counsellor
        </button>
      </div>
    </div>
  );
};

export default FeelingsWall;