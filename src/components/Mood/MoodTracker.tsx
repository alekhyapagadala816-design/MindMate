import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Activity,
  Plus
} from 'lucide-react';
import { MoodEntry } from '../../types';

const MoodTracker: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMood, setCurrentMood] = useState(5);
  const [moodNotes, setMoodNotes] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  const moodData: MoodEntry[] = [
    { id: '1', date: new Date('2024-01-15'), mood: 7, notes: 'Good day at university', activities: ['study', 'exercise'] },
    { id: '2', date: new Date('2024-01-14'), mood: 4, notes: 'Stressed about upcoming exam', activities: ['study'] },
    { id: '3', date: new Date('2024-01-13'), mood: 8, notes: 'Great weekend with friends', activities: ['social', 'relaxation'] },
    { id: '4', date: new Date('2024-01-12'), mood: 6, notes: 'Regular day', activities: ['study', 'sleep'] },
    { id: '5', date: new Date('2024-01-11'), mood: 3, notes: 'Feeling overwhelmed', activities: ['study'] },
    { id: '6', date: new Date('2024-01-10'), mood: 9, notes: 'Excellent therapy session', activities: ['therapy', 'meditation'] },
    { id: '7', date: new Date('2024-01-09'), mood: 5, notes: 'Neutral mood', activities: ['study', 'sleep'] }
  ];

  const activities = [
    'study', 'exercise', 'social', 'relaxation', 'therapy', 'meditation', 
    'work', 'family', 'hobbies', 'sleep', 'outdoor', 'creative'
  ];

  const moodColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#06b6d4', '#3b82f6', '#6366f1'
  ];

  const getMoodEmoji = (mood: number) => {
    if (mood <= 2) return '😢';
    if (mood <= 4) return '😔';
    if (mood <= 6) return '😐';
    if (mood <= 8) return '🙂';
    return '😊';
  };

  const getMoodLabel = (mood: number) => {
    if (mood <= 2) return 'Very Low';
    if (mood <= 4) return 'Low';
    if (mood <= 6) return 'Neutral';
    if (mood <= 8) return 'Good';
    return 'Excellent';
  };

  const averageMood = moodData.reduce((sum, entry) => sum + entry.mood, 0) / moodData.length;
  const moodTrend = moodData.length >= 2 ? moodData[0].mood - moodData[1].mood : 0;

  const handleSaveMood = () => {
    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      mood: currentMood,
      notes: moodNotes,
      activities: selectedActivities
    };
    
    // In a real app, this would save to backend
    console.log('Saving mood entry:', newEntry);
    
    setMoodNotes('');
    setSelectedActivities([]);
  };

  const toggleActivity = (activity: string) => {
    setSelectedActivities(prev => 
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mood Tracker</h1>
        <p className="text-gray-600">
          Track your daily mood and identify patterns to better understand your mental health
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Mood Entry */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Today's Mood
            </h2>
            
            <div className="text-center mb-6">
              <div className="text-6xl mb-2">{getMoodEmoji(currentMood)}</div>
              <p className="text-lg font-medium text-gray-900">{getMoodLabel(currentMood)}</p>
              <p className="text-sm text-gray-600">Rate: {currentMood}/10</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How are you feeling? (1-10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={currentMood}
                onChange={(e) => setCurrentMood(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, ${moodColors[currentMood - 1]} 0%, ${moodColors[currentMood - 1]} ${currentMood * 10}%, #e5e7eb ${currentMood * 10}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What activities did you do today?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {activities.map(activity => (
                  <button
                    key={activity}
                    onClick={() => toggleActivity(activity)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      selectedActivities.includes(activity)
                        ? 'bg-blue-100 border-blue-300 text-blue-800'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {activity}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={moodNotes}
                onChange={(e) => setMoodNotes(e.target.value)}
                placeholder="How was your day? What influenced your mood?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
              />
            </div>

            <button
              onClick={handleSaveMood}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Save Today's Mood
            </button>
          </div>
        </div>

        {/* Mood Analytics */}
        <div className="lg:col-span-2">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Mood</p>
                  <p className="text-2xl font-bold text-gray-900">{averageMood.toFixed(1)}/10</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Mood Trend</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold text-gray-900 mr-2">
                      {moodTrend > 0 ? '+' : ''}{moodTrend.toFixed(1)}
                    </p>
                    {moodTrend > 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : moodTrend < 0 ? (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    ) : (
                      <Minus className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Entries This Week</p>
                  <p className="text-2xl font-bold text-gray-900">{moodData.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Mood Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">7-Day Mood Trend</h3>
            <div className="relative h-64">
              <svg className="w-full h-full">
                {/* Grid lines */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(y => (
                  <line
                    key={y}
                    x1="0"
                    y1={`${100 - (y * 10)}%`}
                    x2="100%"
                    y2={`${100 - (y * 10)}%`}
                    stroke="#f3f4f6"
                    strokeWidth="1"
                  />
                ))}
                
                {/* Mood line */}
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  points={moodData
                    .slice()
                    .reverse()
                    .map((entry, index) => 
                      `${(index / (moodData.length - 1)) * 100},${100 - (entry.mood * 10)}`
                    )
                    .join(' ')}
                />
                
                {/* Data points */}
                {moodData.slice().reverse().map((entry, index) => (
                  <circle
                    key={entry.id}
                    cx={`${(index / (moodData.length - 1)) * 100}%`}
                    cy={`${100 - (entry.mood * 10)}%`}
                    r="4"
                    fill="#3b82f6"
                    className="hover:r-6 cursor-pointer"
                  />
                ))}
              </svg>
              
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
                {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(label => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Entries */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Entries</h3>
            <div className="space-y-4">
              {moodData.slice(0, 5).map(entry => (
                <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-2xl mr-4">{getMoodEmoji(entry.mood)}</div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {entry.date.toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-sm text-gray-600">{entry.notes}</p>
                      {entry.activities && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.activities.map(activity => (
                            <span
                              key={activity}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {activity}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{entry.mood}/10</p>
                    <p className="text-sm text-gray-500">{getMoodLabel(entry.mood)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;