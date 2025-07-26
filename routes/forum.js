const express = require('express');
const ForumTopic = require('../models/ForumTopic');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all forum topics
router.get('/topics', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const topics = await ForumTopic.find(query)
      .populate('author', 'name email role')
      .populate('replies.author', 'name')
      .sort({ pinned: -1, lastActivity: -1 });

    res.json(topics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new topic
router.post('/topics', auth, async (req, res) => {
  try {
    const { title, description, category } = req.body;

    const topic = new ForumTopic({
      title,
      description,
      category,
      author: req.user.id
    });

    await topic.save();
    await topic.populate('author', 'name email role');

    res.status(201).json(topic);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single topic with replies
router.get('/topics/:id', async (req, res) => {
  try {
    const topic = await ForumTopic.findById(req.params.id)
      .populate('author', 'name email role')
      .populate('replies.author', 'name email role');

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    res.json(topic);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add reply to topic
router.post('/topics/:id/replies', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const topic = await ForumTopic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    topic.replies.push({
      content,
      author: req.user.id
    });

    topic.lastActivity = new Date();
    await topic.save();

    await topic.populate('replies.author', 'name email role');
    res.json(topic);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Vote on reply
router.post('/topics/:topicId/replies/:replyId/vote', auth, async (req, res) => {
  try {
    const { type } = req.body; // 'up' or 'down'
    const topic = await ForumTopic.findById(req.params.topicId);

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const reply = topic.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    // Remove existing votes by this user
    reply.upvotes = reply.upvotes.filter(id => !id.equals(req.user.id));
    reply.downvotes = reply.downvotes.filter(id => !id.equals(req.user.id));

    // Add new vote
    if (type === 'up') {
      reply.upvotes.push(req.user.id);
    } else if (type === 'down') {
      reply.downvotes.push(req.user.id);
    }

    await topic.save();
    res.json(topic);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;