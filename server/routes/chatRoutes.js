const express = require('express');
const {
  createOrGetChat,
  getChatByOrder,
  sendMessage,
  getUserChats,
  markAsRead
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Create or get chat for an order
// @route   POST /api/chat
// @access  Private
router.post('/', protect, createOrGetChat);

// @desc    Get user's chats
// @route   GET /api/chat
// @access  Private
router.get('/', protect, getUserChats);

// @desc    Get chat by order ID
// @route   GET /api/chat/order/:orderId
// @access  Private
router.get('/order/:orderId', protect, getChatByOrder);

// @desc    Send message
// @route   POST /api/chat/:chatId/message
// @access  Private
router.post('/:chatId/message', protect, sendMessage);

// @desc    Mark messages as read
// @route   PUT /api/chat/:chatId/read
// @access  Private
router.put('/:chatId/read', protect, markAsRead);

module.exports = router;
