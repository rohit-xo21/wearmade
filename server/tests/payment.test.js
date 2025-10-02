const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/wearmade_test';

// Mock Razorpay
jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: {
      create: jest.fn().mockResolvedValue({
        id: 'order_test123',
        amount: 75000,
        currency: 'INR',
        status: 'created'
      })
    },
    payments: {
      refund: jest.fn().mockResolvedValue({
        id: 'rfnd_test123',
        amount: 75000,
        status: 'processed'
      })
    }
  }));
});

const createApp = require('../app');
const app = createApp();

describe('Payments', () => {
  let customerToken, tailorToken;
  let customerId, tailorId, orderId;

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
    await Payment.deleteMany({});

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

    // Create test order
    const order = new Order({
      customer: customerId,
      tailor: tailorId,
      title: 'Test Order',
      description: 'Test description for the order',
      category: 'suit',
      status: 'accepted',
      finalPrice: 750
    });
    await order.save();
    orderId = order._id;

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

  describe('POST /api/payments/create-order', () => {
    test('Should create payment order as customer', async () => {
      const response = await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ orderId: orderId.toString() })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.razorpayOrderId).toBe('order_test123');
      expect(response.body.data.amount).toBe(75000); // 750 * 100
      expect(response.body.data.currency).toBe('INR');
      expect(response.body.data.key).toBeDefined();
    });

    test('Should not create payment order as tailor', async () => {
      await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${tailorToken}`)
        .send({ orderId: orderId.toString() })
        .expect(403);
    });

    test('Should not create payment order for non-existent order', async () => {
      const fakeOrderId = new mongoose.Types.ObjectId();
      
      await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ orderId: fakeOrderId.toString() })
        .expect(404);
    });

    test('Should not create payment order for pending order', async () => {
      // Update order status to pending
      await Order.findByIdAndUpdate(orderId, { status: 'pending' });

      await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ orderId: orderId.toString() })
        .expect(400);
    });

    test('Should not create duplicate payment order', async () => {
      // Create first payment order
      await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ orderId: orderId.toString() })
        .expect(200);

      // Try to create another
      await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ orderId: orderId.toString() })
        .expect(400);
    });
  });

  describe('POST /api/payments/verify', () => {
    let paymentId;

    beforeEach(async () => {
      // Create a payment record
      const payment = new Payment({
        order: orderId,
        customer: customerId,
        tailor: tailorId,
        amount: 750,
        currency: 'INR',
        razorpay: {
          orderId: 'order_test123'
        },
        status: 'pending'
      });
      await payment.save();
      paymentId = payment._id;
    });

    test('Should verify payment with valid signature', async () => {
      const crypto = require('crypto');
      const body = 'order_test123|pay_test123';
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'test_secret')
        .update(body)
        .digest('hex');

      const response = await request(app)
        .post('/api/payments/verify')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          paymentId: paymentId.toString(),
          razorpay_order_id: 'order_test123',
          razorpay_payment_id: 'pay_test123',
          razorpay_signature: expectedSignature
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');

      // Check if payment is updated in database
      const updatedPayment = await Payment.findById(paymentId);
      expect(updatedPayment.status).toBe('completed');
      expect(updatedPayment.razorpay.paymentId).toBe('pay_test123');
    });

    test('Should not verify payment with invalid signature', async () => {
      const response = await request(app)
        .post('/api/payments/verify')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          paymentId: paymentId.toString(),
          razorpay_order_id: 'order_test123',
          razorpay_payment_id: 'pay_test123',
          razorpay_signature: 'invalid_signature'
        })
        .expect(400);

      expect(response.body.success).toBe(false);

      // Check if payment is marked as failed
      const updatedPayment = await Payment.findById(paymentId);
      expect(updatedPayment.status).toBe('failed');
    });

    test('Should not verify payment as tailor', async () => {
      await request(app)
        .post('/api/payments/verify')
        .set('Authorization', `Bearer ${tailorToken}`)
        .send({
          paymentId: paymentId.toString(),
          razorpay_order_id: 'order_test123',
          razorpay_payment_id: 'pay_test123',
          razorpay_signature: 'test_signature'
        })
        .expect(403);
    });
  });

  describe('GET /api/payments', () => {
    beforeEach(async () => {
      // Create test payments
      const payment1 = new Payment({
        order: orderId,
        customer: customerId,
        tailor: tailorId,
        amount: 750,
        status: 'completed',
        razorpay: { orderId: 'order_1' }
      });

      const payment2 = new Payment({
        order: orderId,
        customer: customerId,
        tailor: tailorId,
        amount: 500,
        status: 'pending',
        razorpay: { orderId: 'order_2' }
      });

      await payment1.save();
      await payment2.save();
    });

    test('Should get customer payments', async () => {
      const response = await request(app)
        .get('/api/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.docs).toHaveLength(2);
      expect(response.body.data.docs[0].customer._id).toBe(customerId.toString());
    });

    test('Should get tailor payments', async () => {
      const response = await request(app)
        .get('/api/payments')
        .set('Authorization', `Bearer ${tailorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.docs).toHaveLength(2);
      expect(response.body.data.docs[0].tailor._id).toBe(tailorId.toString());
    });

    test('Should filter payments by status', async () => {
      const response = await request(app)
        .get('/api/payments?status=completed')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.docs).toHaveLength(1);
      expect(response.body.data.docs[0].status).toBe('completed');
    });
  });

  describe('GET /api/payments/stats', () => {
    beforeEach(async () => {
      // Create completed payments for tailor
      const payment1 = new Payment({
        order: orderId,
        customer: customerId,
        tailor: tailorId,
        amount: 750,
        status: 'completed',
        completedAt: new Date(),
        razorpay: { orderId: 'order_1' }
      });

      const payment2 = new Payment({
        order: orderId,
        customer: customerId,
        tailor: tailorId,
        amount: 500,
        status: 'completed',
        completedAt: new Date(),
        razorpay: { orderId: 'order_2' }
      });

      await payment1.save();
      await payment2.save();
    });

    test('Should get payment stats as tailor', async () => {
      const response = await request(app)
        .get('/api/payments/stats')
        .set('Authorization', `Bearer ${tailorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalEarnings).toBeDefined();
      expect(response.body.data.monthlyEarnings).toBeDefined();
      expect(response.body.data.recentPayments).toBeDefined();
    });

    test('Should not get payment stats as customer', async () => {
      await request(app)
        .get('/api/payments/stats')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);
    });
  });

  describe('POST /api/payments/:id/refund', () => {
    let paymentId;

    beforeEach(async () => {
      const payment = new Payment({
        order: orderId,
        customer: customerId,
        tailor: tailorId,
        amount: 750,
        status: 'completed',
        razorpay: { 
          orderId: 'order_test123',
          paymentId: 'pay_test123'
        }
      });
      await payment.save();
      paymentId = payment._id;
    });

    test('Should process refund for completed payment', async () => {
      const response = await request(app)
        .post(`/api/payments/${paymentId}/refund`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          amount: 750,
          reason: 'Customer requested refund'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('refunded');

      // Check if payment is updated
      const updatedPayment = await Payment.findById(paymentId);
      expect(updatedPayment.status).toBe('refunded');
      expect(updatedPayment.refund.amount).toBe(750);
    });

    test('Should not process refund for pending payment', async () => {
      // Update payment status to pending
      await Payment.findByIdAndUpdate(paymentId, { status: 'pending' });

      await request(app)
        .post(`/api/payments/${paymentId}/refund`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          amount: 750,
          reason: 'Test refund'
        })
        .expect(400);
    });
  });
});