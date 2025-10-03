const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tailor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Order details
  title: {
    type: String,
    required: [true, 'Please add an order title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    enum: ['suit', 'dress', 'shirt', 'pants', 'skirt', 'jacket', 'blouse', 'other']
  },
  garmentType: {
    type: String,
    enum: ['new', 'alteration', 'repair']
  },
  
  // Requirements
  requirements: {
    fabric: String,
    color: String,
    style: String,
    specialInstructions: String,
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  },
  
  // Images
  designImages: [{
    url: String,
    publicId: String
  }],
  referenceImages: [{
    url: String,
    publicId: String
  }],
  
  // Measurements
  measurements: {
    chest: Number,
    waist: Number,
    shoulders: Number, // Changed from 'shoulder' to 'shoulders'
    armLength: Number, // Added armLength field
    hip: Number,
    sleeve: Number,
    neck: Number,
    inseam: Number,
    length: Number,
    // Custom measurements
    custom: [{
      name: String,
      value: Number,
      unit: String
    }]
  },
  
  // Budget
  budget: {
    min: Number,
    max: Number
  },
  
  // Timeline
  preferredDeliveryDate: Date,
  
  // Status
  status: {
    type: String,
    enum: [
      'pending',        // Order created, waiting for tailor responses
      'quoted',         // Tailors have submitted estimates
      'accepted',       // Customer accepted an estimate
      'in_progress',    // Tailor is working on the order
      'ready',          // Order is ready for pickup/delivery
      'completed',      // Order completed and delivered
      'cancelled'       // Order cancelled
    ],
    default: 'pending'
  },
  
  // Estimates from tailors
  estimates: [{
    tailor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    deliveryTime: {
      type: Number, // in days
      required: true
    },
    message: String,
    materials: [{
      name: String,
      cost: Number
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  }],
  
  // Selected estimate
  selectedEstimate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  finalPrice: Number,
  
  // Progress tracking
  progress: [{
    stage: {
      type: String,
      enum: ['cutting', 'stitching', 'fitting', 'finishing', 'quality_check']
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed']
    },
    completedAt: Date,
    notes: String,
    images: [{
      url: String,
      publicId: String
    }]
  }],
  
  // Reviews and ratings
  review: {
    customer: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      createdAt: Date
    },
    tailor: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      createdAt: Date
    }
  },
  
  // Delivery information
  delivery: {
    method: {
      type: String,
      enum: ['pickup', 'delivery'],
      default: 'pickup'
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    scheduledDate: Date,
    completedDate: Date,
    trackingNumber: String
  }
  
}, {
  timestamps: true
});

// Index for queries
orderSchema.index({ customer: 1, status: 1 });
orderSchema.index({ tailor: 1, status: 1 });
orderSchema.index({ category: 1, status: 1 });
orderSchema.index({ createdAt: -1 });

// Update tailor rating when order is reviewed
orderSchema.post('save', async function() {
  if (this.review && this.review.customer && this.review.customer.rating && this.tailor) {
    const Order = this.constructor;
    const User = require('./User');
    
    const stats = await Order.aggregate([
      {
        $match: { 
          tailor: this.tailor,
          'review.customer.rating': { $exists: true }
        }
      },
      {
        $group: {
          _id: '$tailor',
          averageRating: { $avg: '$review.customer.rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);
    
    if (stats.length > 0) {
      await User.findByIdAndUpdate(this.tailor, {
        'rating.average': Math.round(stats[0].averageRating * 10) / 10,
        'rating.count': stats[0].totalReviews
      });
    }
  }
});

// Add pagination plugin
orderSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Order', orderSchema);