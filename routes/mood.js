const express = require('express');
const MoodEntry = require('../models/MoodEntry');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's mood entries
router.get('/', auth, async (req, res) => {
  try {
    const entries = await MoodEntry.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(30);

    res.json(entries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update mood entry
router.post('/', auth, async (req, res) => {
  try {
    const { mood, notes, activities, date } = req.body;
    
    // Set date to start of day to ensure uniqueness
    const entryDate = new Date(date || new Date());
    entryDate.setHours(0, 0, 0, 0);

    // Try to find existing entry for this date
    let moodEntry = await MoodEntry.findOne({
      user: req.user.id,
      date: entryDate
    });

    if (moodEntry) {
      // Update existing entry
      moodEntry.mood = mood;
      moodEntry.notes = notes;
      moodEntry.activities = activities;
      await moodEntry.save();
    } else {
      // Create new entry
      moodEntry = new MoodEntry({
        user: req.user.id,
        mood,
        notes,
        activities,
        date: entryDate
      });
      await moodEntry.save();
    }

    res.json(moodEntry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get mood analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const entries = await MoodEntry.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(30);

    const totalEntries = entries.length;
    const averageMood = totalEntries > 0 
      ? entries.reduce((sum, entry) => sum + entry.mood, 0) / totalEntries 
      : 0;

    const moodTrend = totalEntries >= 2 
      ? entries[0].mood - entries[1].mood 
      : 0;

    res.json({
      totalEntries,
      averageMood: Math.round(averageMood * 10) / 10,
      moodTrend: Math.round(moodTrend * 10) / 10,
      entries: entries.slice(0, 7) // Last 7 days for chart
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;