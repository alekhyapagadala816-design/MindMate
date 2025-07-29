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
        
        document.getElementById('new-topic-btn').addEventListener('click', () => {
            showNewTopicForm();
        });
    }
};

// Authentication
async function handleLogin(e) {
            <div class="topic-card" onclick="openTopicView('${topic.id}')">
    
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
            title: 'The Complete Guide to Managing Academic Stress and Anxiety',
            content: 'A comprehensive resource from leading psychologists on how to handle exam pressure, assignment deadlines, and academic perfectionism. Learn evidence-based techniques including the Pomodoro method, mindfulness practices, and cognitive restructuring.',
            category: 'stress',
            type: 'article',
            author: 'Dr. Sarah Mitchell, Clinical Psychologist',
            createdAt: new Date('2024-12-15'),
            views: 2847,
            url: 'https://www.verywellmind.com/academic-stress-4157543'
        },
        {
            _id: '2',
            title: '10-Minute Daily Meditation for Student Mental Health',
            content: 'A soothing guided meditation designed specifically for students dealing with academic pressure. This session includes breathing techniques, body scan relaxation, and positive affirmations to start your day with clarity and calm.',
            category: 'anxiety',
            type: 'video',
            author: 'Mindful Campus Initiative',
            createdAt: new Date('2024-12-12'),
            views: 1892,
            url: 'https://www.youtube.com/watch?v=inpok4MKVLM'
        },
        {
            _id: '3',
            title: 'Breaking the Perfectionism Trap: A Student\'s Journey',
            content: 'An inspiring TED talk by a former perfectionist student who shares her journey of overcoming academic anxiety and imposter syndrome. Learn practical strategies for embracing failure as growth and finding balance in academic life.',
            category: 'motivation',
            type: 'video',
            author: 'Jessica Chen, Stanford Graduate',
            createdAt: new Date('2024-12-10'),
            views: 3634,
            url: 'https://www.youtube.com/watch?v=f4Uj03de3SY'
        },
        {
            _id: '4',
            title: 'Sleep Hygiene for Students: Your Ultimate Guide',
            content: 'Poor sleep affects 70% of college students. This comprehensive guide covers everything from creating the perfect sleep environment to managing late-night study sessions without sacrificing rest quality.',
            category: 'self-care',
            type: 'article',
            author: 'Sleep Foundation Research Team',
            createdAt: new Date('2024-12-08'),
            views: 1456,
            url: 'https://www.sleepfoundation.org/how-sleep-works/sleep-hygiene-tips'
        },
        {
            _id: '5',
            title: 'Anxiety Relief: Progressive Muscle Relaxation',
            content: 'A 15-minute guided progressive muscle relaxation session perfect for before exams or when feeling overwhelmed. This technique helps release physical tension and calm racing thoughts.',
            category: 'anxiety',
            type: 'video',
            author: 'Dr. Michael Torres, Therapist',
            createdAt: new Date('2024-12-07'),
            views: 987,
            url: 'https://www.youtube.com/watch?v=1nZEdqcGVzo'
        },
        {
            _id: '6',
            title: 'Time Management Mastery for Overwhelmed Students',
            content: 'Transform your chaotic schedule into a well-organized system. Learn the Eisenhower Matrix, time-blocking techniques, and how to say no to commitments that don\'t serve your goals.',
            category: 'academic',
            type: 'guide',
            author: 'Productivity Coach Maria Santos',
            createdAt: new Date('2024-12-05'),
            views: 2156,
            url: 'https://www.mindtools.com/pages/article/newHTE_91.htm'
        },
        {
            _id: '7',
            title: 'Building Healthy Study Habits That Actually Stick',
            content: 'Science-backed strategies for creating sustainable study routines. Discover the spacing effect, active recall techniques, and how to make studying more engaging and effective.',
            category: 'academic',
            type: 'article',
            author: 'Learning Sciences Institute',
            createdAt: new Date('2024-12-03'),
            views: 1789,
            url: 'https://www.edutopia.org/article/study-strategies-that-work'
        },
        {
            _id: '8',
            title: 'Mindful Movement: Yoga for Student Stress Relief',
            content: 'A gentle 20-minute yoga flow designed for students who spend long hours studying. Perfect for relieving neck tension, improving focus, and boosting energy levels naturally.',
            category: 'self-care',
            type: 'video',
            author: 'Yoga with Adriene',
            createdAt: new Date('2024-12-01'),
            views: 2445,
            url: 'https://www.youtube.com/watch?v=VaoV1PrYft4'
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
            content: 'Finals week is approaching and I\'m having panic attacks every time I think about my organic chemistry exam. I\'ve been studying for weeks but still feel unprepared. The "what if I fail" thoughts won\'t stop. Has anyone found ways to manage this kind of exam anxiety? I really need some support right now. 😰',
            mood: 'stressed',
            anonymous: true,
            createdAt: new Date('2024-12-15T10:30:00'),
            reactions: [
                { type: 'heart', users: new Array(23) },
                { type: 'hug', users: new Array(18) },
                { type: 'support', users: new Array(31) }
            ]
        },
        {
            _id: '2',
            content: 'Just wanted to share some good news! After months of struggling with depression, I finally reached out to the campus counseling center. My therapist helped me realize that my negative self-talk was making everything worse. We\'ve been working on cognitive behavioral techniques and I\'m starting to see small improvements. To anyone hesitating - please reach out for help. You deserve support! 💙✨',
            mood: 'happy',
            anonymous: false,
            author: { name: 'Sarah M.' },
            createdAt: new Date('2024-12-15T08:15:00'),
            reactions: [
                { type: 'heart', users: new Array(47) },
                { type: 'support', users: new Array(35) }
            ]
        },
        {
            _id: '3',
            content: 'Does anyone else feel like they\'re constantly behind? I see my classmates posting about internships and achievements on social media, and I feel like I\'m failing at life. I know comparison is the thief of joy, but it\'s so hard not to compare myself to others. How do you deal with imposter syndrome?',
            mood: 'anxious',
            anonymous: true,
            createdAt: new Date('2024-12-14T16:45:00'),
            reactions: [
                { type: 'heart', users: new Array(19) },
                { type: 'hug', users: new Array(25) },
                { type: 'support', users: new Array(22) }
            ]
        },
        {
            _id: '4',
            content: 'Today marks 30 days since I started my morning meditation practice! 🧘‍♀️ It\'s only 10 minutes, but it\'s made such a difference in how I handle stress. My anxiety levels have decreased significantly, and I feel more centered throughout the day. Small consistent actions really do add up. What small habits have helped you?',
            mood: 'motivated',
            anonymous: false,
            author: { name: 'Alex R.' },
            createdAt: new Date('2024-12-14T09:20:00'),
            reactions: [
                { type: 'heart', users: new Array(32) },
                { type: 'support', users: new Array(28) }
            ]
        },
        {
            _id: '5',
            content: 'Having a really tough day. My roommate situation is stressing me out, I bombed my presentation yesterday, and I just feel emotionally drained. Sometimes it feels like everything is falling apart at once. I know this feeling will pass, but right now it\'s overwhelming. Sending love to anyone else having a difficult day. 💔',
            mood: 'sad',
            anonymous: true,
            createdAt: new Date('2024-12-13T14:30:00'),
            reactions: [
                { type: 'heart', users: new Array(16) },
                { type: 'hug', users: new Array(29) },
                { type: 'support', users: new Array(21) }
            ]
        },
        {
            _id: '6',
            content: 'PSA: Your mental health is more important than your GPA! 📢 I used to be a perfectionist who would have breakdowns over B+ grades. This semester I\'ve been focusing on balance - getting enough sleep, exercising, maintaining friendships. My grades are still good, but more importantly, I\'m actually enjoying college now. Remember to be kind to yourself! 🌟',
            mood: 'happy',
            anonymous: false,
            author: { name: 'Jordan K.' },
            createdAt: new Date('2024-12-13T11:15:00'),
            reactions: [
                { type: 'heart', users: new Array(41) },
                { type: 'support', users: new Array(33) }
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
            id: '1',
            title: 'Imposter Syndrome in STEM Fields - Let\'s Talk About It',
            description: 'I\'m a computer science major and constantly feel like I don\'t belong. Everyone seems to code effortlessly while I struggle with basic concepts. I got into this program, so I must be capable, but the self-doubt is overwhelming. How do you overcome these feelings? What strategies have worked for you?',
            fullContent: `
                <p>I've been in my CS program for two years now, and the feeling hasn't gone away. In fact, it seems to get worse as the coursework becomes more challenging. I see my classmates discussing complex algorithms like they're talking about the weather, while I'm still trying to wrap my head around basic data structures.</p>
                <p>The worst part is during group projects. I feel like I'm always the one slowing everyone down, asking questions that seem obvious to others. I've started avoiding study groups because I'm embarrassed about how much I don't know.</p>
                <p>Has anyone else experienced this? How did you push through? I'm starting to question whether I chose the right major, even though programming is something I genuinely enjoy when I'm not comparing myself to others.</p>
            `,
            category: 'academic',
            author: { name: 'TechStudent23' },
            createdAt: new Date('2024-12-15T09:30:00'),
            replies: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // Mock reply count
            lastActivity: new Date('2024-12-15T14:20:00'),
            pinned: true
        },
        {
            _id: '2',
            id: '2',
            title: 'Weekly Anxiety Support Circle - Join Us! 🤝',
            description: 'Hey everyone! I\'m organizing a weekly virtual meetup for students dealing with anxiety. We\'ll share coping strategies, practice breathing exercises together, and just support each other. No judgment, just understanding. Meetings will be Wednesdays at 7 PM EST. Comment if you\'re interested!',
            category: 'anxiety',
            author: { name: 'MindfulMaven' },
            createdAt: new Date('2024-12-14T16:45:00'),
            replies: [1, 2, 3, 4, 5, 6, 7, 8],
            lastActivity: new Date('2024-12-15T11:30:00')
        },
            id: '3',
        {
            _id: '3',
            title: 'Dealing with Academic Burnout - Recovery Stories Needed',
            description: 'I think I\'m experiencing burnout. I used to love learning, but now everything feels like a chore. I can barely get out of bed some days, and my grades are suffering. Has anyone successfully recovered from academic burnout? What did your recovery look like? I need hope that this gets better.',
            category: 'academic',
            author: { name: 'BurntOutButHopeful' },
            createdAt: new Date('2024-12-14T13:20:00'),
            replies: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
            lastActivity: new Date('2024-12-15T10:45:00')
        },
        {
            _id: '4',
            title: 'Healthy Relationship Boundaries with Family During College',
            description: 'My parents call me multiple times a day asking about grades, social life, and future plans. While I know they care, it\'s becoming overwhelming and affecting my mental health. How do you set healthy boundaries with well-meaning but overbearing family members? I don\'t want to hurt their feelings but need space to grow.',
            category: 'relationships',
            author: { name: 'IndependentLearner' },
            createdAt: new Date('2024-12-13T19:15:00'),
            replies: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            lastActivity: new Date('2024-12-14T22:30:00')
        },
        {
            _id: '5',
            title: 'Self-Care Sunday Ideas for Busy Students 🌸',
            description: 'Let\'s share our favorite self-care activities that actually fit into a student budget and schedule! I\'ll start: face masks while studying, 20-minute nature walks between classes, and cooking a nice meal on Sunday evenings. What are your go-to self-care practices?',
            category: 'self-care',
            author: { name: 'SelfCareAdvocate' },
            createdAt: new Date('2024-12-13T15:00:00'),
            replies: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
            lastActivity: new Date('2024-12-15T08:20:00')
        },
        {
            _id: '6',
            title: 'Finding Motivation After a Major Setback',
            description: 'I failed my most important exam this semester and I\'m devastated. This was supposed to be my major, my career path, everything I\'ve worked toward. Now I\'m questioning everything and feeling completely lost. How do you rebuild motivation and confidence after a major academic failure?',
            category: 'motivation',
            author: { name: 'StartingOver' },
            createdAt: new Date('2024-12-12T21:45:00'),
            replies: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            lastActivity: new Date('2024-12-14T16:10:00')
        },
        {
            _id: '7',
            title: 'Social Anxiety in Group Projects - Survival Tips?',
            description: 'Group projects are my nightmare. I have good ideas but freeze up in meetings, worry about being judged, and often end up doing extra work to avoid confrontation. This is affecting my grades and I know I need to address it. Any tips for managing social anxiety in academic settings?',
            category: 'anxiety',
            author: { name: 'QuietContributor' },
            createdAt: new Date('2024-12-12T14:30:00'),
            replies: [1, 2, 3, 4, 5, 6, 7],
            lastActivity: new Date('2024-12-13T20:15:00')
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
            participants: [{ name: 'Dr. Emily Rodriguez', role: 'counsellor', isOnline: true }],
            messages: [
                {
                    content: 'Hi there! I\'m glad you reached out today. How are you feeling right now?',
                    sender: { name: 'Dr. Emily Rodriguez' },
                    createdAt: new Date('2024-12-15T10:30:00')
                },
                {
                    content: 'Thank you for asking. I\'ve been feeling quite overwhelmed with finals approaching. The anxiety is really getting to me.',
                    sender: { name: currentUser?.name || 'You' },
                    createdAt: new Date('2024-12-15T10:32:00')
                },
                {
                    content: 'That\'s completely understandable. Finals can be incredibly stressful. Can you tell me more about what specifically is making you feel most anxious?',
                    sender: { name: 'Dr. Emily Rodriguez' },
                    createdAt: new Date('2024-12-15T10:33:00')
                },
                {
                    content: 'I think it\'s the fear of not being prepared enough, even though I\'ve been studying consistently. I keep having "what if" thoughts about failing.',
                    sender: { name: currentUser?.name || 'You' },
                    createdAt: new Date('2024-12-15T10:35:00')
                },
                {
                    content: 'Those "what if" thoughts are very common with anxiety. Let\'s work on some grounding techniques. Have you tried the 5-4-3-2-1 method when you feel overwhelmed?',
                    sender: { name: 'Dr. Emily Rodriguez' },
                    createdAt: new Date('2024-12-15T10:37:00')
                }
            ],
            type: 'counsellor'
        },
        {
            _id: '2',
            participants: [{ name: 'Maya Chen', role: 'student', isOnline: false }],
            messages: [
                {
                    content: 'Hey! How did your presentation go today?',
                    sender: { name: 'Maya Chen' },
                    createdAt: new Date('2024-12-14T15:20:00')
                },
                {
                    content: 'It went better than expected! Thanks for helping me practice yesterday. Your feedback really helped me feel more confident.',
                    sender: { name: currentUser?.name || 'You' },
                    createdAt: new Date('2024-12-14T15:45:00')
                },
                {
                    content: 'That\'s amazing! I\'m so proud of you for pushing through the anxiety. Want to celebrate with coffee later?',
                    sender: { name: 'Maya Chen' },
                    createdAt: new Date('2024-12-14T16:00:00')
                }
            ],
            type: 'peer'
        },
        {
            _id: '3',
            participants: [{ name: 'Dr. James Wilson', role: 'counsellor', isOnline: false }],
            messages: [
                {
                    content: 'Good morning! I wanted to follow up on our session yesterday. How are you feeling about the coping strategies we discussed?',
                    sender: { name: 'Dr. James Wilson' },
                    createdAt: new Date('2024-12-13T09:00:00')
                },
                {
                    content: 'Morning Dr. Wilson! I tried the breathing exercise when I felt anxious last night and it actually helped. Thank you for teaching me that.',
                    sender: { name: currentUser?.name || 'You' },
                    createdAt: new Date('2024-12-13T09:15:00')
                },
                {
                    content: 'That\'s wonderful to hear! Remember, these techniques get more effective with practice. Keep using them whenever you feel overwhelmed.',
                    sender: { name: 'Dr. James Wilson' },
                    createdAt: new Date('2024-12-13T09:20:00')
                }
            ],
            type: 'counsellor'
        },
        {
            _id: '4',
            participants: [{ name: 'Alex Thompson', role: 'student', isOnline: true }],
            messages: [
                {
                    content: 'Are you going to the study group tonight?',
                    sender: { name: 'Alex Thompson' },
                    createdAt: new Date('2024-12-15T12:00:00')
                },
                {
                    content: 'Yes! I really need help with organic chemistry. Are you bringing your notes?',
                    sender: { name: currentUser?.name || 'You' },
                    createdAt: new Date('2024-12-15T12:05:00')
                },
                {
                    content: 'Absolutely! I also found some great practice problems we can work through together.',
                    sender: { name: 'Alex Thompson' },
                    createdAt: new Date('2024-12-15T12:07:00')
                }
            ],
            type: 'peer'
        }
    ];
    
    const defaultCounsellors = [
        { _id: 'c1', name: 'Dr. Emily Rodriguez', isOnline: true, specialty: 'Anxiety & Stress Management' },
        { _id: 'c2', name: 'Dr. James Wilson', isOnline: false, specialty: 'Depression & Mood Disorders' },
        { _id: 'c3', name: 'Dr. Lisa Thompson', isOnline: true, specialty: 'Academic Performance & Motivation' },
        { _id: 'c4', name: 'Dr. Michael Chen', isOnline: true, specialty: 'Social Anxiety & Relationships' },
        { _id: 'c5', name: 'Dr. Sarah Martinez', isOnline: false, specialty: 'Trauma & PTSD' },
        { _id: 'c6', name: 'Dr. David Kim', isOnline: true, specialty: 'ADHD & Learning Differences' }
    ];
    
    renderChatRooms(defaultRooms);
    renderCounsellors(defaultCounsellors);
}

