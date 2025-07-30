// MindMate Application JavaScript

// Global state
let currentUser = null;
let currentView = 'dashboard';
let currentChatRoom = null;
let posts = [];
let resources = [];
let forumTopics = [];
let chatRooms = [];
let counsellors = [];
let moodEntries = [];

// API Base URL
const API_BASE = window.location.origin;

// Utility functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const showElement = (element) => element.classList.remove('hidden');
const hideElement = (element) => element.classList.add('hidden');

const formatTime = (date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
};

const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
};

// API functions
const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
};

// Authentication functions
const login = async (email, password) => {
    try {
        const data = await apiCall('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        localStorage.setItem('token', data.token);
        currentUser = data.user;
        return data;
    } catch (error) {
        throw error;
    }
};

const register = async (name, email, password, role) => {
    try {
        const data = await apiCall('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, role })
        });
        
        localStorage.setItem('token', data.token);
        currentUser = data.user;
        return data;
    } catch (error) {
        throw error;
    }
};

const logout = async () => {
    try {
        await apiCall('/api/auth/logout', { method: 'POST' });
        localStorage.removeItem('token');
        currentUser = null;
        showAuthScreen();
    } catch (error) {
        console.error('Logout failed:', error);
        localStorage.removeItem('token');
        currentUser = null;
        showAuthScreen();
    }
};

const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        showAuthScreen();
        return false;
    }
    
    try {
        const data = await apiCall('/api/auth/me');
        currentUser = data.user;
        showMainApp();
        return true;
    } catch (error) {
        localStorage.removeItem('token');
        showAuthScreen();
        return false;
    }
};

// Screen management
const showAuthScreen = () => {
    hideElement($('#loading'));
    hideElement($('#main-app'));
    showElement($('#auth-screen'));
};

const showMainApp = () => {
    hideElement($('#loading'));
    hideElement($('#auth-screen'));
    showElement($('#main-app'));
    
    // Update user info
    $('#user-name').textContent = currentUser.name;
    $('#welcome-name').textContent = currentUser.name;
    
    // Load initial data
    loadDashboardData();
    switchView('dashboard');
};

// View management
const switchView = (viewName) => {
    // Hide all views
    $$('.view').forEach(view => view.classList.remove('active'));
    $$('.nav-link').forEach(link => link.classList.remove('active'));
    
    // Show selected view
    $(`#${viewName}-view`).classList.add('active');
    $(`.nav-link[data-view="${viewName}"]`).classList.add('active');
    
    currentView = viewName;
    
    // Load view-specific data
    switch (viewName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'resources':
            loadResources();
            break;
        case 'feelings':
            loadPosts();
            break;
        case 'forum':
            loadForumTopics();
            break;
        case 'chat':
            loadChatRooms();
            loadCounsellors();
            break;
        case 'mood':
            loadMoodData();
            break;
    }
};

