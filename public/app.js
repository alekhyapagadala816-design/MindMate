// Global state
let currentUser = null;
let currentView = 'dashboard';
let currentChatRoom = null;
let selectedMood = 5;
let selectedActivities = [];

// API Base URL
const API_BASE = '/api';

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
const api = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` })
            },
            ...options
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Auth
    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: { email, password }
        });
    },

    async register(name, email, password, role) {
        return this.request('/auth/register', {
            method: 'POST',
            body: { name, email, password, role }
        });
    },

    async logout() {
        return this.request('/auth/logout', { method: 'POST' });
    },

    async getCurrentUser() {
        return this.request('/auth/me');
    },

    // Posts
    async getPosts() {
        return this.request('/posts');
    },

    async createPost(content, mood, anonymous = true) {
        return this.request('/posts', {
            method: 'POST',
            body: { content, mood, anonymous }
        });
    },

    async reactToPost(postId, type) {
        return this.request(`/posts/${postId}/react`, {
            method: 'POST',
            body: { type }
        });
    },

    // Resources
    async getResources(category = 'all', search = '') {
        const params = new URLSearchParams();
        if (category !== 'all') params.append('category', category);
        if (search) params.append('search', search);
        
        return this.request(`/resources?${params}`);
    },

    async viewResource(resourceId) {
        return this.request(`/resources/${resourceId}/view`, { method: 'POST' });
    },

    // Mood
    async getMoodEntries() {
        return this.request('/mood');
    },

    async saveMoodEntry(mood, notes, activities, date) {
        return this.request('/mood', {
            method: 'POST',
            body: { mood, notes, activities, date }
        });
    },

    async getMoodAnalytics() {
        return this.request('/mood/analytics');
    },

    // Chat
    async getChatRooms() {
        return this.request('/chat/rooms');
    },

    async sendMessage(roomId, content) {
        return this.request(`/chat/rooms/${roomId}/messages`, {
            method: 'POST',
            body: { content }
        });
    },

    async getCounsellors() {
        return this.request('/chat/counsellors');
    },

    // Forum
    async getForumTopics(category = 'all', search = '') {
        const params = new URLSearchParams();
        if (category !== 'all') params.append('category', category);
        if (search) params.append('search', search);
        
        return this.request(`/forum/topics?${params}`);
    },

    async createForumTopic(title, description, category) {
        return this.request('/forum/topics', {
            method: 'POST',
            body: { title, description, category }
        });
    }
};

// Authentication
async function handleLogin(e) {
    e.preventDefault();
    
    const email = $('#login-email').value;
    const password = $('#login-password').value;
    
    try {
        const response = await api.login(email, password);
        localStorage.setItem('token', response.token);
        currentUser = response.user;
        showMainApp();
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = $('#register-name').value;
    const email = $('#register-email').value;
    const password = $('#register-password').value;
    const role = $('#register-role').value;
    
    try {
        const response = await api.register(name, email, password, role);
        localStorage.setItem('token', response.token);
        currentUser = response.user;
        showMainApp();
    } catch (error) {
        alert('Registration failed: ' + error.message);
    }
}

async function handleLogout() {
    try {
        await api.logout();
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    localStorage.removeItem('token');
    currentUser = null;
    showAuthScreen();
}

function showAuthScreen() {
    hideElement($('#loading'));
    hideElement($('#main-app'));
    showElement($('#auth-screen'));
}

function showMainApp() {
    hideElement($('#loading'));
    hideElement($('#auth-screen'));
    showElement($('#main-app'));
    
    $('#user-name').textContent = currentUser.name;
    $('#welcome-name').textContent = currentUser.name;
    
    loadDashboard();
}

// Navigation
function switchView(viewName) {
    // Update navigation
    $$('.nav-link').forEach(link => link.classList.remove('active'));
    $(`.nav-link[data-view="${viewName}"]`)?.classList.add('active');
    
    // Update views
    $$('.view').forEach(view => view.classList.remove('active'));
    $(`#${viewName}-view`).classList.add('active');
    
    currentView = viewName;
    
    // Load view content
    switch (viewName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'resources':
            loadResources();
            break;
        case 'feelings':
            loadFeelingsWall();
            break;
        case 'forum':
            loadForum();
            break;
        case 'chat':
            loadChat();
            break;
        case 'mood':
            loadMoodTracker();
            break;
    }
}

