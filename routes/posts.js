const express = require('express');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name email role')
      .populate('comments.author', 'name')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new post
router.post('/', auth, async (req, res) => {
  try {
    const { content, mood, anonymous } = req.body;

    const post = new Post({
      content,
      mood,
      anonymous: anonymous || false,
      author: req.user.id
    });

    await post.save();
    await post.populate('author', 'name email role');

    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add reaction to post
router.post('/:id/react', auth, async (req, res) => {
  try {
    const { type } = req.body; // heart, hug, support
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Find existing reaction of this type
    let reaction = post.reactions.find(r => r.type === type);
    
    if (!reaction) {
      // Create new reaction type
      reaction = { type, users: [] };
      post.reactions.push(reaction);
    }

    // Toggle user's reaction
    const userIndex = reaction.users.indexOf(req.user.id);
    if (userIndex > -1) {
      reaction.users.splice(userIndex, 1);
    } else {
      reaction.users.push(req.user.id);
    }

    await post.save();
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to post
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      content,
      author: req.user.id
    });

    await post.save();
    await post.populate('comments.author', 'name');

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;