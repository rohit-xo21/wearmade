const express = require('express');
const {
  createPaymentOrder,
  verifyPayment,
  getPayment,
  getPayments,
  processRefund,
  getPaymentStats,
  handleWebhook
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Create payment order
// @route   POST /api/payments/create-order
// @access  Private (Customer only)
router.post('/create-order', protect, authorize('customer'), createPaymentOrder);

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private (Customer only)
router.post('/verify', protect, authorize('customer'), verifyPayment);

// @desc    Get payment details
// @route   GET /api/payments/:id
// @access  Private
router.get('/:id', protect, getPayment);

// @desc    Get all payments for user
// @route   GET /api/payments
// @access  Private
router.get('/', protect, getPayments);

// @desc    Process refund
// @route   POST /api/payments/:id/refund
// @access  Private (Admin only - future enhancement)
router.post('/:id/refund', protect, processRefund);

// @desc    Get payment statistics (for tailor dashboard)
// @route   GET /api/payments/stats
// @access  Private (Tailor only)
router.get('/stats', protect, authorize('tailor'), getPaymentStats);

// @desc    Razorpay webhook
// @route   POST /api/payments/webhook
// @access  Public (Razorpay webhook)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;