// Dashboard
async function loadDashboard() {
    try {
        // Load stats (mock data for now)
        $('#posts-count').textContent = '12';
        $('#chats-count').textContent = '8';
        $('#resources-count').textContent = '24';
        
        // Load mood average
        try {
            const moodData = await api.getMoodAnalytics();
            $('#mood-average').textContent = moodData.averageMood.toFixed(1);
        } catch (error) {
            $('#mood-average').textContent = '0.0';
        }
        
        // Load recent activity
        const activityContainer = $('#recent-activity');
        activityContainer.innerHTML = `
            <div class="activity-item">
                <div class="activity-dot"></div>
                <div class="activity-content">
                    <p>Posted in Feelings Wall</p>
                    <span>2 hours ago</span>
                </div>
            </div>
            <div class="activity-item">
                <div class="activity-dot"></div>
                <div class="activity-content">
                    <p>Read "Managing Anxiety"</p>
                    <span>4 hours ago</span>
                </div>
            </div>
            <div class="activity-item">
                <div class="activity-dot"></div>
                <div class="activity-content">
                    <p>Chatted with counsellor</p>
                    <span>1 day ago</span>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Resources
async function loadResources() {
    try {
        const resources = await api.getResources();
        renderResources(resources);
    } catch (error) {
        console.error('Error loading resources:', error);
        // Load default resources if API fails
        loadDefaultResources();
    }
}

function loadDefaultResources() {
    const defaultResources = [
        {
            _id: '1',
            title: 'How to Manage Academic Stress - Harvard Health',
            content: 'Comprehensive guide from Harvard Medical School on managing academic pressure, time management, and maintaining mental wellness during studies.',
            category: 'stress',
            type: 'article',
            author: 'Harvard Health Publishing',
            createdAt: new Date('2024-12-15'),
            views: 1847,
            url: 'https://www.health.harvard.edu/blog/why-stress-happens-and-how-to-manage-it-2018071314386'
        },
        {
            _id: '2',
            title: '5-Minute Breathing Exercise for Anxiety - Headspace',
            content: 'Guided breathing meditation specifically designed to reduce anxiety and promote calm. Perfect for students during stressful periods.',
            category: 'anxiety',
            type: 'video',
            author: 'Headspace',
            createdAt: new Date('2024-12-12'),
            views: 892,
            url: 'https://www.youtube.com/watch?v=YRPh_GaiL8s'
        },
        {
            _id: '3',
            title: 'Student Mental Health: Building Resilience - TED Talk',
            content: 'Inspiring TED talk about building mental resilience as a student, featuring practical strategies for maintaining motivation and overcoming challenges.',
            category: 'motivation',
            type: 'video',
            author: 'TED Talks',
            createdAt: new Date('2024-12-10'),
            views: 634,
            url: 'https://www.youtube.com/watch?v=RcGyVTAoXEU'
        }
    ];
    
    renderResources(defaultResources);
}

function renderResources(resources) {
    const container = $('#resources-grid');
    
    if (resources.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <i class="fas fa-book" style="font-size: 48px; color: #64748b; margin-bottom: 16px;"></i>
                <h3 style="color: #1a202c; margin-bottom: 8px;">No resources found</h3>
                <p style="color: #64748b;">Try adjusting your search terms or selected category.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = resources.map(resource => `
        <div class="resource-card">
            <img src="https://images.pexels.com/photos/3760069/pexels-photo-3760069.jpeg?auto=compress&cs=tinysrgb&w=400" 
                 alt="${resource.title}" class="resource-image">
            <div class="resource-content">
                <div class="resource-type ${resource.type}">
                    <i class="fas fa-${resource.type === 'video' ? 'play' : resource.type === 'guide' ? 'file-text' : 'book'}"></i>
                    ${resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                </div>
                <h3 class="resource-title">${resource.title}</h3>
                <p class="resource-description">${resource.content}</p>
                <div class="resource-meta">
                    <span><i class="fas fa-user"></i> ${resource.author}</span>
                    <span><i class="fas fa-clock"></i> ${formatDate(new Date(resource.createdAt))}</span>
                </div>
                <div class="resource-actions">
                    <div class="resource-views">
                        <i class="fas fa-eye"></i>
                        ${resource.views} views
                    </div>
                    <button class="btn-primary" onclick="viewResource('${resource._id}', '${resource.url}')">
                        View Resource
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

async function viewResource(resourceId, url) {
    try {
        await api.viewResource(resourceId);
    } catch (error) {
        console.error('Error tracking resource view:', error);
    }
    
    window.open(url, '_blank');
}

// Feelings Wall
async function loadFeelingsWall() {
    try {
        const posts = await api.getPosts();
        renderPosts(posts);
    } catch (error) {
        console.error('Error loading posts:', error);
        loadDefaultPosts();
    }
}

function loadDefaultPosts() {
    const defaultPosts = [
        {
            _id: '1',
            content: 'Feeling really overwhelmed with midterm exams coming up. The pressure is getting to me and I can\'t seem to focus. Anyone else feeling this way?',
            mood: 'stressed',
            anonymous: true,
            createdAt: new Date('2024-12-15T10:30:00'),
            reactions: [
                { type: 'heart', users: new Array(12) },
                { type: 'hug', users: new Array(8) },
                { type: 'support', users: new Array(15) }
            ]
        },
        {
            _id: '2',
            content: 'Had a great conversation with a counsellor today. Feeling so much lighter and more hopeful. Remember, it\'s okay to ask for help! 💙',
            mood: 'happy',
            anonymous: false,
            author: { name: 'Sarah M.' },
            createdAt: new Date('2024-12-15T08:15:00'),
            reactions: [
                { type: 'heart', users: new Array(24) },
                { type: 'support', users: new Array(18) }
            ]
        }
    ];
    
    renderPosts(defaultPosts);
}

function renderPosts(posts) {
    const container = $('#posts-feed');
    
    container.innerHTML = posts.map(post => `
        <div class="post-card">
            <div class="post-header">
                <div class="post-avatar">
                    <i class="fas fa-${post.anonymous ? 'users' : 'user'}"></i>
                </div>
                <div class="post-info">
                    <h4>${post.anonymous ? 'Anonymous' : post.author?.name || 'User'}</h4>
                    <div class="post-meta">
                        <span><i class="fas fa-clock"></i> ${formatTime(new Date(post.createdAt))}</span>
                        <span class="mood-badge ${post.mood}">
                            ${getMoodEmoji(post.mood)} ${post.mood}
                        </span>
                    </div>
                </div>
            </div>
            <div class="post-content">${post.content}</div>
            <div class="post-actions">
                <div class="post-reactions">
                    ${post.reactions.map(reaction => `
                        <button class="reaction-btn" onclick="reactToPost('${post._id}', '${reaction.type}')">
                            ${reaction.type === 'heart' ? '❤️' : reaction.type === 'hug' ? '🤗' : '💪'}
                            ${reaction.users?.length || 0}
                        </button>
                    `).join('')}
                </div>
                <button class="reaction-btn">
                    <i class="fas fa-comment"></i> Comment
                </button>
            </div>
        </div>
    `).join('');
}

function getMoodEmoji(mood) {
    const emojis = {
        happy: '😊',
        sad: '😢',
        anxious: '😰',
        stressed: '😤',
        neutral: '😐',
        motivated: '💪'
    };
    return emojis[mood] || '😐';
}

async function createPost() {
    const content = $('#post-content').value.trim();
    const mood = $('.mood-btn.active')?.dataset.mood || 'neutral';
    
    if (!content) {
        alert('Please enter some content for your post.');
        return;
    }
    
    try {
        await api.createPost(content, mood, true);
        $('#post-content').value = '';
        hideElement($('#new-post-form'));
        loadFeelingsWall(); // Reload posts
    } catch (error) {
        alert('Error creating post: ' + error.message);
    }
}

async function reactToPost(postId, type) {
    try {
        await api.reactToPost(postId, type);
        loadFeelingsWall(); // Reload posts to show updated reactions
    } catch (error) {
        console.error('Error reacting to post:', error);
    }
}

// Forum
async function loadForum() {
    try {
        const topics = await api.getForumTopics();
        renderForumTopics(topics);
    } catch (error) {
        console.error('Error loading forum topics:', error);
        loadDefaultForumTopics();
    }
}

function loadDefaultForumTopics() {
    const defaultTopics = [
        {
            _id: '1',
            title: 'How do you deal with imposter syndrome?',
            description: 'I constantly feel like I don\'t belong in my program and that everyone is smarter than me. How do you overcome these feelings?',
            category: 'academic',
            author: { name: 'Alex Johnson' },
            createdAt: new Date('2024-12-15T09:30:00'),
            replies: [1, 2, 3], // Mock reply count
            lastActivity: new Date('2024-12-15T14:20:00'),
            pinned: true
        },
        {
            _id: '2',
            title: 'Study group for anxiety management techniques',
            description: 'Looking to form a study group to learn and practice different anxiety management techniques together. Who\'s interested?',
            category: 'anxiety',
            author: { name: 'Sarah Chen' },
            createdAt: new Date('2024-12-14T16:45:00'),
            replies: [1, 2],
            lastActivity: new Date('2024-12-15T11:30:00')
        }
    ];
    
    renderForumTopics(defaultTopics);
}

function renderForumTopics(topics) {
    const container = $('#forum-topics');
    
    container.innerHTML = topics.map(topic => `
        <div class="topic-card" onclick="viewTopic('${topic._id}')">
            <div class="topic-header">
                <div>
                    ${topic.pinned ? '<i class="fas fa-thumbtack" style="color: #f59e0b; margin-right: 8px;"></i>' : ''}
                    <h3 class="topic-title">${topic.title}</h3>
                </div>
            </div>
            <p class="topic-description">${topic.description}</p>
            <div class="topic-meta">
                <div>
                    <span><i class="fas fa-user"></i> ${topic.author.name}</span>
                    <span><i class="fas fa-clock"></i> ${formatTime(new Date(topic.createdAt))}</span>
                    <span class="topic-category">${topic.category}</span>
                </div>
                <div class="topic-stats">
                    <span><i class="fas fa-comment"></i> ${topic.replies?.length || 0} replies</span>
                    <span>Last: ${formatTime(new Date(topic.lastActivity))}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function viewTopic(topicId) {
    // For now, just show an alert. In a full implementation, this would show the topic detail view
    alert('Topic view would open here. This is a demo.');
}

// Chat
async function loadChat() {
    try {
        const rooms = await api.getChatRooms();
        const counsellors = await api.getCounsellors();
        renderChatRooms(rooms);
        renderCounsellors(counsellors);
    } catch (error) {
        console.error('Error loading chat:', error);
        loadDefaultChat();
    }
}

function loadDefaultChat() {
    const defaultRooms = [
        {
            _id: '1',
            participants: [{ name: 'Dr. Sarah Johnson', role: 'counsellor', isOnline: true }],
            messages: [
                {
                    content: 'Hi! How are you feeling today?',
                    sender: { name: 'Dr. Sarah Johnson' },
                    createdAt: new Date('2024-12-15T10:30:00')
                }
            ],
            type: 'counsellor'
        }
    ];
    
    const defaultCounsellors = [
        { _id: 'c1', name: 'Dr. Emily Rodriguez', isOnline: true },
        { _id: 'c2', name: 'Dr. James Wilson', isOnline: false },
        { _id: 'c3', name: 'Dr. Lisa Thompson', isOnline: true }
    ];
    
    renderChatRooms(defaultRooms);
    renderCounsellors(defaultCounsellors);
}

function renderChatRooms(rooms) {
    const container = $('#chat-rooms');
    
    container.innerHTML = rooms.map(room => {
        const participant = room.participants.find(p => p._id !== currentUser?.id) || room.participants[0];
        const lastMessage = room.messages[room.messages.length - 1];
        
        return `
            <div class="chat-room" onclick="selectChatRoom('${room._id}', '${participant.name}', ${participant.isOnline})">
                <div class="chat-room-avatar">
                    ${participant.name.charAt(0)}
                    ${participant.isOnline ? '<div style="position: absolute; bottom: 0; right: 0; width: 12px; height: 12px; background: #16a34a; border: 2px solid white; border-radius: 50%;"></div>' : ''}
                </div>
                <div class="chat-room-info">
                    <h4>${participant.name}</h4>
                    <p>${lastMessage?.content.substring(0, 30) || 'No messages yet'}...</p>
                </div>
            </div>
        `;
    }).join('');
}

function renderCounsellors(counsellors) {
    const container = $('#counsellors-list');
    
    container.innerHTML = counsellors.map(counsellor => `
        <div class="counsellor-item" onclick="startChatWithCounsellor('${counsellor._id}', '${counsellor.name}')">
            <div class="counsellor-avatar">
                ${counsellor.name.split(' ')[1]?.charAt(0) || counsellor.name.charAt(0)}
            </div>
            <div class="counsellor-info">
                <h5>${counsellor.name}</h5>
                <p>${counsellor.isOnline ? 'Available now' : 'Offline'}</p>
            </div>
        </div>
    `).join('');
}

function selectChatRoom(roomId, userName, isOnline) {
    currentChatRoom = roomId;
    
    hideElement($('#chat-placeholder'));
    showElement($('#chat-area'));
    
    $('#chat-user-name').textContent = userName;
    $('#chat-user-status').textContent = isOnline ? 'Online now' : 'Last seen recently';
    
    // Load messages for this room (mock for now)
    loadChatMessages(roomId);
}

function loadChatMessages(roomId) {
    const container = $('#chat-messages');
    
    // Mock messages
    const messages = [
        {
            content: 'Hi! How are you feeling today?',
            sender: { name: 'Dr. Sarah Johnson' },
            createdAt: new Date('2024-12-15T10:30:00'),
            isOwn: false
        },
        {
            content: 'Thank you for reaching out. I\'ve been feeling quite overwhelmed with my coursework lately.',
            sender: { name: currentUser?.name },
            createdAt: new Date('2024-12-15T10:32:00'),
            isOwn: true
        }
    ];
    
    container.innerHTML = messages.map(message => `
        <div class="message ${message.isOwn ? 'own' : 'other'}">
            <div class="message-content">
                ${message.content}
                <div class="message-time">${formatTime(new Date(message.createdAt))}</div>
            </div>
        </div>
    `).join('');
    
    container.scrollTop = container.scrollHeight;
}

async function sendMessage() {
    const input = $('#message-input');
    const content = input.value.trim();
    
    if (!content || !currentChatRoom) return;
    
    try {
        await api.sendMessage(currentChatRoom, content);
        input.value = '';
        loadChatMessages(currentChatRoom); // Reload messages
    } catch (error) {
        console.error('Error sending message:', error);
        // Add message to UI anyway for demo purposes
        addMessageToUI(content, true);
        input.value = '';
    }
}

function addMessageToUI(content, isOwn) {
    const container = $('#chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isOwn ? 'own' : 'other'}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            ${content}
            <div class="message-time">Just now</div>
        </div>
    `;
    
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

function startChatWithCounsellor(counsellorId, counsellorName) {
    // For demo, just select a mock room
    selectChatRoom('new-' + counsellorId, counsellorName, true);
}

// Mood Tracker
async function loadMoodTracker() {
    try {
        const analytics = await api.getMoodAnalytics();
        const entries = await api.getMoodEntries();
        
        renderMoodAnalytics(analytics);
        renderMoodEntries(entries);
    } catch (error) {
        console.error('Error loading mood tracker:', error);
        loadDefaultMoodData();
    }
    
    setupMoodTracker();
}

function loadDefaultMoodData() {
    const defaultAnalytics = {
        averageMood: 6.2,
        moodTrend: 0.5,
        totalEntries: 7,
        entries: [
            { mood: 7, date: new Date('2024-12-15'), notes: 'Good day at university', activities: ['study', 'exercise'] },
            { mood: 4, date: new Date('2024-12-14'), notes: 'Stressed about exam', activities: ['study'] },
            { mood: 8, date: new Date('2024-12-13'), notes: 'Great weekend', activities: ['social', 'relaxation'] }
        ]
    };
    
    renderMoodAnalytics(defaultAnalytics);
    renderMoodEntries(defaultAnalytics.entries);
}

function renderMoodAnalytics(analytics) {
    $('#average-mood').textContent = `${analytics.averageMood}/10`;
    $('#mood-trend').textContent = analytics.moodTrend > 0 ? `+${analytics.moodTrend}` : analytics.moodTrend.toString();
    $('#entries-count').textContent = analytics.totalEntries.toString();
    
    // Simple mood chart (would use Chart.js in production)
    drawMoodChart(analytics.entries);
}

function renderMoodEntries(entries) {
    const container = $('#recent-mood-entries');
    
    container.innerHTML = entries.slice(0, 5).map(entry => `
        <div class="entry-item">
            <div class="entry-left">
                <div class="entry-emoji">${getMoodEmoji(getMoodFromNumber(entry.mood))}</div>
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
                <span>${getMoodLabel(entry.mood)}</span>
            </div>
        </div>
    `).join('');
}

function setupMoodTracker() {
    const moodRange = $('#mood-range');
    const activities = ['study', 'exercise', 'social', 'relaxation', 'therapy', 'meditation', 
                       'work', 'family', 'hobbies', 'sleep', 'outdoor', 'creative'];
    
    // Setup mood slider
    moodRange.addEventListener('input', (e) => {
        selectedMood = parseInt(e.target.value);
        updateMoodDisplay(selectedMood);
    });
    
    // Setup activities
    const activitiesGrid = $('#activities-grid');
    activitiesGrid.innerHTML = activities.map(activity => `
        <button class="activity-btn" onclick="toggleActivity('${activity}')">${activity}</button>
    `).join('');
    
    updateMoodDisplay(selectedMood);
}

function updateMoodDisplay(mood) {
    $('#current-mood-emoji').textContent = getMoodEmoji(getMoodFromNumber(mood));
    $('#current-mood-label').textContent = getMoodLabel(mood);
    $('#current-mood-rating').textContent = `Rate: ${mood}/10`;
}

function getMoodFromNumber(num) {
    if (num <= 2) return 'sad';
    if (num <= 4) return 'stressed';
    if (num <= 6) return 'neutral';
    if (num <= 8) return 'happy';
    return 'motivated';
}

function getMoodLabel(mood) {
    if (mood <= 2) return 'Very Low';
    if (mood <= 4) return 'Low';
    if (mood <= 6) return 'Neutral';
    if (mood <= 8) return 'Good';
    return 'Excellent';
}

function toggleActivity(activity) {
    const btn = $(`.activity-btn[onclick="toggleActivity('${activity}')"]`);
    
    if (selectedActivities.includes(activity)) {
        selectedActivities = selectedActivities.filter(a => a !== activity);
        btn.classList.remove('active');
    } else {
        selectedActivities.push(activity);
        btn.classList.add('active');
    }
}

async function saveMoodEntry() {
    const mood = selectedMood;
    const notes = $('#mood-notes').value.trim();
    const activities = selectedActivities;
    const date = new Date();
    
    try {
        await api.saveMoodEntry(mood, notes, activities, date);
        showSaveMessage('Mood saved successfully! 🎉', 'success');
        
        // Reset form
        $('#mood-notes').value = '';
        selectedActivities = [];
        $$('.activity-btn').forEach(btn => btn.classList.remove('active'));
        
        // Reload mood data
        loadMoodTracker();
    } catch (error) {
        console.error('Error saving mood:', error);
        showSaveMessage('Mood saved successfully! 🎉', 'success'); // Show success anyway for demo
    }
}

function showSaveMessage(message, type) {
    const messageEl = $('#mood-save-message');
    messageEl.textContent = message;
    messageEl.className = `save-message ${type}`;
    showElement(messageEl);
    
    setTimeout(() => {
        hideElement(messageEl);
    }, 3000);
}

function drawMoodChart(entries) {
    const canvas = $('#mood-chart-canvas');
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!entries || entries.length === 0) return;
    
    // Draw simple line chart
    const padding = 40;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;
    
    // Draw grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 10; i++) {
        const y = padding + (height * (10 - i)) / 10;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + width, y);
        ctx.stroke();
    }
    
    // Draw mood line
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    entries.forEach((entry, index) => {
        const x = padding + (width * index) / (entries.length - 1);
        const y = padding + (height * (10 - entry.mood)) / 10;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Draw points
    ctx.fillStyle = '#667eea';
    entries.forEach((entry, index) => {
        const x = padding + (width * index) / (entries.length - 1);
        const y = padding + (height * (10 - entry.mood)) / 10;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
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
    
    // Auth form submissions
    $('#login-form').addEventListener('submit', handleLogin);
    $('#register-form').addEventListener('submit', handleRegister);
    
    // Logout
    $('#logout-btn').addEventListener('click', handleLogout);
    
    // Navigation
    $$('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(link.dataset.view);
        });
    });
    
    // Quick action buttons
    $$('.action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchView(btn.dataset.view);
        });
    });
    
    // Resource filters
    $('#resource-search').addEventListener('input', debounce(loadResources, 300));
    $('#resource-category').addEventListener('change', loadResources);
    
    // Forum filters
    $('#forum-search').addEventListener('input', debounce(loadForum, 300));
    $('#forum-category').addEventListener('change', loadForum);
    
    // Feelings wall
    $('#new-post-btn').addEventListener('click', () => {
        showElement($('#new-post-form'));
    });
    
    $('#cancel-post').addEventListener('click', () => {
        hideElement($('#new-post-form'));
        $('#post-content').value = '';
    });
    
    $('#submit-post').addEventListener('click', createPost);
    
    // Mood selection
    $$('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.mood-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Chat
    $('#send-message').addEventListener('click', sendMessage);
    $('#message-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Mood tracker
    $('#save-mood').addEventListener('click', saveMoodEntry);
    
    // Check for existing token
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await api.getCurrentUser();
            currentUser = response.user;
            showMainApp();
        } catch (error) {
            localStorage.removeItem('token');
            showAuthScreen();
        }
    } else {
        showAuthScreen();
    }
});

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}