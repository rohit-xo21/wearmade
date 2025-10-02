const User = require('../models/User');
const Order = require('../models/Order');
const Portfolio = require('../models/Portfolio');
const { cloudinary } = require('../middleware/upload');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'name', 'phone', 'address', 'measurements', 'shopName', 'shopAddress',
      'specialties', 'experience', 'priceRange', 'workingHours', 'isAvailable'
    ];

    const updateData = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    // Handle avatar upload
    if (req.file) {
      // Delete old avatar if exists
      const user = await User.findById(req.user.id);
      if (user.avatar) {
        const publicId = user.avatar.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }
      
      updateData.avatar = req.file.path;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all tailors (with filters)
// @route   GET /api/users/tailors
// @access  Public
const getTailors = async (req, res) => {
  try {
    const {
      city,
      specialties,
      minRating,
      maxPrice,
      isAvailable,
      page = 1,
      limit = 12,
      sortBy = 'rating.average',
      sortOrder = 'desc',
      lat,
      lng,
      radius = 50 // km
    } = req.query;

    let query = { role: 'tailor' };

    // Filters
    if (city) {
      query['shopAddress.city'] = new RegExp(city, 'i');
    }
    
    if (specialties) {
      const specialtyArray = specialties.split(',').map(s => s.trim());
      query.specialties = { $in: specialtyArray };
    }
    
    if (minRating) {
      query['rating.average'] = { $gte: parseFloat(minRating) };
    }
    
    if (maxPrice) {
      query['priceRange.max'] = { $lte: parseInt(maxPrice) };
    }
    
    if (isAvailable === 'true') {
      query.isAvailable = true;
    }

    // Location-based search
    if (lat && lng) {
      query['shopAddress.coordinates'] = {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], radius / 6378.1]
        }
      };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      select: 'name email shopName shopAddress specialties experience rating priceRange avatar isAvailable'
    };

    const tailors = await User.paginate(query, options);

    res.json({
      success: true,
      data: tailors
    });
  } catch (error) {
    console.error('Get tailors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single tailor profile
// @route   GET /api/users/tailors/:id
// @access  Public
const getTailorProfile = async (req, res) => {
  try {
    const tailor = await User.findOne({ 
      _id: req.params.id, 
      role: 'tailor' 
    }).select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpire');

    if (!tailor) {
      return res.status(404).json({ message: 'Tailor not found' });
    }

    // Get portfolio items count
    const portfolioCount = await Portfolio.countDocuments({
      tailor: tailor._id,
      isVisible: true
    });

    // Get completed orders count
    const completedOrdersCount = await Order.countDocuments({
      tailor: tailor._id,
      status: 'completed'
    });

    // Get recent portfolio items
    const recentPortfolio = await Portfolio.find({
      tailor: tailor._id,
      isVisible: true
    })
    .sort({ createdAt: -1 })
    .limit(6)
    .select('title images category priceRange createdAt likesCount views');

    res.json({
      success: true,
      data: {
        ...tailor.toObject(),
        stats: {
          portfolioCount,
          completedOrdersCount
        },
        recentPortfolio
      }
    });
  } catch (error) {
    console.error('Get tailor profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/users/dashboard-stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    let stats = {};

    if (req.user.role === 'customer') {
      // Customer dashboard stats
      const totalOrders = await Order.countDocuments({ customer: req.user.id });
      const pendingOrders = await Order.countDocuments({ 
        customer: req.user.id, 
        status: 'pending' 
      });
      const inProgressOrders = await Order.countDocuments({ 
        customer: req.user.id, 
        status: { $in: ['accepted', 'in_progress'] }
      });
      const completedOrders = await Order.countDocuments({ 
        customer: req.user.id, 
        status: 'completed' 
      });

      stats = {
        totalOrders,
        pendingOrders,
        inProgressOrders,
        completedOrders
      };
    } else if (req.user.role === 'tailor') {
      // Tailor dashboard stats
      const totalOrders = await Order.countDocuments({ tailor: req.user.id });
      const pendingEstimates = await Order.countDocuments({ 
        'estimates.tailor': req.user.id,
        'estimates.status': 'pending'
      });
      const activeOrders = await Order.countDocuments({ 
        tailor: req.user.id, 
        status: { $in: ['accepted', 'in_progress'] }
      });
      const completedOrders = await Order.countDocuments({ 
        tailor: req.user.id, 
        status: 'completed' 
      });
      const portfolioItems = await Portfolio.countDocuments({ 
        tailor: req.user.id 
      });

      // Calculate total earnings (this month)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const monthlyEarnings = await Order.aggregate([
        {
          $match: {
            tailor: req.user._id,
            status: 'completed',
            updatedAt: { $gte: startOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: '$finalPrice' }
          }
        }
      ]);

      stats = {
        totalOrders,
        pendingEstimates,
        activeOrders,
        completedOrders,
        portfolioItems,
        monthlyEarnings: monthlyEarnings[0]?.totalEarnings || 0
      };
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search tailors by location
// @route   GET /api/users/tailors/near
// @access  Public
const getNearbyTailors = async (req, res) => {
  try {
    const { lat, lng, radius = 50, limit = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ 
        message: 'Latitude and longitude are required' 
      });
    }

    const tailors = await User.find({
      role: 'tailor',
      'shopAddress.coordinates': {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(lng), parseFloat(lat)], 
            radius / 6378.1 // Convert km to radians
          ]
        }
      },
      isAvailable: true
    })
    .select('name shopName shopAddress specialties rating avatar priceRange')
    .limit(parseInt(limit))
    .sort({ 'rating.average': -1 });

    res.json({
      success: true,
      data: tailors
    });
  } catch (error) {
    console.error('Get nearby tailors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add user review
// @route   POST /api/users/:id/review
// @access  Private
const addUserReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.params.id;

    // Check if user exists and is a tailor
    const tailor = await User.findById(userId);
    if (!tailor || tailor.role !== 'tailor') {
      return res.status(404).json({ message: 'Tailor not found' });
    }

    // Check if user has completed order with this tailor
    const completedOrder = await Order.findOne({
      customer: req.user.id,
      tailor: userId,
      status: 'completed'
    });

    if (!completedOrder) {
      return res.status(400).json({ 
        message: 'You can only review tailors you have completed orders with' 
      });
    }

    // Add review to the order (assuming reviews are stored in orders)
    completedOrder.review = {
      customer: {
        rating,
        comment,
        createdAt: new Date()
      }
    };

    await completedOrder.save();

    res.json({
      success: true,
      message: 'Review added successfully'
    });
  } catch (error) {
    console.error('Add user review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    // Verify password
    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Delete user's data
    if (user.role === 'tailor') {
      // Delete portfolio items and their images
      const portfolioItems = await Portfolio.find({ tailor: req.user.id });
      for (let item of portfolioItems) {
        for (let image of item.images) {
          if (image.publicId) {
            await cloudinary.uploader.destroy(image.publicId);
          }
        }
        await item.remove();
      }
    }

    // Update orders to remove user references (don't delete orders for data integrity)
    await Order.updateMany(
      { $or: [{ customer: req.user.id }, { tailor: req.user.id }] },
      { 
        $set: { 
          [`${user.role === 'customer' ? 'customer' : 'tailor'}`]: null 
        } 
      }
    );

    // Delete avatar
    if (user.avatar) {
      const publicId = user.avatar.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    // Delete user account
    await user.remove();

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getTailors,
  getTailorProfile,
  getDashboardStats,
  getNearbyTailors,
  addUserReview,
  deleteAccount
};