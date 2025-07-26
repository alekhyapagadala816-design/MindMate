const express = require('express');
const ChatRoom = require('../models/ChatRoom');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's chat rooms
router.get('/rooms', auth, async (req, res) => {
  try {
    const rooms = await ChatRoom.find({
      participants: req.user.id
    })
    .populate('participants', 'name email role isOnline')
    .populate('messages.sender', 'name')
    .sort({ lastActivity: -1 });

    res.json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new chat room
router.post('/rooms', auth, async (req, res) => {
  try {
    const { participantId, type } = req.body;

    // Check if room already exists
    const existingRoom = await ChatRoom.findOne({
      participants: { $all: [req.user.id, participantId] }
    });

    if (existingRoom) {
      return res.json(existingRoom);
    }

    const room = new ChatRoom({
      participants: [req.user.id, participantId],
      type: type || 'peer',
      messages: []
    });

    await room.save();
    await room.populate('participants', 'name email role isOnline');

    res.status(201).json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message
router.post('/rooms/:roomId/messages', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const room = await ChatRoom.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    // Check if user is participant
    if (!room.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    room.messages.push({
      content,
      sender: req.user.id
    });

    room.lastActivity = new Date();
    await room.save();

    await room.populate('messages.sender', 'name');
    
    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available counsellors
router.get('/counsellors', async (req, res) => {
  try {
    const counsellors = await User.find({ role: 'counsellor' })
      .select('name email isOnline lastSeen')
      .sort({ isOnline: -1, lastSeen: -1 });

    res.json(counsellors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;