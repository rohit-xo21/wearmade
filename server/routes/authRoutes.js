const express = require('express');
const passport = require('passport');
const {
  register,
  login,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
  googleAuth,
  googleCallback,
  updatePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
  validateRegister,
  validateLogin,
  validatePasswordReset,
  handleValidationErrors
} = require('../utils/validators');

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', validateRegister, handleValidationErrors, register);

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', validateLogin, handleValidationErrors, login);

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, getMe);

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
router.get('/verify-email/:token', verifyEmail);

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', forgotPassword);

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
router.put('/reset-password/:token', validatePasswordReset, handleValidationErrors, resetPassword);

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
router.put('/update-password', protect, updatePassword);

// @desc    Google OAuth
// @route   GET /api/auth/google
// @access  Public
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  googleCallback
);

module.exports = router;