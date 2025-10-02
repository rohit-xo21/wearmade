const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const portfolioSchema = new mongoose.Schema({
  tailor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    enum: ['suit', 'dress', 'shirt', 'pants', 'skirt', 'jacket', 'blouse', 'traditional', 'formal', 'casual', 'other']
  },
  
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    caption: String
  }],
  
  tags: [String], // e.g., ['wedding', 'formal', 'silk', 'custom-fit']
  
  // Pricing information
  priceRange: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    }
  },
  
  // Time taken for this project
  timeToComplete: {
    type: Number, // in days
    required: true
  },
  
  // Materials used
  materials: [{
    name: String,
    type: String // fabric, thread, buttons, etc.
  }],
  
  // Client information (anonymous)
  clientType: {
    type: String,
    enum: ['male', 'female', 'unisex'],
    required: true
  },
  
  // Difficulty level
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate'
  },
  
  // Featured item
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Visibility
  isVisible: {
    type: Boolean,
    default: true
  },
  
  // Likes and views
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  views: {
    type: Number,
    default: 0
  },
  
  // Comments from users
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comment: {
      type: String,
      required: true,
      maxlength: [300, 'Comment cannot be more than 300 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
  
}, {
  timestamps: true
});

// Index for queries
portfolioSchema.index({ tailor: 1, isVisible: 1 });
portfolioSchema.index({ category: 1, isVisible: 1 });
portfolioSchema.index({ tags: 1, isVisible: 1 });
portfolioSchema.index({ isFeatured: 1, isVisible: 1 });
portfolioSchema.index({ createdAt: -1 });

// Virtual for like count
portfolioSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Methods
portfolioSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

portfolioSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

// Add pagination plugin
portfolioSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Portfolio', portfolioSchema);