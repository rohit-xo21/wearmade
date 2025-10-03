const Chat = require('../models/Chat');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Create or get chat for an order
// @route   POST /api/chat
// @access  Private
const createOrGetChat = async (req, res) => {
  try {
    const { orderId } = req.body;

    // Verify the order exists and user has access
    const order = await Order.findById(orderId)
      .populate('customer', 'name email')
      .populate('tailor', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user has access to this order
    const hasAccess = 
      order.customer._id.toString() === req.user.id ||
      (order.tailor && order.tailor._id.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({ order: orderId });

    if (!chat) {
      // Create new chat
      chat = new Chat({
        order: orderId,
        customer: order.customer._id,
        tailor: order.tailor._id
      });
      await chat.save();
    }

    // Populate the chat with user details
    await chat.populate([
      { path: 'customer', select: 'name email avatar' },
      { path: 'tailor', select: 'name email avatar' },
      { path: 'messages.sender', select: 'name avatar' }
    ]);

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Create or get chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get chat by order ID
// @route   GET /api/chat/order/:orderId
// @access  Private
const getChatByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const chat = await Chat.findOne({ order: orderId })
      .populate('customer', 'name email avatar')
      .populate('tailor', 'name email avatar')
      .populate('messages.sender', 'name avatar');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user has access to this chat
    const hasAccess = 
      chat.customer._id.toString() === req.user.id ||
      chat.tailor._id.toString() === req.user.id;

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send message
// @route   POST /api/chat/:chatId/message
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user has access to this chat
    const hasAccess = 
      chat.customer.toString() === req.user.id ||
      chat.tailor.toString() === req.user.id;

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Add message to chat
    chat.messages.push({
      sender: req.user.id,
      message,
      timestamp: new Date()
    });

    await chat.save();

    // Populate the new message with sender details
    await chat.populate('messages.sender', 'name avatar');

    res.json({
      success: true,
      data: chat.messages[chat.messages.length - 1]
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's chats
// @route   GET /api/chat
// @access  Private
const getUserChats = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    let query = {};
    if (req.user.role === 'customer') {
      query.customer = req.user.id;
    } else if (req.user.role === 'tailor') {
      query.tailor = req.user.id;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { updatedAt: -1 },
      populate: [
        { path: 'customer', select: 'name email avatar' },
        { path: 'tailor', select: 'name email avatar' },
        { path: 'order', select: 'title status' }
      ]
    };

    const chats = await Chat.paginate(query, options);

    res.json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error('Get user chats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/:chatId/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user has access to this chat
    const hasAccess = 
      chat.customer.toString() === req.user.id ||
      chat.tailor.toString() === req.user.id;

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark all messages as read for the current user
    chat.messages.forEach(msg => {
      if (msg.sender.toString() !== req.user.id) {
        msg.isRead = true;
      }
    });

    await chat.save();

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createOrGetChat,
  getChatByOrder,
  sendMessage,
  getUserChats,
  markAsRead
};
