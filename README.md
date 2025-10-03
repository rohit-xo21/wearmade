# WearMade - Custom Tailoring Platform

WearMade is a comprehensive digital platform that connects customers with professional tailors for custom clothing orders. The platform streamlines the entire process from initial consultation to final delivery, featuring real-time communication, order management, payment processing, and portfolio showcasing.

## Features

### For Customers
- **Custom Order Placement**: Submit detailed requests with measurements, fabric preferences, and design specifications
- **Tailor Discovery**: Browse and select from verified professional tailors based on portfolios and ratings
- **Real-time Communication**: Chat directly with assigned tailors throughout the order process
- **Order Tracking**: Monitor progress through different stages (cutting, stitching, fitting, finishing)
- **Secure Payments**: Integrated payment processing with Razorpay
- **Review System**: Rate and review completed orders

### For Tailors
- **Professional Dashboard**: Manage incoming requests, active orders, and completed works
- **Portfolio Management**: Showcase previous work with image galleries and descriptions
- **Order Management**: Track multiple orders with progress updates and customer communication
- **Estimate System**: Provide detailed quotes for customer requests
- **Revenue Tracking**: Monitor earnings and payment history

### Technical Features
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Updates**: Socket.IO powered live notifications and messaging
- **Image Upload**: Cloudinary integration for design and reference images
- **Email Notifications**: Automated updates for order status changes
- **Search & Filtering**: Advanced filtering for orders, tailors, and portfolios

## Tech Stack

### Frontend
- **React 19** with modern hooks and context API
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for responsive styling
- **React Router** for client-side routing
- **Socket.IO Client** for real-time communication
- **Axios** for API requests
- **React Hook Form** for form management
- **Framer Motion** for animations

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time features
- **JWT** for authentication
- **Passport.js** for OAuth integration
- **Cloudinary** for image storage
- **Nodemailer** for email services
- **Razorpay** for payment processing

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (version 18.0.0 or higher)
- **npm** (version 8.0.0 or higher) or **pnpm**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git** for version control

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/rohit-xo21/wearmade.git
cd wearmade
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Configure your `.env` file with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/wearmade
NODE_ENV=development
PORT=5000

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Razorpay (for payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Email (for notifications)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
# Navigate to client directory (from project root)
cd client

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Configure your client `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SERVER_URL=http://localhost:5000
```

## Running the Project

### Development Mode

1. **Start the Backend Server**:
```bash
cd server
npm run dev
```
The server will start on `http://localhost:5000`

2. **Start the Frontend Development Server**:
```bash
cd client
npm run dev
```
The client will start on `http://localhost:5173`

### Production Mode

1. **Build the Frontend**:
```bash
cd client
npm run build
```

2. **Start the Backend**:
```bash
cd server
npm start
```

## Usage Guide

### Getting Started

1. **Account Creation**: Register as either a customer or tailor
2. **Profile Setup**: Complete your profile with relevant information
3. **For Customers**: Browse tailors, create orders, and track progress
4. **For Tailors**: Set up portfolio, manage requests, and fulfill orders

### Creating an Order (Customer)

1. Navigate to "Create New Order"
2. Fill in order details (title, category, description)
3. Add measurements and requirements
4. Upload reference images (optional)
5. Set budget range
6. Submit the order

### Managing Orders (Tailor)

1. View incoming requests in the dashboard
2. Review order details and customer requirements
3. Provide detailed estimates with pricing
4. Once accepted, track progress through different stages
5. Communicate with customers via integrated chat
6. Mark orders as completed when finished

### Real-time Communication

- Access the Messages section to chat with tailors/customers
- Receive instant notifications for new messages
- Messages are organized by order for easy reference

## Project Structure

```
wearmade/
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── api/           # API configuration
│   │   ├── components/    # Reusable React components
│   │   │   ├── auth/      # Authentication components
│   │   │   ├── chat/      # Chat-related components
│   │   │   ├── customer/  # Customer-specific components
│   │   │   ├── tailor/    # Tailor-specific components
│   │   │   └── ui/        # UI components
│   │   ├── context/       # React Context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility libraries
│   │   ├── pages/         # Route components
│   │   │   ├── auth/      # Authentication pages
│   │   │   ├── customer/  # Customer dashboard pages
│   │   │   └── tailor/    # Tailor dashboard pages
│   │   ├── styles/        # CSS styles
│   │   └── utils/         # Utility functions
│   ├── .env               # Environment variables
│   ├── package.json       # Dependencies and scripts
│   └── vite.config.js     # Vite configuration
│
├── server/                # Backend Node.js application
│   ├── config/            # Configuration files
│   │   ├── cloudinary.js  # Cloudinary setup
│   │   ├── db.js          # Database connection
│   │   └── passport.js    # Passport authentication
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── tests/             # Test files
│   ├── utils/             # Utility functions
│   ├── .env               # Environment variables
│   ├── package.json       # Dependencies and scripts
│   └── server.js          # Main server file
│
└── README.md              # Project documentation
```

### Key Files and Directories

#### Frontend (`/client`)
- **`src/App.jsx`**: Main application component with routing
- **`src/context/AuthContext.jsx`**: Authentication state management
- **`src/api/axios.js`**: API configuration and interceptors
- **`src/components/`**: Reusable UI components
- **`src/pages/`**: Main route components for different user flows

#### Backend (`/server`)
- **`server.js`**: Express server setup with Socket.IO integration
- **`models/`**: MongoDB schemas for User, Order, Chat, Portfolio, etc.
- **`controllers/`**: Business logic for API endpoints
- **`routes/`**: API route definitions
- **`middleware/`**: Authentication and validation middleware

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/auth/google` - Google OAuth

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/:id/estimate` - Add estimate (tailor)
- `POST /api/orders/:id/accept` - Accept estimate (customer)

### Chat
- `GET /api/chat` - Get user chats
- `POST /api/chat/create` - Create new chat
- `POST /api/chat/:id/message` - Send message

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment

## Contributing

We welcome contributions to improve WearMade! Please follow these guidelines:

### Getting Started

1. **Fork the Repository**
   ```bash
   git fork https://github.com/rohit-xo21/wearmade.git
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Follow existing code style and conventions
   - Add comments for complex logic
   - Update documentation if needed

### Code Standards

- **Frontend**: Follow React best practices and use functional components with hooks
- **Backend**: Use consistent error handling and validation
- **Styling**: Use Tailwind CSS classes and maintain responsive design
- **Database**: Follow MongoDB schema conventions

### Testing

- Write unit tests for new features
- Ensure existing tests pass
- Test across different browsers and devices

### Submitting Changes

1. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

2. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request**
   - Provide a clear description of changes
   - Include screenshots for UI changes
   - Reference any related issues

### Commit Message Format

Use conventional commit messages:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## Contact & Support

### Development Team
- **Lead Developer**: Rohit
- **GitHub**: [@rohit-xo21](https://github.com/rohit-xo21)


**Built with ❤️**