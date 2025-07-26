const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mood: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  notes: {
    type: String,
    maxlength: 500
  },
  activities: [{
    type: String
  }],
  date: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Ensure one mood entry per user per day
moodEntrySchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('MoodEntry', moodEntrySchema);