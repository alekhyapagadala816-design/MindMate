import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  MessageCircle, 
  Send,
  Search,
  Phone,
  Video,
  MoreVertical,
  User,
  Clock,
  Circle
} from 'lucide-react';
import { ChatRoom, ChatMessage } from '../../types';

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([
    {
      id: '1',
      participants: [
        {
          id: 'counsellor1',
          name: 'Dr. Sarah Johnson',
          email: 'sarah@mindmate.com',
          role: 'counsellor',
          joinedAt: new Date(),
          isOnline: true
        }
      ],
      messages: [
        {
          id: '1',
          content: 'Hi! I\'m here to support you. How are you feeling today?',
          sender: {
            id: 'counsellor1',
            name: 'Dr. Sarah Johnson',
            email: 'sarah@mindmate.com',
            role: 'counsellor',
            joinedAt: new Date()
          },
          timestamp: new Date('2024-07-15T10:30:00'),
          read: true
        },
        {
          id: '2',
          content: 'Thank you for reaching out. I\'ve been feeling quite overwhelmed with my coursework lately.',
          sender: user!,
          timestamp: new Date('2024-07-15T10:32:00'),
          read: true
        },
        {
          id: '3',
          content: 'I understand that feeling. Academic pressure can be really challenging. Can you tell me more about what specifically is making you feel overwhelmed?',
          sender: {
            id: 'counsellor1',
            name: 'Dr. Sarah Johnson',
            email: 'sarah@mindmate.com',
            role: 'counsellor',
            joinedAt: new Date()
          },
          timestamp: new Date('2024-07-15T10:35:00'),
          read: true
        }
      ],
      type: 'counsellor'
    },
    {
      id: '2',
      participants: [
        {
          id: 'peer1',
          name: 'Alex Chen',
          email: 'alex@example.com',
          role: 'student',
          joinedAt: new Date(),
          isOnline: false
        }
      ],
      messages: [
        {
          id: '4',
          content: 'Hey! I saw your post about study anxiety. I totally relate to that feeling.',
          sender: {
            id: 'peer1',
            name: 'Alex Chen',
            email: 'alex@example.com',
            role: 'student',
            joinedAt: new Date()
          },
          timestamp: new Date('2024-07-14T16:20:00'),
          read: true
        },
        {
          id: '5',
          content: 'Thank you for reaching out! It really helps to know I\'m not alone in this.',
          sender: user!,
          timestamp: new Date('2024-07-14T16:25:00'),
          read: true
        }
      ],
      type: 'peer'
    },
    {
      id: '3',
      participants: [
        {
          id: 'counsellor2',
          name: 'Dr. Michael Park',
          email: 'michael@mindmate.com',
          role: 'counsellor',
          joinedAt: new Date(),
          isOnline: true
        }
      ],
      messages: [
        {
          id: '6',
          content: 'Hello! I wanted to follow up on our session last week. How have you been feeling?',
          sender: {
            id: 'counsellor2',
            name: 'Dr. Michael Park',
            email: 'michael@mindmate.com',
            role: 'counsellor',
            joinedAt: new Date()
          },
          timestamp: new Date('2024-07-13T14:15:00'),
          read: false
        }
      ],
      type: 'counsellor'
    }
  ]);

  const availableCounsellors = [
    {
      id: 'counsellor3',
      name: 'Dr. Emily Rodriguez',
      specialty: 'Anxiety & Stress Management',
      isOnline: true,
      nextAvailable: 'Available now'
    },
    {
      id: 'counsellor4',
      name: 'Dr. James Wilson',
      specialty: 'Academic Pressure & Performance',
      isOnline: false,
      nextAvailable: 'Available at 2:00 PM'
    },
    {
      id: 'counsellor5',
      name: 'Dr. Lisa Thompson',
      specialty: 'Depression & Mood Support',
      isOnline: true,
      nextAvailable: 'Available now'
    }
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    const newChatMessage: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      sender: user!,
      timestamp: new Date(),
      read: true
    };

    setChatRooms(prevRooms => 
      prevRooms.map(room => 
        room.id === selectedRoom 
          ? { ...room, messages: [...room.messages, newChatMessage] }
          : room
      )
    );

    setNewMessage('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const selectedChatRoom = selectedRoom ? chatRooms.find(room => room.id === selectedRoom) : null;
  const otherParticipant = selectedChatRoom?.participants[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              <h3 className="text-sm font-medium text-gray-500 px-2 mb-2">Recent Conversations</h3>
              {chatRooms.map(room => {
                const participant = room.participants[0];
                const lastMessage = room.messages[room.messages.length - 1];
                const unreadCount = room.messages.filter(m => !m.read && m.sender.id !== user?.id).length;
                
                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                      selectedRoom === room.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-white">
                            {participant.name.charAt(0)}
                          </span>
                        </div>
                        {participant.isOnline && (
                          <div className="absolute bottom-0 right-2 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {participant.name}
                          </p>
                          <div className="flex items-center">
                            {room.type === 'counsellor' && (
                              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full mr-2">
                                Counsellor
                              </span>
                            )}
                            {unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {lastMessage?.content}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {lastMessage && formatDate(lastMessage.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Available Counsellors */}
            <div className="p-2 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 px-2 mb-2">Available Counsellors</h3>
              {availableCounsellors.map(counsellor => (
                <div key={counsellor.id} className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer mb-1">
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-medium text-white">
                          {counsellor.name.charAt(3)} {/* Dr. */}
                        </span>
                      </div>
                      {counsellor.isOnline && (
                        <Circle className="absolute bottom-0 right-2 w-3 h-3 text-green-500 fill-current" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{counsellor.name}</p>
                      <p className="text-xs text-gray-600">{counsellor.specialty}</p>
                      <p className="text-xs text-green-600">{counsellor.nextAvailable}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChatRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-white">
                        {otherParticipant?.name.charAt(0)}
                      </span>
                    </div>
                    {otherParticipant?.isOnline && (
                      <div className="absolute bottom-0 right-2 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{otherParticipant?.name}</h3>
                    <p className="text-sm text-gray-500">
                      {otherParticipant?.isOnline ? 'Online now' : 'Last seen recently'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Video className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedChatRoom.messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender.id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender.id === user?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender.id === user?.id ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-600">
                  Choose a conversation from the sidebar to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;