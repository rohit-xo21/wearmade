const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const { Server } = require('socket.io');
require('dotenv').config();

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');

// Import config
const connectDB = require('./config/db');
require('./config/passport');

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());


// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173', // for local development
  'http://localhost:3000'  // alternative local dev port
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Passport middleware
app.use(passport.initialize());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'WearMade Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

// Create HTTP server and bind Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.IO auth using Bearer token
const jwt = require('jsonwebtoken');
const Chat = require('./models/Chat');

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) return next(new Error('Unauthorized'));
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = { id: payload.id };
    return next();
  } catch (err) {
    return next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  // Join personal room for notifications
  socket.join(`user:${socket.user.id}`);

  // Join a chat room
  socket.on('chat:join', async ({ chatId }) => {
    if (!chatId) return;
    const chat = await Chat.findById(chatId);
    if (!chat) return;
    const isParticipant = [chat.customer?.toString(), chat.tailor?.toString()].includes(socket.user.id);
    if (!isParticipant) return;
    socket.join(`chat:${chatId}`);
  });

  // Send a message
  socket.on('chat:message', async ({ chatId, message }) => {
    if (!chatId || !message) return;
    const chat = await Chat.findById(chatId);
    if (!chat) return;
    const isParticipant = [chat.customer?.toString(), chat.tailor?.toString()].includes(socket.user.id);
    if (!isParticipant) return;

    // Add message to chat
    chat.messages.push({ sender: socket.user.id, message, timestamp: new Date() });
    await chat.save();
    
    // Populate sender info for the new message
    await chat.populate('messages.sender', 'name avatar');
    const newMsg = chat.messages[chat.messages.length - 1];
    
    // Emit to everyone in the chat room
    io.to(`chat:${chatId}`).emit('chat:message', { 
      chatId, 
      message: newMsg,
      senderId: socket.user.id 
    });
    
    // Notify the other user privately
    const recipientId = chat.customer?.toString() === socket.user.id ? chat.tailor?.toString() : chat.customer?.toString();
    if (recipientId) {
      io.to(`user:${recipientId}`).emit('chat:notify', { 
        chatId, 
        preview: newMsg.message.substring(0, 50),
        senderName: newMsg.sender.name 
      });
    }
  });

  // Handle messages being read
  socket.on('chat:messagesRead', ({ userId }) => {
    if (userId) {
      // Notify the user's other sessions to update badge
      io.to(`user:${userId}`).emit('chat:messagesRead');
    }
  });

  // Handle messages page being visited
  socket.on('chat:messagesPageVisited', ({ userId }) => {
    if (userId) {
      // Notify the user's other sessions to update badge
      io.to(`user:${userId}`).emit('chat:messagesRead');
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server + Socket.IO running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});