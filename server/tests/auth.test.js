const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/User');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/wearmade_test';

const createApp = require('../app');
const app = createApp();

describe('Authentication', () => {
  beforeAll(async () => {
    // Connection is handled by the app
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for connection
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    test('Should register a new customer', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        role: 'customer',
        phone: '+1234567890'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.role).toBe(userData.role);
      expect(response.body.data.token).toBeDefined();

      // Check if user is saved in database
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.name).toBe(userData.name);
    });

    test('Should register a new tailor', async () => {
      const userData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'Password123',
        role: 'tailor',
        phone: '+1234567891'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('tailor');
    });

    test('Should not register user with invalid email', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'Password123',
        role: 'customer'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
    });

    test('Should not register user with weak password', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123', // Too short
        role: 'customer'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
    });

    test('Should not register user with duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        role: 'customer'
      };

      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to register with same email
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        role: 'customer',
        isVerified: true
      });
      await user.save();
    });

    test('Should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(loginData.email);
    });

    test('Should not login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123'
      };

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);
    });

    test('Should not login with invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword'
      };

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);
    });
  });

  describe('GET /api/auth/me', () => {
    let token;
    let userId;

    beforeEach(async () => {
      // Create and login a test user
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        role: 'customer',
        isVerified: true
      });
      await user.save();
      userId = user._id;

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123'
        });

      token = loginResponse.body.data.token;
    });

    test('Should get current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBeDefined();
      expect(response.body.data.email).toBe('test@example.com');
    });

    test('Should not get current user without token', async () => {
      await request(app)
        .get('/api/auth/me')
        .expect(401);
    });

    test('Should not get current user with invalid token', async () => {
      await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);
    });
  });
});