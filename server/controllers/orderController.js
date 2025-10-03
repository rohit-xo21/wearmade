const Order = require('../models/Order');
const User = require('../models/User');
const { sendEmail, emailTemplates } = require('../utils/emailService');
const { cloudinary } = require('../middleware/upload');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Customer only)
const createOrder = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      garmentType,
      requirements,
      measurements,
      budget,
      preferredDeliveryDate
    } = req.body;

    // Process uploaded images
    let designImages = [];
    let referenceImages = [];

    if (req.files) {
      if (req.files.designImages) {
        designImages = req.files.designImages.map(file => ({
          url: file.path,
          publicId: file.filename
        }));
      }
      if (req.files.referenceImages) {
        referenceImages = req.files.referenceImages.map(file => ({
          url: file.path,
          publicId: file.filename
        }));
      }
    }

    const order = new Order({
      customer: req.user.id,
      title,
      description,
      category,
      garmentType,
      requirements,
      measurements,
      budget,
      preferredDeliveryDate,
      designImages,
      referenceImages
    });

    await order.save();

    // Populate customer info for response
    await order.populate('customer', 'name email');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all orders (with filters)
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const {
      status,
      category,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = {};

    // Role-based filtering
    if (req.user.role === 'customer') {
      query.customer = req.user.id;
    } else if (req.user.role === 'tailor') {
      // For tailors, show orders they can bid on or are assigned to
      query.$or = [
        { tailor: req.user.id },
        { status: 'pending' },
        { 'estimates.tailor': req.user.id }
      ];
    }

    // Additional filters
    if (status) {
      // Handle multiple status values (comma-separated)
      if (status.includes(',')) {
        const statusArray = status.split(',').map(s => s.trim());
        query.status = { $in: statusArray };
      } else {
        query.status = status;
      }
    }
    if (category) query.category = category;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      populate: [
        { path: 'customer', select: 'name email avatar' },
        { path: 'tailor', select: 'name email avatar shopName' },
        { path: 'estimates.tailor', select: 'name shopName avatar rating' }
      ]
    };

    const orders = await Order.paginate(query, options);

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone avatar address')
      .populate('tailor', 'name email phone avatar shopName shopAddress')
      .populate('estimates.tailor', 'name shopName avatar rating experience');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user has access to this order
    const hasAccess = 
      order.customer._id.toString() === req.user.id ||
      (order.tailor && order.tailor._id.toString() === req.user.id) ||
      order.estimates.some(est => est.tailor._id.toString() === req.user.id) ||
      (req.user.role === 'tailor' && order.status === 'pending');

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private (Customer only - own orders)
const updateOrder = async (req, res) => {
  try {
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow updates if order is still pending
    if (order.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Cannot update order after estimates have been received' 
      });
    }

    order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('customer', 'name email');

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private (Customer only - own orders)
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow deletion if order is pending
    if (order.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Cannot delete order after estimates have been received' 
      });
    }

    // Delete images from cloudinary
    const allImages = [...order.designImages, ...order.referenceImages];
    for (let image of allImages) {
      if (image.publicId) {
        await cloudinary.uploader.destroy(image.publicId);
      }
    }

    await order.remove();

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Submit estimate
// @route   POST /api/orders/:id/estimate
// @access  Private (Tailor only)
const submitEstimate = async (req, res) => {
  try {
    const { price, deliveryTime, message, materials } = req.body;

    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order is still accepting estimates
    if (order.status !== 'pending') {
      return res.status(400).json({ 
        message: 'This order is no longer accepting estimates' 
      });
    }

    // Check if tailor already submitted estimate
    const existingEstimate = order.estimates.find(
      est => est.tailor.toString() === req.user.id
    );

    if (existingEstimate) {
      return res.status(400).json({ 
        message: 'You have already submitted an estimate for this order' 
      });
    }

    // Add estimate
    order.estimates.push({
      tailor: req.user.id,
      price,
      deliveryTime,
      message,
      materials
    });

    // Update order status
    order.status = 'quoted';

    await order.save();
    await order.populate('estimates.tailor', 'name shopName avatar rating');

    // Send notification email to customer
    try {
      await sendEmail({
        email: order.customer.email,
        subject: 'New Estimate Received - WearMade',
        html: emailTemplates.estimateReceived(
          order.customer.name,
          req.user.name,
          order.title,
          price
        )
      });
    } catch (error) {
      console.error('Estimate notification email error:', error);
    }

    res.json({
      success: true,
      message: 'Estimate submitted successfully',
      data: order
    });
  } catch (error) {
    console.error('Submit estimate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Accept estimate
// @route   POST /api/orders/:id/accept-estimate
// @access  Private (Customer only)
const acceptEstimate = async (req, res) => {
  try {
    const { tailorId } = req.body;

    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('estimates.tailor', 'name email shopName');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find the estimate
    const estimate = order.estimates.find(
      est => est.tailor._id.toString() === tailorId
    );

    if (!estimate) {
      return res.status(404).json({ message: 'Estimate not found' });
    }

    // Update order
    order.tailor = tailorId;
    order.selectedEstimate = tailorId;
    order.finalPrice = estimate.price;
    order.status = 'accepted';

    // Update estimate status
    estimate.status = 'accepted';

    await order.save();

    // Send notification email to tailor
    try {
      await sendEmail({
        email: estimate.tailor.email,
        subject: 'Order Accepted - WearMade',
        html: emailTemplates.orderAccepted(
          estimate.tailor.name,
          order.customer.name,
          order.title
        )
      });
    } catch (error) {
      console.error('Order acceptance notification email error:', error);
    }

    res.json({
      success: true,
      message: 'Estimate accepted successfully',
      data: order
    });
  } catch (error) {
    console.error('Accept estimate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order progress
// @route   POST /api/orders/:id/progress
// @access  Private (Tailor only - assigned tailor)
const updateProgress = async (req, res) => {
  try {
    const { stage, status, notes } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is the assigned tailor
    if (!order.tailor || order.tailor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Process uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => ({
        url: file.path,
        publicId: file.filename
      }));
    }

    // Find existing progress stage or create new one
    let progressStage = order.progress.find(p => p.stage === stage);
    
    if (progressStage) {
      progressStage.status = status;
      progressStage.notes = notes;
      progressStage.images = [...progressStage.images, ...images];
      if (status === 'completed') {
        progressStage.completedAt = new Date();
      }
    } else {
      order.progress.push({
        stage,
        status,
        notes,
        images,
        completedAt: status === 'completed' ? new Date() : undefined
      });
    }

    // Update overall order status if all stages are completed
    const allStagesCompleted = order.progress.every(p => p.status === 'completed');
    if (allStagesCompleted && order.status === 'in_progress') {
      order.status = 'ready';
    } else if (order.status === 'accepted') {
      order.status = 'in_progress';
    }

    await order.save();
    await order.populate([
      { path: 'customer', select: 'name email' },
      { path: 'tailor', select: 'name shopName' }
    ]);

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Complete order
// @route   POST /api/orders/:id/complete
// @access  Private (Tailor only - assigned tailor)
const completeOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('tailor', 'name shopName');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is the assigned tailor
    if (!order.tailor || order.tailor._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    order.status = 'completed';
    order.delivery.completedDate = new Date();

    await order.save();

    res.json({
      success: true,
      message: 'Order completed successfully',
      data: order
    });
  } catch (error) {
    console.error('Complete order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Cancel order
// @route   POST /api/orders/:id/cancel
// @access  Private (Customer or assigned Tailor)
const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user has permission to cancel
    const canCancel = 
      order.customer.toString() === req.user.id ||
      (order.tailor && order.tailor.toString() === req.user.id);

    if (!canCancel) {
      return res.status(403).json({ message: 'Access denied' });
    }

    order.status = 'cancelled';
    order.cancellation = {
      reason,
      cancelledBy: req.user.id,
      cancelledAt: new Date()
    };

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add review to completed order
// @route   POST /api/orders/:id/review
// @access  Private (Customer only)
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const order = await Order.findById(req.params.id)
      .populate('tailor', 'name shopName');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if order is completed
    if (order.status !== 'completed') {
      return res.status(400).json({ 
        message: 'Can only review completed orders' 
      });
    }

    // Check if review already exists
    if (order.review && order.review.customer) {
      return res.status(400).json({ 
        message: 'Review already submitted for this order' 
      });
    }

    // Add customer review
    order.review = {
      customer: {
        rating,
        comment,
        createdAt: new Date()
      }
    };

    await order.save();

    res.json({
      success: true,
      message: 'Review submitted successfully',
      data: order
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
  deleteOrder,
  submitEstimate,
  acceptEstimate,
  updateProgress,
  completeOrder,
  cancelOrder,
  addReview
};