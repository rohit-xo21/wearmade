const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const paymentSchema = new mongoose.Schema({
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
  
  // Payment amount
  amount: {
    type: Number,
    required: [true, 'Payment amount is required']
  },
  
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP']
  },
  
  // Payment breakdown
  breakdown: {
    baseAmount: Number,      // Main service cost
    materialCost: Number,    // Cost of materials
    taxes: Number,           // Tax amount
    discount: Number,        // Discount applied
    convenienceFee: Number   // Platform fee
  },
  
  // Razorpay details
  razorpay: {
    orderId: {
      type: String,
      required: true
    },
    paymentId: String,
    signature: String
  },
  
  // Payment status
  status: {
    type: String,
    enum: [
      'pending',     // Payment initiated but not completed
      'processing',  // Payment in process
      'completed',   // Payment successful
      'failed',      // Payment failed
      'refunded',    // Payment refunded
      'cancelled'    // Payment cancelled
    ],
    default: 'pending'
  },
  
  // Payment method
  method: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet', 'other'],
    default: 'card'
  },
  
  // Payment type
  type: {
    type: String,
    enum: ['full', 'advance', 'final', 'refund'],
    default: 'full'
  },
  
  // Advance payment details (if applicable)
  advancePayment: {
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 50 // 50% advance
    },
    amount: Number,
    paidAt: Date
  },
  
  // Refund details
  refund: {
    amount: Number,
    reason: String,
    processedAt: Date,
    refundId: String
  },
  
  // Transaction timestamps
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  
  completedAt: Date,
  
  failedAt: Date,
  
  // Failure reason
  failureReason: String,
  
  // Notes
  notes: String,
  
  // Receipt details
  receipt: {
    number: String,
    url: String // URL to receipt PDF
  },
  
  // Webhook data from Razorpay
  webhookData: {
    type: mongoose.Schema.Types.Mixed
  }
  
}, {
  timestamps: true
});

// Index for queries
paymentSchema.index({ order: 1 });
paymentSchema.index({ customer: 1, status: 1 });
paymentSchema.index({ tailor: 1, status: 1 });
paymentSchema.index({ 'razorpay.orderId': 1 });
paymentSchema.index({ 'razorpay.paymentId': 1 });
paymentSchema.index({ status: 1, createdAt: -1 });

// Pre-save middleware to generate receipt number
paymentSchema.pre('save', function(next) {
  if (this.isNew && !this.receipt.number) {
    this.receipt.number = `WM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

// Methods
paymentSchema.methods.markAsCompleted = function(paymentId, signature) {
  this.status = 'completed';
  this.razorpay.paymentId = paymentId;
  this.razorpay.signature = signature;
  this.completedAt = new Date();
  return this.save();
};

paymentSchema.methods.markAsFailed = function(reason) {
  this.status = 'failed';
  this.failureReason = reason;
  this.failedAt = new Date();
  return this.save();
};

paymentSchema.methods.processRefund = function(amount, reason) {
  this.status = 'refunded';
  this.refund = {
    amount: amount || this.amount,
    reason: reason,
    processedAt: new Date()
  };
  return this.save();
};

// Statics
paymentSchema.statics.getTotalEarnings = function(tailorId, startDate, endDate) {
  const matchQuery = {
    tailor: tailorId,
    status: 'completed'
  };
  
  if (startDate && endDate) {
    matchQuery.completedAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalTransactions: { $sum: 1 },
        averageAmount: { $avg: '$amount' }
      }
    }
  ]);
};

// Add pagination plugin
paymentSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Payment', paymentSchema);