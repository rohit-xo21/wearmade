# WearMade Backend

A comprehensive Node.js backend for the WearMade custom tailoring platform, built with Express.js, MongoDB, and modern web technologies.

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication
- Google OAuth integration (Passport.js)
- Role-based access control (Customer/Tailor)
- Email verification and password reset
- Secure password hashing with bcrypt

### Order Management
- Customers can create detailed tailoring orders
- Image uploads for design references (Cloudinary)
- Tailor estimate system
- Order status tracking and progress updates
- Real-time notifications via email

### Portfolio System
- Tailors can showcase their work
- Image galleries with descriptions
- Like and comment functionality
- Advanced filtering and search
- Featured items system

### Payment Integration
- Razorpay payment gateway integration
- Secure payment verification
- Refund processing
- Payment history and analytics
- Webhook handling

### User Management
- Comprehensive user profiles
- Location-based tailor search
- Rating and review system
- Dashboard analytics
- Account management

## 🛠 Tech Stack

- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT, Passport.js
- **File Storage:** Cloudinary
- **Payments:** Razorpay
- **Email:** Nodemailer
- **Testing:** Jest, Supertest
- **Security:** Helmet, CORS, Rate Limiting
- **Validation:** Express Validator

## 📦 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd wearmade/server
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/wearmade
NODE_ENV=development
PORT=5000

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_make_it_complex
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# Frontend URL
CLIENT_URL=http://localhost:3000
```

4. **Start the server**
```bash
# Development
pnpm run dev

# Production
pnpm start
```

## 🗂 Project Structure

```
server/
├── config/
│   ├── db.js              # MongoDB connection
│   ├── cloudinary.js      # Cloudinary configuration
│   └── passport.js        # Passport strategies
├── controllers/
│   ├── authController.js  # Authentication logic
│   ├── orderController.js # Order management
│   ├── portfolioController.js # Portfolio operations
│   ├── paymentController.js # Payment processing
│   └── userController.js  # User management
├── middleware/
│   ├── authMiddleware.js  # JWT authentication
│   ├── errorHandler.js    # Global error handling
│   └── upload.js          # File upload configuration
├── models/
│   ├── User.js           # User model
│   ├── Order.js          # Order model
│   ├── Portfolio.js      # Portfolio model
│   └── Payment.js        # Payment model
├── routes/
│   ├── authRoutes.js     # Authentication routes
│   ├── orderRoutes.js    # Order routes
│   ├── portfolioRoutes.js # Portfolio routes
│   ├── paymentRoutes.js  # Payment routes
│   └── userRoutes.js     # User routes
├── utils/
│   ├── generateToken.js  # JWT token generation
│   ├── emailService.js   # Email templates and sending
│   └── validators.js     # Input validation rules
├── tests/
│   ├── auth.test.js      # Authentication tests
│   ├── order.test.js     # Order tests
│   └── payment.test.js   # Payment tests
└── server.js             # Application entry point
```

## 📋 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | User registration | Public |
| POST | `/api/auth/login` | User login | Public |
| GET | `/api/auth/me` | Get current user | Private |
| GET | `/api/auth/verify-email/:token` | Verify email address | Public |
| POST | `/api/auth/forgot-password` | Request password reset | Public |
| PUT | `/api/auth/reset-password/:token` | Reset password | Public |
| GET | `/api/auth/google` | Google OAuth login | Public |

### Order Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/orders` | Create new order | Customer |
| GET | `/api/orders` | Get orders (filtered) | Private |
| GET | `/api/orders/:id` | Get single order | Private |
| PUT | `/api/orders/:id` | Update order | Customer |
| DELETE | `/api/orders/:id` | Delete order | Customer |
| POST | `/api/orders/:id/estimate` | Submit estimate | Tailor |
| POST | `/api/orders/:id/accept-estimate` | Accept estimate | Customer |
| POST | `/api/orders/:id/progress` | Update progress | Tailor |
| POST | `/api/orders/:id/complete` | Complete order | Tailor |
| POST | `/api/orders/:id/cancel` | Cancel order | Both |

### Portfolio Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/portfolio` | Create portfolio item | Tailor |
| GET | `/api/portfolio` | Get portfolio items | Public |
| GET | `/api/portfolio/:id` | Get single item | Public |
| PUT | `/api/portfolio/:id` | Update item | Tailor |
| DELETE | `/api/portfolio/:id` | Delete item | Tailor |
| POST | `/api/portfolio/:id/like` | Like/unlike item | Private |
| POST | `/api/portfolio/:id/comment` | Add comment | Private |

### Payment Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/payments/create-order` | Create payment order | Customer |
| POST | `/api/payments/verify` | Verify payment | Customer |
| GET | `/api/payments` | Get payment history | Private |
| GET | `/api/payments/:id` | Get payment details | Private |
| GET | `/api/payments/stats` | Get payment statistics | Tailor |
| POST | `/api/payments/webhook` | Razorpay webhook | Public |

### User Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/users/profile` | Get user profile | Private |
| PUT | `/api/users/profile` | Update profile | Private |
| GET | `/api/users/tailors` | Get all tailors | Public |
| GET | `/api/users/tailors/:id` | Get tailor profile | Public |
| GET | `/api/users/dashboard-stats` | Get dashboard stats | Private |
| POST | `/api/users/:id/review` | Add user review | Customer |

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

## 🛡 Security Features

- **Helmet.js**: Sets various HTTP headers for security
- **CORS**: Configured for cross-origin requests
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive request validation
- **Password Hashing**: Secure password storage with bcrypt
- **Error Handling**: Prevents information leakage

## 🚀 Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure production database
4. Set up proper CORS origins
5. Configure email service
6. Set up Cloudinary and Razorpay accounts

### Production Considerations

- Use PM2 for process management
- Set up proper logging
- Configure reverse proxy (Nginx)
- Enable HTTPS
- Set up monitoring and alerts
- Regular security updates

## 📈 Performance

- **Database Indexing**: Optimized queries with proper indexes
- **Pagination**: Efficient data loading
- **Image Optimization**: Cloudinary transformations
- **Caching**: Strategic caching implementation
- **Rate Limiting**: Prevents server overload

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

Built with ❤️ for the WearMade custom tailoring platform.