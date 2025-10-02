const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { sendEmail, emailTemplates } = require('../utils/emailService');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create payment order
// @route   POST /api/payments/create-order
// @access  Private (Customer only)
const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    // Get order details
    const order = await Order.findById(orderId)
      .populate('customer', 'name email')
      .populate('tailor', 'name shopName');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if order can be paid
    if (order.status !== 'accepted') {
      return res.status(400).json({ 
        message: 'Order must be accepted before payment' 
      });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ 
      order: orderId, 
      status: { $in: ['pending', 'completed'] } 
    });

    if (existingPayment) {
      return res.status(400).json({ 
        message: 'Payment already exists for this order' 
      });
    }

    // Calculate amount (in paise for Razorpay)
    const amount = Math.round(order.finalPrice * 100);

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `order_${orderId}_${Date.now()}`,
      payment_capture: 1
    });

    // Create payment record
    const payment = new Payment({
      order: orderId,
      customer: order.customer._id,
      tailor: order.tailor,
      amount: order.finalPrice,
      currency: 'INR',
      razorpay: {
        orderId: razorpayOrder.id
      },
      status: 'pending'
    });

    await payment.save();

    res.json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        paymentId: payment._id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private (Customer only)
const verifyPayment = async (req, res) => {
  try {
    const {
      paymentId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // Find payment record
    const payment = await Payment.findById(paymentId)
      .populate('order')
      .populate('customer', 'name email');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if user owns this payment
    if (payment.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment successful
      await payment.markAsCompleted(razorpay_payment_id, razorpay_signature);

      // Update order status
      const order = await Order.findById(payment.order._id);
      if (order.status === 'accepted') {
        order.status = 'in_progress';
        await order.save();
      }

      // Send confirmation email
      try {
        await sendEmail({
          email: payment.customer.email,
          subject: 'Payment Confirmation - WearMade',
          html: emailTemplates.paymentConfirmation(
            payment.customer.name,
            payment.amount,
            order.title,
            payment.receipt.number
          )
        });
      } catch (error) {
        console.error('Payment confirmation email error:', error);
      }

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          paymentId: payment._id,
          status: 'completed',
          receiptNumber: payment.receipt.number
        }
      });
    } else {
      // Payment verification failed
      await payment.markAsFailed('Signature verification failed');

      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get payment details
// @route   GET /api/payments/:id
// @access  Private
const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('order', 'title status finalPrice')
      .populate('customer', 'name email')
      .populate('tailor', 'name shopName');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if user has access to this payment
    const hasAccess = 
      payment.customer._id.toString() === req.user.id ||
      payment.tailor._id.toString() === req.user.id;

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all payments for user
// @route   GET /api/payments
// @access  Private
const getPayments = async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = {};

    // Role-based filtering
    if (req.user.role === 'customer') {
      query.customer = req.user.id;
    } else if (req.user.role === 'tailor') {
      query.tailor = req.user.id;
    }

    // Status filter
    if (status) query.status = status;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      populate: [
        { path: 'order', select: 'title status' },
        { path: 'customer', select: 'name email' },
        { path: 'tailor', select: 'name shopName' }
      ]
    };

    const payments = await Payment.paginate(query, options);

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Process refund
// @route   POST /api/payments/:id/refund
// @access  Private (Admin only - future enhancement)
const processRefund = async (req, res) => {
  try {
    const { amount, reason } = req.body;

    const payment = await Payment.findById(req.params.id)
      .populate('order')
      .populate('customer', 'name email');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({ 
        message: 'Can only refund completed payments' 
      });
    }

    const refundAmount = amount || payment.amount;

    // Process refund with Razorpay
    const refund = await razorpay.payments.refund(payment.razorpay.paymentId, {
      amount: Math.round(refundAmount * 100), // Convert to paise
      notes: {
        reason: reason,
        order_id: payment.order._id.toString()
      }
    });

    // Update payment record
    await payment.processRefund(refundAmount, reason);
    payment.refund.refundId = refund.id;
    await payment.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundId: refund.id,
        amount: refundAmount,
        status: 'refunded'
      }
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get payment statistics (for tailor dashboard)
// @route   GET /api/payments/stats
// @access  Private (Tailor only)
const getPaymentStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (req.user.role !== 'tailor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get total earnings
    const earnings = await Payment.getTotalEarnings(req.user.id, startDate, endDate);

    // Get monthly earnings
    const monthlyEarnings = await Payment.aggregate([
      {
        $match: {
          tailor: req.user._id,
          status: 'completed',
          completedAt: {
            $gte: new Date(new Date().getFullYear(), 0, 1), // Start of current year
            $lte: new Date()
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$completedAt' },
            month: { $month: '$completedAt' }
          },
          totalAmount: { $sum: '$amount' },
          totalTransactions: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get recent payments
    const recentPayments = await Payment.find({
      tailor: req.user.id,
      status: 'completed'
    })
    .populate('order', 'title')
    .populate('customer', 'name')
    .sort({ completedAt: -1 })
    .limit(10);

    res.json({
      success: true,
      data: {
        totalEarnings: earnings[0] || { totalAmount: 0, totalTransactions: 0, averageAmount: 0 },
        monthlyEarnings,
        recentPayments
      }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Razorpay webhook
// @route   POST /api/payments/webhook
// @access  Public (Razorpay webhook)
const handleWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (secret) {
      // Verify webhook signature
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (signature !== expectedSignature) {
        return res.status(400).json({ message: 'Webhook signature verification failed' });
      }
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload.payment.entity;

    // Find payment by Razorpay payment ID
    const payment = await Payment.findOne({ 
      'razorpay.paymentId': paymentEntity.id 
    });

    if (payment) {
      payment.webhookData = req.body;
      
      switch (event) {
        case 'payment.captured':
          if (payment.status === 'pending') {
            await payment.markAsCompleted(
              paymentEntity.id, 
              paymentEntity.notes ? paymentEntity.notes.signature : null
            );
          }
          break;
          
        case 'payment.failed':
          if (payment.status === 'pending') {
            await payment.markAsFailed(paymentEntity.error_description);
          }
          break;
      }
      
      await payment.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getPayment,
  getPayments,
  processRefund,
  getPaymentStats,
  handleWebhook
};