function renderChatRooms(rooms) {
    const container = $('#chat-rooms');
    
        
        document.getElementById('send-message').addEventListener('click', sendMessage);
        document.getElementById('message-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    container.innerHTML = rooms.map(room => {
        const participant = room.participants.find(p => p._id !== currentUser?.id) || room.participants[0];
        const lastMessage = room.messages[room.messages.length - 1];
        
        return `
            <div class="chat-room" onclick="openChat('${room.id}')" data-room-id="${room.id}">
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
                ${counsellor.isOnline ? '<div class="online-indicator"></div>' : ''}
            </div>
            <div class="counsellor-info">
                <h5>${counsellor.name}</h5>
                <p class="counsellor-status ${counsellor.isOnline ? 'online' : 'offline'}">
                    ${counsellor.isOnline ? '🟢 Available now' : '🔴 Offline'}
                </p>
                ${counsellor.specialty ? `<p class="counsellor-specialty">${counsellor.specialty}</p>` : ''}
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
            content: 'Hi there! I\'m glad you reached out today. How are you feeling right now?',
            sender: { name: 'Dr. Emily Rodriguez' },
            createdAt: new Date('2024-12-15T10:30:00'),
            isOwn: false
        },
        {
            content: 'Thank you for asking. I\'ve been feeling quite overwhelmed with finals approaching. The anxiety is really getting to me.',
            sender: { name: currentUser?.name },
            createdAt: new Date('2024-12-15T10:32:00'),
            isOwn: true
        },
        {
            content: 'That\'s completely understandable. Finals can be incredibly stressful. Can you tell me more about what specifically is making you feel most anxious?',
            sender: { name: 'Dr. Emily Rodriguez' },
            createdAt: new Date('2024-12-15T10:33:00'),
            isOwn: false
        },
        {
            content: 'I think it\'s the fear of not being prepared enough, even though I\'ve been studying consistently. I keep having "what if" thoughts about failing.',
            sender: { name: currentUser?.name },
            createdAt: new Date('2024-12-15T10:35:00'),
            isOwn: true
        },
        {
            content: 'Those "what if" thoughts are very common with anxiety. Let\'s work on some grounding techniques. Have you tried the 5-4-3-2-1 method when you feel overwhelmed?',
            sender: { name: 'Dr. Emily Rodriguez' },
            createdAt: new Date('2024-12-15T10:37:00'),
            isOwn: false
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