// Dashboard functions
const loadDashboardData = async () => {
    try {
        // Load stats
        const [postsData, chatsData, resourcesData, moodData] = await Promise.all([
            apiCall('/api/posts'),
            apiCall('/api/chat/rooms'),
            apiCall('/api/resources'),
            apiCall('/api/mood/analytics')
        ]);
        
        // Update stats
        $('#posts-count').textContent = postsData.filter(p => 
            new Date(p.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length;
        $('#chats-count').textContent = chatsData.length;
        $('#resources-count').textContent = resourcesData.length;
        $('#mood-average').textContent = moodData.averageMood || '0.0';
        
        // Load recent activity
        loadRecentActivity();
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
};

const loadRecentActivity = () => {
    const activityContainer = $('#recent-activity');
    const activities = [
        { text: 'You shared a feeling on the wall', time: '2 hours ago' },
        { text: 'New resource: Managing Exam Stress', time: '1 day ago' },
        { text: 'You joined a forum discussion', time: '2 days ago' },
        { text: 'Mood entry recorded', time: '3 days ago' }
    ];
    
    activityContainer.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-dot"></div>
            <div class="activity-content">
                <p>${activity.text}</p>
                <span>${activity.time}</span>
            </div>
        </div>
    `).join('');
};

// Resources functions
const loadResources = async () => {
    try {
        const data = await apiCall('/api/resources');
        resources = data;
        renderResources(resources);
    } catch (error) {
        console.error('Failed to load resources:', error);
        renderDefaultResources();
    }
};

const renderDefaultResources = () => {
    const defaultResources = [
        {
            id: 1,
            title: 'Managing Academic Stress',
            content: 'Learn effective techniques to handle academic pressure and maintain mental well-being during your studies.',
            category: 'stress',
            type: 'article',
            author: 'Dr. Sarah Johnson',
            url: '#',
            views: 1247
        },
        {
            id: 2,
            title: 'Anxiety Coping Strategies',
            content: 'Practical methods to manage anxiety and build resilience in challenging situations.',
            category: 'anxiety',
            type: 'guide',
            author: 'Mental Health Team',
            url: '#',
            views: 892
        },
        {
            id: 3,
            title: 'Building Healthy Study Habits',
            content: 'Create sustainable study routines that support both academic success and mental health.',
            category: 'academic',
            type: 'video',
            author: 'Prof. Michael Chen',
            url: '#',
            views: 2156
        },
        {
            id: 4,
            title: 'Self-Care for Students',
            content: 'Essential self-care practices every student should incorporate into their daily routine.',
            category: 'self-care',
            type: 'article',
            author: 'Wellness Center',
            url: '#',
            views: 1834
        },
        {
            id: 5,
            title: 'Motivation and Goal Setting',
            content: 'Strategies to stay motivated and achieve your academic and personal goals.',
            category: 'motivation',
            type: 'guide',
            author: 'Life Coach Team',
            url: '#',
            views: 967
        },
        {
            id: 6,
            title: 'Mindfulness for Students',
            content: 'Introduction to mindfulness practices that can help reduce stress and improve focus.',
            category: 'stress',
            type: 'video',
            author: 'Mindfulness Institute',
            url: '#',
            views: 1523
        }
    ];
    
    renderResources(defaultResources);
};

const renderResources = (resourcesList) => {
    const container = $('#resources-grid');
    
    container.innerHTML = resourcesList.map(resource => `
        <div class="resource-card" data-id="${resource.id}">
            <div class="resource-image">
                <i class="fas fa-${getResourceIcon(resource.type)}"></i>
            </div>
            <div class="resource-content">
                <span class="resource-type ${resource.type}">
                    <i class="fas fa-${getResourceIcon(resource.type)}"></i>
                    ${resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                </span>
                <h3 class="resource-title">${resource.title}</h3>
                <p class="resource-description">${resource.content}</p>
                <div class="resource-meta">
                    <span>By ${resource.author}</span>
                    <span class="resource-views">
                        <i class="fas fa-eye"></i>
                        ${resource.views} views
                    </span>
                </div>
                <div class="resource-actions">
                    <button class="btn-primary" onclick="viewResource(${resource.id})">
                        <i class="fas fa-external-link-alt"></i>
                        View Resource
                    </button>
                </div>
            </div>
        </div>
    `).join('');
};

const getResourceIcon = (type) => {
    switch (type) {
        case 'article': return 'file-text';
        case 'video': return 'play-circle';
        case 'guide': return 'book';
        default: return 'file';
    }
};

const viewResource = async (resourceId) => {
    try {
        await apiCall(`/api/resources/${resourceId}/view`, { method: 'POST' });
        // In a real app, this would open the resource
        alert('Resource opened! (This would normally open the actual resource)');
    } catch (error) {
        console.error('Failed to track resource view:', error);
    }
};

// Posts functions
const loadPosts = async () => {
    try {
        const data = await apiCall('/api/posts');
        posts = data;
        renderPosts(posts);
    } catch (error) {
        console.error('Failed to load posts:', error);
        renderDefaultPosts();
    }
};

const renderDefaultPosts = () => {
    const defaultPosts = [
        {
            id: 1,
            content: "Feeling overwhelmed with midterm exams coming up. Anyone else struggling with the workload? 😰",
            mood: 'stressed',
            anonymous: true,
            author: { name: 'Anonymous', role: 'student' },
            reactions: [
                { type: 'heart', users: ['user1', 'user2'] },
                { type: 'hug', users: ['user3'] }
            ],
            comments: [
                { content: "You're not alone! Take breaks and remember to breathe.", author: { name: 'Sarah' } }
            ],
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
            id: 2,
            content: "Had a great therapy session today. Feeling more hopeful about managing my anxiety. 💪",
            mood: 'motivated',
            anonymous: false,
            author: { name: 'Alex M.', role: 'student' },
            reactions: [
                { type: 'heart', users: ['user1', 'user2', 'user3'] },
                { type: 'support', users: ['user4'] }
            ],
            comments: [],
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
        },
        {
            id: 3,
            content: "Sometimes I feel like I'm not good enough for my program. Imposter syndrome is real 😢",
            mood: 'sad',
            anonymous: true,
            author: { name: 'Anonymous', role: 'student' },
            reactions: [
                { type: 'hug', users: ['user1', 'user2', 'user3', 'user4'] }
            ],
            comments: [
                { content: "You belong here! We all have those moments.", author: { name: 'Jamie' } },
                { content: "Imposter syndrome affects so many of us. You're doing great!", author: { name: 'Taylor' } }
            ],
            createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000)
        }
    ];
    
    renderPosts(defaultPosts);
};

const renderPosts = (postsList) => {
    const container = $('#posts-feed');
    
    container.innerHTML = postsList.map(post => `
        <div class="post-card" data-id="${post.id}">
            <div class="post-header">
                <div class="post-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="post-info">
                    <h4>${post.anonymous ? 'Anonymous' : post.author.name}</h4>
                    <div class="post-meta">
                        <span class="mood-badge ${post.mood}">${getMoodEmoji(post.mood)} ${post.mood}</span>
                        <span>${formatTime(new Date(post.createdAt))}</span>
                    </div>
                </div>
            </div>
            <div class="post-content">
                <p>${post.content}</p>
            </div>
            <div class="post-actions">
                <div class="post-reactions">
                    <button class="reaction-btn" onclick="reactToPost(${post.id}, 'heart')">
                        <i class="fas fa-heart"></i>
                        ${getReactionCount(post.reactions, 'heart')}
                    </button>
                    <button class="reaction-btn" onclick="reactToPost(${post.id}, 'hug')">
                        <i class="fas fa-hands"></i>
                        ${getReactionCount(post.reactions, 'hug')}
                    </button>
                    <button class="reaction-btn" onclick="reactToPost(${post.id}, 'support')">
                        <i class="fas fa-thumbs-up"></i>
                        ${getReactionCount(post.reactions, 'support')}
                    </button>
                </div>
                <button class="reaction-btn" onclick="toggleComments(${post.id})">
                    <i class="fas fa-comment"></i>
                    ${post.comments.length} comments
                </button>
            </div>
        </div>
    `).join('');
};

const getMoodEmoji = (mood) => {
    const emojis = {
        happy: '😊',
        sad: '😢',
        anxious: '😰',
        stressed: '😤',
        neutral: '😐',
        motivated: '💪'
    };
    return emojis[mood] || '😐';
};

const getReactionCount = (reactions, type) => {
    const reaction = reactions.find(r => r.type === type);
    return reaction ? reaction.users.length : 0;
};

const createPost = async (content, mood) => {
    try {
        const data = await apiCall('/api/posts', {
            method: 'POST',
            body: JSON.stringify({ content, mood, anonymous: true })
        });
        
        posts.unshift(data);
        renderPosts(posts);
        
        // Hide form and reset
        hideElement($('#new-post-form'));
        $('#post-content').value = '';
        $('.mood-btn.active').classList.remove('active');
        $('.mood-btn[data-mood="neutral"]').classList.add('active');
        
        showMessage('Post shared successfully!', 'success');
    } catch (error) {
        console.error('Failed to create post:', error);
        showMessage('Failed to share post. Please try again.', 'error');
    }
};

const reactToPost = async (postId, reactionType) => {
    try {
        await apiCall(`/api/posts/${postId}/react`, {
            method: 'POST',
            body: JSON.stringify({ type: reactionType })
        });
        
        // Reload posts to show updated reactions
        loadPosts();
    } catch (error) {
        console.error('Failed to react to post:', error);
    }
};

// Forum functions
const loadForumTopics = async () => {
    try {
        const data = await apiCall('/api/forum/topics');
        forumTopics = data;
        renderForumTopics(forumTopics);
    } catch (error) {
        console.error('Failed to load forum topics:', error);
        renderDefaultForumTopics();
    }
};

const renderDefaultForumTopics = () => {
    const defaultTopics = [
        {
            id: 1,
            title: 'Study Tips for Final Exams',
            description: 'Share your best strategies for preparing for final exams while maintaining mental health.',
            category: 'academic',
            author: { name: 'StudyBuddy', role: 'student' },
            replies: [
                { author: { name: 'Alex' } },
                { author: { name: 'Sarah' } }
            ],
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000)
        },
        {
            id: 2,
            title: 'Dealing with Social Anxiety on Campus',
            description: 'Looking for advice on how to manage social anxiety in university settings.',
            category: 'anxiety',
            author: { name: 'Anonymous', role: 'student' },
            replies: [
                { author: { name: 'Counselor Jane' } },
                { author: { name: 'Mike' } },
                { author: { name: 'Emma' } }
            ],
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now() - 30 * 60 * 1000)
        },
        {
            id: 3,
            title: 'Self-Care Routines That Actually Work',
            description: 'What self-care practices have made a real difference in your daily life?',
            category: 'self-care',
            author: { name: 'WellnessWarrior', role: 'student' },
            replies: [
                { author: { name: 'Yoga_Lover' } }
            ],
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000)
        }
    ];
    
    renderForumTopics(defaultTopics);
};

const renderForumTopics = (topicsList) => {
    const container = $('#forum-topics');
    
    container.innerHTML = topicsList.map(topic => `
        <div class="topic-card" data-id="${topic.id}" onclick="openTopic(${topic.id})">
            <div class="topic-header">
                <div>
                    <h3 class="topic-title">${topic.title}</h3>
                    <span class="topic-category">${topic.category}</span>
                </div>
            </div>
            <p class="topic-description">${topic.description}</p>
            <div class="topic-meta">
                <div class="topic-stats">
                    <span><i class="fas fa-user"></i> ${topic.author.name}</span>
                    <span><i class="fas fa-comments"></i> ${topic.replies.length} replies</span>
                    <span><i class="fas fa-clock"></i> ${formatTime(new Date(topic.lastActivity))}</span>
                </div>
            </div>
        </div>
    `).join('');
};

const openTopic = (topicId) => {
    // In a real app, this would open a detailed topic view
    console.log('Opening topic:', topicId);
    showMessage('Topic details would open here in a full implementation', 'info');
};

// Chat functions
const loadChatRooms = async () => {
    try {
        const data = await apiCall('/api/chat/rooms');
        chatRooms = data;
        renderChatRooms(chatRooms);
    } catch (error) {
        console.error('Failed to load chat rooms:', error);
        renderDefaultChatRooms();
    }
};

const loadCounsellors = async () => {
    try {
        const data = await apiCall('/api/chat/counsellors');
        counsellors = data;
        renderCounsellors(counsellors);
    } catch (error) {
        console.error('Failed to load counsellors:', error);
        renderDefaultCounsellors();
    }
};

const renderDefaultChatRooms = () => {
    const container = $('#chat-rooms');
    container.innerHTML = '<p style="color: #64748b; text-align: center; padding: 20px;">No active conversations</p>';
};

const renderDefaultCounsellors = () => {
    const defaultCounsellors = [
        {
            id: 1,
            name: 'Dr. Sarah Johnson',
            isOnline: true,
            specialty: 'Anxiety & Stress'
        },
        {
            id: 2,
            name: 'Dr. Michael Chen',
            isOnline: false,
            specialty: 'Academic Support'
        },
        {
            id: 3,
            name: 'Dr. Emily Rodriguez',
            isOnline: true,
            specialty: 'Depression & Mood'
        }
    ];
    
    renderCounsellors(defaultCounsellors);
};

const renderChatRooms = (roomsList) => {
    const container = $('#chat-rooms');
    
    if (roomsList.length === 0) {
        container.innerHTML = '<p style="color: #64748b; text-align: center; padding: 20px;">No active conversations</p>';
        return;
    }
    
    container.innerHTML = roomsList.map(room => `
        <div class="chat-room" data-id="${room.id}" onclick="openChatRoom('${room.id}')">
            <div class="chat-room-avatar">
                ${room.participants[0].name.charAt(0)}
            </div>
            <div class="chat-room-info">
                <h4>${room.participants[0].name}</h4>
                <p>${room.messages.length > 0 ? room.messages[room.messages.length - 1].content : 'No messages yet'}</p>
            </div>
        </div>
    `).join('');
};

const renderCounsellors = (counsellorsList) => {
    const container = $('#counsellors-list');
    
    container.innerHTML = counsellorsList.map(counsellor => `
        <div class="counsellor-item" data-id="${counsellor.id}" onclick="startChatWithCounsellor('${counsellor.id}')">
            <div class="counsellor-avatar">
                ${counsellor.name.split(' ').map(n => n.charAt(0)).join('')}
                ${counsellor.isOnline ? '<div class="online-indicator"></div>' : ''}
            </div>
            <div class="counsellor-info">
                <h5>${counsellor.name}</h5>
                <p class="counsellor-status ${counsellor.isOnline ? 'online' : 'offline'}">
                    ${counsellor.isOnline ? 'Online' : 'Offline'}
                </p>
                <p class="counsellor-specialty">${counsellor.specialty}</p>
            </div>
        </div>
    `).join('');
};

const openChatRoom = (roomId) => {
    currentChatRoom = roomId;
    showElement($('#chat-area'));
    hideElement($('#chat-placeholder'));
    
    // Update chat header
    $('#chat-user-name').textContent = 'Chat Room';
    $('#chat-user-status').textContent = 'Active';
    
    // Load messages (mock data for now)
    loadChatMessages(roomId);
};

const startChatWithCounsellor = async (counsellorId) => {
    try {
        const room = await apiCall('/api/chat/rooms', {
            method: 'POST',
            body: JSON.stringify({ participantId: counsellorId, type: 'counsellor' })
        });
        
        openChatRoom(room.id);
    } catch (error) {
        console.error('Failed to start chat:', error);
        showMessage('Failed to start chat. Please try again.', 'error');
    }
};

const loadChatMessages = (roomId) => {
    const container = $('#chat-messages');
    
    // Mock messages for demonstration
    const mockMessages = [
        {
            content: 'Hello! How can I help you today?',
            sender: { name: 'Counsellor' },
            createdAt: new Date(Date.now() - 10 * 60 * 1000),
            isOwn: false
        },
        {
            content: 'Hi, I\'ve been feeling really stressed about my upcoming exams.',
            sender: { name: 'You' },
            createdAt: new Date(Date.now() - 8 * 60 * 1000),
            isOwn: true
        },
        {
            content: 'I understand that exam stress can be overwhelming. Let\'s talk about some strategies that might help.',
            sender: { name: 'Counsellor' },
            createdAt: new Date(Date.now() - 5 * 60 * 1000),
            isOwn: false
        }
    ];
    
    container.innerHTML = mockMessages.map(message => `
        <div class="message ${message.isOwn ? 'own' : 'other'}">
            <div class="message-content">
                ${message.content}
                <div class="message-time">${formatTime(new Date(message.createdAt))}</div>
            </div>
        </div>
    `).join('');
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
};

const sendMessage = async () => {
    const input = $('#message-input');
    const content = input.value.trim();
    
    if (!content || !currentChatRoom) return;
    
    try {
        await apiCall(`/api/chat/rooms/${currentChatRoom}/messages`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });
        
        input.value = '';
        loadChatMessages(currentChatRoom);
    } catch (error) {
        console.error('Failed to send message:', error);
        showMessage('Failed to send message. Please try again.', 'error');
    }
};

// Mood tracking functions
const loadMoodData = async () => {
    try {
        const [entries, analytics] = await Promise.all([
            apiCall('/api/mood'),
            apiCall('/api/mood/analytics')
        ]);
        
        moodEntries = entries;
        renderMoodTracker(analytics);
        renderRecentMoodEntries(entries.slice(0, 5));
    } catch (error) {
        console.error('Failed to load mood data:', error);
        renderDefaultMoodData();
    }
};

const renderDefaultMoodData = () => {
    const analytics = {
        averageMood: 6.5,
        moodTrend: 0.5,
        totalEntries: 12,
        entries: []
    };
    
    renderMoodTracker(analytics);
    renderRecentMoodEntries([]);
};

const renderMoodTracker = (analytics) => {
    $('#average-mood').textContent = `${analytics.averageMood}/10`;
    $('#mood-trend').textContent = analytics.moodTrend > 0 ? `+${analytics.moodTrend}` : analytics.moodTrend.toString();
    $('#entries-count').textContent = analytics.totalEntries;
    
    // Initialize mood slider
    const moodRange = $('#mood-range');
    const currentMoodEmoji = $('#current-mood-emoji');
    const currentMoodLabel = $('#current-mood-label');
    const currentMoodRating = $('#current-mood-rating');
    
    const updateMoodDisplay = (value) => {
        const emojis = ['😢', '😢', '😟', '😐', '😐', '🙂', '🙂', '😊', '😊', '😄'];
        const labels = ['Very Sad', 'Sad', 'Down', 'Neutral', 'Okay', 'Good', 'Happy', 'Very Happy', 'Excellent', 'Amazing'];
        
        currentMoodEmoji.textContent = emojis[value - 1];
        currentMoodLabel.textContent = labels[value - 1];
        currentMoodRating.textContent = `Rate: ${value}/10`;
    };
    
    moodRange.addEventListener('input', (e) => {
        updateMoodDisplay(parseInt(e.target.value));
    });
    
    // Initialize activities
    renderActivitiesGrid();
    
    // Initialize with default value
    updateMoodDisplay(5);
};

const renderActivitiesGrid = () => {
    const activities = [
        'Exercise', 'Study', 'Sleep', 'Socialize',
        'Eat Well', 'Meditate', 'Work', 'Relax',
        'Creative', 'Outdoor', 'Music', 'Reading'
    ];
    
    const container = $('#activities-grid');
    container.innerHTML = activities.map(activity => `
        <button class="activity-btn" data-activity="${activity.toLowerCase()}">${activity}</button>
    `).join('');
    
    // Add click handlers
    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('activity-btn')) {
            e.target.classList.toggle('active');
        }
    });
};

const renderRecentMoodEntries = (entries) => {
    const container = $('#recent-mood-entries');
    
    if (entries.length === 0) {
        container.innerHTML = '<p style="color: #64748b; text-align: center; padding: 20px;">No mood entries yet</p>';
        return;
    }
    
    container.innerHTML = entries.map(entry => `
        <div class="entry-item">
            <div class="entry-left">
                <div class="entry-emoji">${getMoodEmojiFromRating(entry.mood)}</div>
                <div class="entry-info">
                    <h5>${formatDate(new Date(entry.date))}</h5>
                    <p>${entry.notes || 'No notes'}</p>
                    <div class="entry-activities">
                        ${(entry.activities || []).map(activity => 
                            `<span class="activity-tag">${activity}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
            <div class="entry-right">
                <p>${entry.mood}/10</p>
                <span>${getMoodLabelFromRating(entry.mood)}</span>
            </div>
        </div>
    `).join('');
};

const getMoodEmojiFromRating = (rating) => {
    const emojis = ['😢', '😢', '😟', '😐', '😐', '🙂', '🙂', '😊', '😊', '😄'];
    return emojis[rating - 1] || '😐';
};

const getMoodLabelFromRating = (rating) => {
    const labels = ['Very Sad', 'Sad', 'Down', 'Neutral', 'Okay', 'Good', 'Happy', 'Very Happy', 'Excellent', 'Amazing'];
    return labels[rating - 1] || 'Neutral';
};

const saveMoodEntry = async () => {
    const mood = parseInt($('#mood-range').value);
    const notes = $('#mood-notes').value.trim();
    const activities = Array.from($$('.activity-btn.active')).map(btn => btn.dataset.activity);
    
    try {
        await apiCall('/api/mood', {
            method: 'POST',
            body: JSON.stringify({ mood, notes, activities })
        });
        
        showMoodSaveMessage('Mood entry saved successfully!', 'success');
        
        // Reset form
        $('#mood-range').value = 5;
        $('#mood-notes').value = '';
        $$('.activity-btn.active').forEach(btn => btn.classList.remove('active'));
        
        // Reload mood data
        loadMoodData();
    } catch (error) {
        console.error('Failed to save mood entry:', error);
        showMoodSaveMessage('Failed to save mood entry. Please try again.', 'error');
    }
};

const showMoodSaveMessage = (message, type) => {
    const messageEl = $('#mood-save-message');
    messageEl.textContent = message;
    messageEl.className = `save-message ${type}`;
    showElement(messageEl);
    
    setTimeout(() => {
        hideElement(messageEl);
    }, 3000);
};

// Utility functions
const showMessage = (message, type) => {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        background: ${type === 'success' ? '#16a34a' : type === 'error' ? '#dc2626' : '#3b82f6'};
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 3000);
};

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Auth form handlers
    $('#login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = $('#login-email').value;
        const password = $('#login-password').value;
        
        try {
            await login(email, password);
            showMainApp();
        } catch (error) {
            showMessage('Login failed. Please check your credentials.', 'error');
        }
    });
    
    $('#register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = $('#register-name').value;
        const email = $('#register-email').value;
        const password = $('#register-password').value;
        const role = $('#register-role').value;
        
        try {
            await register(name, email, password, role);
            showMainApp();
        } catch (error) {
            showMessage('Registration failed. Please try again.', 'error');
        }
    });
    
    // Auth form toggles
    $('#show-register').addEventListener('click', (e) => {
        e.preventDefault();
        hideElement($('#login-form'));
        showElement($('#register-form'));
    });
    
    $('#show-login').addEventListener('click', (e) => {
        e.preventDefault();
        hideElement($('#register-form'));
        showElement($('#login-form'));
    });
    
    // Navigation
    $$('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = link.dataset.view;
            switchView(view);
        });
    });
    
    $$('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = btn.dataset.view;
            if (view) {
                switchView(view);
            }
        });
    });
    
    // Logout
    $('#logout-btn').addEventListener('click', logout);
    
    // New post form
    $('#new-post-btn').addEventListener('click', () => {
        showElement($('#new-post-form'));
    });
    
    $('#cancel-post').addEventListener('click', () => {
        hideElement($('#new-post-form'));
    });
    
    $('#submit-post').addEventListener('click', () => {
        const content = $('#post-content').value.trim();
        const mood = $('.mood-btn.active').dataset.mood;
        
        if (!content) {
            showMessage('Please enter some content for your post.', 'error');
            return;
        }
        
        createPost(content, mood);
    });
    
    // Mood selector
    $$('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.mood-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Chat message sending
    $('#send-message').addEventListener('click', sendMessage);
    $('#message-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Mood tracker
    $('#save-mood').addEventListener('click', saveMoodEntry);
    
    // Search and filters
    $('#resource-search').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = resources.filter(resource => 
            resource.title.toLowerCase().includes(query) ||
            resource.content.toLowerCase().includes(query)
        );
        renderResources(filtered);
    });
    
    $('#resource-category').addEventListener('change', (e) => {
        const category = e.target.value;
        const filtered = category === 'all' 
            ? resources 
            : resources.filter(resource => resource.category === category);
        renderResources(filtered);
    });
    
    $('#forum-search').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = forumTopics.filter(topic => 
            topic.title.toLowerCase().includes(query) ||
            topic.description.toLowerCase().includes(query)
        );
        renderForumTopics(filtered);
    });
    
    $('#forum-category').addEventListener('change', (e) => {
        const category = e.target.value;
        const filtered = category === 'all' 
            ? forumTopics 
            : forumTopics.filter(topic => topic.category === category);
        renderForumTopics(filtered);
    });
    
    // Initialize app
    checkAuth();
});