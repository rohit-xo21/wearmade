const express = require('express');
const {
  getProfile,
  updateProfile,
  getTailors,
  getTailorProfile,
  getDashboardStats,
  getNearbyTailors,
  addUserReview,
  deleteAccount
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/upload');
const {
  validateProfileUpdate,
  handleValidationErrors
} = require('../utils/validators');

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, getProfile);

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', 
  protect, 
  uploadSingle,
  validateProfileUpdate, 
  handleValidationErrors, 
  updateProfile
);

// @desc    Get all tailors (with filters)
// @route   GET /api/users/tailors
// @access  Public
router.get('/tailors', getTailors);

// @desc    Search tailors by location
// @route   GET /api/users/tailors/near
// @access  Public
router.get('/tailors/near', getNearbyTailors);

// @desc    Get single tailor profile
// @route   GET /api/users/tailors/:id
// @access  Public
router.get('/tailors/:id', getTailorProfile);

// @desc    Get dashboard stats
// @route   GET /api/users/dashboard-stats
// @access  Private
router.get('/dashboard-stats', protect, getDashboardStats);

// @desc    Add user review
// @route   POST /api/users/:id/review
// @access  Private
router.post('/:id/review', protect, authorize('customer'), addUserReview);

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
router.delete('/account', protect, deleteAccount);

module.exports = router;