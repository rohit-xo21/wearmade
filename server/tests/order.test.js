const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/wearmade_test';

const createApp = require('../app');
const app = createApp();

describe('Orders', () => {
  let customerToken, tailorToken;
  let customerId, tailorId;

  beforeAll(async () => {
    // Connection is handled by the app
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for connection
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up database
    await User.deleteMany({});
    await Order.deleteMany({});

    // Create test customer
    const customer = new User({
      name: 'Customer User',
      email: 'customer@example.com',
      password: 'Password123',
      role: 'customer',
      isVerified: true
    });
    await customer.save();
    customerId = customer._id;

    // Create test tailor
    const tailor = new User({
      name: 'Tailor User',
      email: 'tailor@example.com',
      password: 'Password123',
      role: 'tailor',
      isVerified: true,
      shopName: 'Test Tailor Shop'
    });
    await tailor.save();
    tailorId = tailor._id;

    // Get tokens
    const customerLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'customer@example.com',
        password: 'Password123'
      });
    customerToken = customerLogin.body.data.token;

    const tailorLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'tailor@example.com',
        password: 'Password123'
      });
    tailorToken = tailorLogin.body.data.token;
  });

  describe('POST /api/orders', () => {
    test('Should create a new order as customer', async () => {
      const orderData = {
        title: 'Custom Suit Order',
        description: 'I need a custom tailored suit for my wedding',
        category: 'suit',
        garmentType: 'new',
        requirements: {
          fabric: 'Wool',
          color: 'Navy Blue',
          style: 'Slim Fit'
        },
        measurements: {
          chest: 40,
          waist: 34,
          shoulder: 18
        },
        budget: {
          min: 500,
          max: 1000
        }
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(orderData.title);
      expect(response.body.data.customer._id).toBe(customerId.toString());
      expect(response.body.data.status).toBe('pending');
    });

    test('Should not create order as tailor', async () => {
      const orderData = {
        title: 'Test Order',
        description: 'Test description',
        category: 'suit'
      };

      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${tailorToken}`)
        .send(orderData)
        .expect(403);
    });

    test('Should not create order without authentication', async () => {
      const orderData = {
        title: 'Test Order',
        description: 'Test description',
        category: 'suit'
      };

      await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(401);
    });

    test('Should not create order with invalid data', async () => {
      const orderData = {
        title: 'Te', // Too short
        description: 'Test',
        category: 'invalid_category'
      };

      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(orderData)
        .expect(400);
    });
  });

  describe('GET /api/orders', () => {
    let orderId;

    beforeEach(async () => {
      // Create a test order
      const order = new Order({
        customer: customerId,
        title: 'Test Order',
        description: 'Test description for the order',
        category: 'suit',
        status: 'pending'
      });
      await order.save();
      orderId = order._id;
    });

    test('Should get customer orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.docs).toHaveLength(1);
      expect(response.body.data.docs[0].customer._id).toBe(customerId.toString());
    });

    test('Should get tailor accessible orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${tailorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should include pending orders that tailors can bid on
    });

    test('Should filter orders by status', async () => {
      const response = await request(app)
        .get('/api/orders?status=pending')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/orders/:id/estimate', () => {
    let orderId;

    beforeEach(async () => {
      const order = new Order({
        customer: customerId,
        title: 'Test Order',
        description: 'Test description for the order',
        category: 'suit',
        status: 'pending'
      });
      await order.save();
      orderId = order._id;
    });

    test('Should submit estimate as tailor', async () => {
      const estimateData = {
        price: 750,
        deliveryTime: 14,
        message: 'I can deliver a high-quality suit within 2 weeks'
      };

      const response = await request(app)
        .post(`/api/orders/${orderId}/estimate`)
        .set('Authorization', `Bearer ${tailorToken}`)
        .send(estimateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('quoted');
      expect(response.body.data.estimates).toHaveLength(1);
      expect(response.body.data.estimates[0].price).toBe(estimateData.price);
    });

    test('Should not submit estimate as customer', async () => {
      const estimateData = {
        price: 750,
        deliveryTime: 14
      };

      await request(app)
        .post(`/api/orders/${orderId}/estimate`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send(estimateData)
        .expect(403);
    });

    test('Should not submit duplicate estimate', async () => {
      const estimateData = {
        price: 750,
        deliveryTime: 14
      };

      // Submit first estimate
      await request(app)
        .post(`/api/orders/${orderId}/estimate`)
        .set('Authorization', `Bearer ${tailorToken}`)
        .send(estimateData)
        .expect(200);

      // Try to submit again
      await request(app)
        .post(`/api/orders/${orderId}/estimate`)
        .set('Authorization', `Bearer ${tailorToken}`)
        .send(estimateData)
        .expect(400);
    });
  });

  describe('POST /api/orders/:id/accept-estimate', () => {
    let orderId;

    beforeEach(async () => {
      const order = new Order({
        customer: customerId,
        title: 'Test Order',
        description: 'Test description for the order',
        category: 'suit',
        status: 'quoted',
        estimates: [{
          tailor: tailorId,
          price: 750,
          deliveryTime: 14,
          message: 'Test estimate'
        }]
      });
      await order.save();
      orderId = order._id;
    });

    test('Should accept estimate as customer', async () => {
      const response = await request(app)
        .post(`/api/orders/${orderId}/accept-estimate`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ tailorId: tailorId.toString() })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('accepted');
      expect(response.body.data.tailor.toString()).toBe(tailorId.toString());
      expect(response.body.data.finalPrice).toBe(750);
    });

    test('Should not accept estimate as tailor', async () => {
      await request(app)
        .post(`/api/orders/${orderId}/accept-estimate`)
        .set('Authorization', `Bearer ${tailorToken}`)
        .send({ tailorId: tailorId.toString() })
        .expect(403);
    });
  });

  describe('POST /api/orders/:id/cancel', () => {
    let orderId;

    beforeEach(async () => {
      const order = new Order({
        customer: customerId,
        title: 'Test Order',
        description: 'Test description for the order',
        category: 'suit',
        status: 'pending'
      });
      await order.save();
      orderId = order._id;
    });

    test('Should cancel order as customer', async () => {
      const response = await request(app)
        .post(`/api/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ reason: 'Changed mind' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('cancelled');
    });
  });
});