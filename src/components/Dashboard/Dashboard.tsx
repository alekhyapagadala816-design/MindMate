import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Heart, 
  MessageCircle, 
  BookOpen, 
  Users, 
  TrendingUp,
  Calendar,
  Clock,
  Award
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Posts This Week', value: '12', icon: Heart, color: 'text-pink-600 bg-pink-100' },
    { label: 'Chat Sessions', value: '8', icon: MessageCircle, color: 'text-blue-600 bg-blue-100' },
    { label: 'Resources Read', value: '24', icon: BookOpen, color: 'text-green-600 bg-green-100' },
    { label: 'Forum Interactions', value: '18', icon: Users, color: 'text-purple-600 bg-purple-100' }
  ];

  const recentActivities = [
    { action: 'Posted in Feelings Wall', time: '2 hours ago', type: 'post' },
    { action: 'Read "Managing Anxiety"', time: '4 hours ago', type: 'resource' },
    { action: 'Chatted with counsellor Sarah', time: '1 day ago', type: 'chat' },
    { action: 'Joined "Academic Stress" discussion', time: '2 days ago', type: 'forum' }
  ];

  const upcomingEvents = [
    { title: 'Group Meditation Session', time: 'Today at 3:00 PM', participants: 12 },
    { title: 'Study Skills Workshop', time: 'Tomorrow at 10:00 AM', participants: 8 },
    { title: 'Peer Support Circle', time: 'Friday at 2:00 PM', participants: 15 }
  ];

  const quickActions = [
    { label: 'Share Your Feelings', icon: Heart, color: 'bg-pink-500 hover:bg-pink-600' },
    { label: 'Start a Chat', icon: MessageCircle, color: 'bg-blue-500 hover:bg-blue-600' },
    { label: 'Browse Resources', icon: BookOpen, color: 'bg-green-500 hover:bg-green-600' },
    { label: 'Join Forum', icon: Users, color: 'bg-purple-500 hover:bg-purple-600' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-8">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-blue-100">
          How are you feeling today? Remember, taking care of your mental health is just as important as your studies.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${stat.color} mr-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Quick Actions
          </h2>
          <div className="space-y-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  className={`w-full flex items-center p-3 rounded-lg text-white transition-colors ${action.color}`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Upcoming Events
          </h2>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-sm font-semibold text-gray-900">{event.title}</h3>
                <p className="text-xs text-gray-600">{event.time}</p>
                <p className="text-xs text-blue-600">{event.participants} participants</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mood Check-in */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Award className="h-5 w-5 mr-2" />
          Daily Mood Check-in
        </h2>
        <p className="text-gray-600 mb-4">How are you feeling today? Track your mood to better understand your patterns.</p>
        <div className="flex space-x-4">
          {['😢', '😐', '🙂', '😊', '😄'].map((emoji, index) => (
            <button
              key={index}
              className="text-3xl p-3 rounded-full hover:bg-gray-100 transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;