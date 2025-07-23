import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BookOpen, 
  Play, 
  FileText,
  Search,
  Filter,
  Plus,
  Eye,
  Clock,
  User
} from 'lucide-react';
import { Resource } from '../../types';

const ResourceHub: React.FC = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddResource, setShowAddResource] = useState(false);

  const categories = [
    { id: 'all', label: 'All Resources', count: 48 },
    { id: 'stress', label: 'Stress Management', count: 12 },
    { id: 'anxiety', label: 'Anxiety Help', count: 15 },
    { id: 'motivation', label: 'Motivation', count: 8 },
    { id: 'self-care', label: 'Self Care', count: 10 },
    { id: 'academic', label: 'Academic Support', count: 3 }
  ];

  const resources: Resource[] = [
    {
      id: '1',
      title: 'Managing Academic Stress: A Complete Guide',
      content: 'Learn effective strategies to handle academic pressure and maintain your well-being.',
      category: 'stress',
      type: 'article',
      author: 'Dr. Sarah Johnson',
      createdAt: new Date('2024-07-15'),
      views: 1847,
      thumbnail: 'https://images.pexels.com/photos/3760069/pexels-photo-3760069.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '2',
      title: 'Breathing Exercises for Anxiety Relief',
      content: 'Simple breathing techniques you can use anywhere to reduce anxiety and panic.',
      category: 'anxiety',
      type: 'video',
      author: 'Mind Mate Team',
      createdAt: new Date('2024-07-12'),
      views: 892,
      thumbnail: 'https://images.pexels.com/photos/3094215/pexels-photo-3094215.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '3',
      title: 'Building Daily Motivation Habits',
      content: 'Create sustainable motivation practices that will keep you going through tough times.',
      category: 'motivation',
      type: 'guide',
      author: 'Prof. Michael Chen',
      createdAt: new Date('2024-07-10'),
      views: 634,
      thumbnail: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '4',
      title: 'Self-Care Checklist for Students',
      content: 'A comprehensive checklist to ensure you are taking care of yourself while studying.',
      category: 'self-care',
      type: 'guide',
      author: 'Lisa Rodriguez',
      createdAt: new Date('2024-07-08'),
      views: 1203,
      thumbnail: 'https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '5',
      title: 'Understanding Exam Anxiety',
      content: 'Learn why exam anxiety happens and proven strategies to overcome it.',
      category: 'anxiety',
      type: 'article',
      author: 'Dr. Emily Watson',
      createdAt: new Date('2024-07-05'),
      views: 756,
      thumbnail: 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '6',
      title: 'Time Management for Better Mental Health',
      content: 'How proper time management can reduce stress and improve your overall well-being.',
      category: 'academic',
      type: 'video',
      author: 'Dr. James Park',
      createdAt: new Date('2024-07-03'),
      views: 445,
      thumbnail: 'https://images.pexels.com/photos/3760265/pexels-photo-3760265.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Play;
      case 'guide': return FileText;
      default: return BookOpen;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'text-red-600 bg-red-100';
      case 'guide': return 'text-green-600 bg-green-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resource Hub</h1>
          <p className="text-gray-600">
            Curated mental health resources to support your well-being journey
          </p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowAddResource(true)}
            className="mt-4 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search resources..."
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
                {category.label} ({category.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(resource => {
          const TypeIcon = getTypeIcon(resource.type);
          const typeColor = getTypeColor(resource.type);
          
          return (
            <div key={resource.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={resource.thumbnail}
                  alt={resource.title}
                  className="w-full h-48 object-cover"
                />
                <div className={`absolute top-4 left-4 px-2 py-1 rounded-full ${typeColor} text-xs font-medium flex items-center`}>
                  <TypeIcon className="h-3 w-3 mr-1" />
                  {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {resource.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {resource.content}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {resource.author}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {resource.createdAt.toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Eye className="h-4 w-4 mr-1" />
                    {resource.views} views
                  </div>
                  <button 
                    onClick={() => window.open(resource.thumbnail, '_blank')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    View Resource
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-600">Try adjusting your search terms or selected category.</p>
        </div>
      )}

      {/* Add Resource Modal */}
      {showAddResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Resource</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="stress">Stress Management</option>
                      <option value="anxiety">Anxiety Help</option>
                      <option value="motivation">Motivation</option>
                      <option value="self-care">Self Care</option>
                      <option value="academic">Academic Support</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="article">Article</option>
                      <option value="video">Video</option>
                      <option value="guide">Guide</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddResource(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Resource
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

export default ResourceHub;