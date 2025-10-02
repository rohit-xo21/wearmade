const express = require('express');
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
  deleteOrder,
  submitEstimate,
  acceptEstimate,
  updateProgress,
  completeOrder,
  cancelOrder
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadFields, uploadMultiple } = require('../middleware/upload');
const {
  validateOrder,
  validateEstimate,
  handleValidationErrors
} = require('../utils/validators');

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Customer only)
router.post('/', 
  protect, 
  authorize('customer'),
  uploadFields,
  validateOrder, 
  handleValidationErrors, 
  createOrder
);

// @desc    Get all orders (with filters)
// @route   GET /api/orders
// @access  Private
router.get('/', protect, getOrders);

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, getOrder);

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private (Customer only - own orders)
router.put('/:id', 
  protect, 
  authorize('customer'),
  validateOrder, 
  handleValidationErrors, 
  updateOrder
);

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private (Customer only - own orders)
router.delete('/:id', protect, authorize('customer'), deleteOrder);

// @desc    Submit estimate
// @route   POST /api/orders/:id/estimate
// @access  Private (Tailor only)
router.post('/:id/estimate', 
  protect, 
  authorize('tailor'),
  validateEstimate, 
  handleValidationErrors, 
  submitEstimate
);

// @desc    Accept estimate
// @route   POST /api/orders/:id/accept-estimate
// @access  Private (Customer only)
router.post('/:id/accept-estimate', 
  protect, 
  authorize('customer'), 
  acceptEstimate
);

// @desc    Update order progress
// @route   POST /api/orders/:id/progress
// @access  Private (Tailor only - assigned tailor)
router.post('/:id/progress', 
  protect, 
  authorize('tailor'),
  uploadMultiple,
  updateProgress
);

// @desc    Complete order
// @route   POST /api/orders/:id/complete
// @access  Private (Tailor only - assigned tailor)
router.post('/:id/complete', 
  protect, 
  authorize('tailor'), 
  completeOrder
);

// @desc    Cancel order
// @route   POST /api/orders/:id/cancel
// @access  Private (Customer or assigned Tailor)
router.post('/:id/cancel', protect, cancelOrder);

module.exports = router;