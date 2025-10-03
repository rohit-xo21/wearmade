const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const chatSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tailor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  participantsLeft: {
    customer: { type: Boolean, default: false },
    tailor: { type: Boolean, default: false }
  },
  closedAt: { type: Date }
}, {
  timestamps: true
});

// Index for efficient queries
chatSchema.index({ order: 1 });
chatSchema.index({ customer: 1, tailor: 1 });
chatSchema.index({ 'messages.timestamp': -1 });

chatSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Chat', chatSchema);
