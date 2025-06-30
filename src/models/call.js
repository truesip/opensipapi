const mongoose = require('mongoose');

const callSchema = new mongoose.Schema({
  fromNumber: {
    type: String,
    required: true,
    trim: true
  },
  toNumber: {
    type: String,
    required: true,
    trim: true
  },
  audioFile: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['initiated', 'ringing', 'in-progress', 'completed', 'failed'],
    default: 'initiated'
  },
  duration: {
    type: Number,
    default: 0
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Call', callSchema);
