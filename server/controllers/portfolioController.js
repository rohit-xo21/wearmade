const Portfolio = require('../models/Portfolio');
const { cloudinary } = require('../middleware/upload');

// @desc    Create portfolio item
// @route   POST /api/portfolio
// @access  Private (Tailor only)
const createPortfolioItem = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      tags,
      priceRange,
      timeToComplete,
      materials,
      clientType,
      difficulty
    } = req.body;

    // Process uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => ({
        url: file.path,
        publicId: file.filename,
        caption: file.originalname
      }));
    }

    if (images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const portfolioItem = new Portfolio({
      tailor: req.user.id,
      title,
      description,
      category,
      images,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      priceRange,
      timeToComplete,
      materials,
      clientType,
      difficulty
    });

    await portfolioItem.save();
    await portfolioItem.populate('tailor', 'name shopName avatar');

    res.status(201).json({
      success: true,
      message: 'Portfolio item created successfully',
      data: portfolioItem
    });
  } catch (error) {
    console.error('Create portfolio item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all portfolio items (with filters)
// @route   GET /api/portfolio
// @access  Public
const getPortfolioItems = async (req, res) => {
  try {
    const {
      category,
      tailorId,
      tags,
      minPrice,
      maxPrice,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      featured = false
    } = req.query;

    let query = { isVisible: true };

    // Filters
    if (category) query.category = category;
    if (tailorId) query.tailor = tailorId;
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }
    if (minPrice || maxPrice) {
      query.$and = [];
      if (minPrice) query.$and.push({ 'priceRange.min': { $gte: parseInt(minPrice) } });
      if (maxPrice) query.$and.push({ 'priceRange.max': { $lte: parseInt(maxPrice) } });
    }
    if (featured === 'true') query.isFeatured = true;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      populate: {
        path: 'tailor',
        select: 'name shopName avatar rating experience specialties'
      }
    };

    const portfolioItems = await Portfolio.paginate(query, options);

    res.json({
      success: true,
      data: portfolioItems
    });
  } catch (error) {
    console.error('Get portfolio items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single portfolio item
// @route   GET /api/portfolio/:id
// @access  Public
const getPortfolioItem = async (req, res) => {
  try {
    const portfolioItem = await Portfolio.findById(req.params.id)
      .populate('tailor', 'name shopName avatar rating experience specialties shopAddress')
      .populate('comments.user', 'name avatar');

    if (!portfolioItem) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

    if (!portfolioItem.isVisible) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

    // Increment views (only if not the tailor viewing their own item)
    if (!req.user || req.user.id !== portfolioItem.tailor._id.toString()) {
      await portfolioItem.incrementViews();
    }

    res.json({
      success: true,
      data: portfolioItem
    });
  } catch (error) {
    console.error('Get portfolio item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update portfolio item
// @route   PUT /api/portfolio/:id
// @access  Private (Tailor only - own items)
const updatePortfolioItem = async (req, res) => {
  try {
    let portfolioItem = await Portfolio.findById(req.params.id);

    if (!portfolioItem) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

    // Check if user owns this portfolio item
    if (portfolioItem.tailor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Process tags if provided
    if (req.body.tags) {
      req.body.tags = req.body.tags.split(',').map(tag => tag.trim());
    }

    portfolioItem = await Portfolio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('tailor', 'name shopName avatar');

    res.json({
      success: true,
      message: 'Portfolio item updated successfully',
      data: portfolioItem
    });
  } catch (error) {
    console.error('Update portfolio item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete portfolio item
// @route   DELETE /api/portfolio/:id
// @access  Private (Tailor only - own items)
const deletePortfolioItem = async (req, res) => {
  try {
    const portfolioItem = await Portfolio.findById(req.params.id);

    if (!portfolioItem) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

    // Check if user owns this portfolio item
    if (portfolioItem.tailor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete images from cloudinary
    for (let image of portfolioItem.images) {
      if (image.publicId) {
        await cloudinary.uploader.destroy(image.publicId);
      }
    }

    await portfolioItem.remove();

    res.json({
      success: true,
      message: 'Portfolio item deleted successfully'
    });
  } catch (error) {
    console.error('Delete portfolio item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Like/Unlike portfolio item
// @route   POST /api/portfolio/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const portfolioItem = await Portfolio.findById(req.params.id);

    if (!portfolioItem) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

    const isLiked = portfolioItem.isLikedBy(req.user.id);

    if (isLiked) {
      // Unlike
      portfolioItem.likes = portfolioItem.likes.filter(
        like => like.user.toString() !== req.user.id
      );
    } else {
      // Like
      portfolioItem.likes.push({ user: req.user.id });
    }

    await portfolioItem.save();

    res.json({
      success: true,
      message: isLiked ? 'Portfolio item unliked' : 'Portfolio item liked',
      data: {
        liked: !isLiked,
        likesCount: portfolioItem.likes.length
      }
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add comment to portfolio item
// @route   POST /api/portfolio/:id/comment
// @access  Private
const addComment = async (req, res) => {
  try {
    const { comment } = req.body;

    const portfolioItem = await Portfolio.findById(req.params.id);

    if (!portfolioItem) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

    portfolioItem.comments.push({
      user: req.user.id,
      comment
    });

    await portfolioItem.save();
    await portfolioItem.populate('comments.user', 'name avatar');

    const newComment = portfolioItem.comments[portfolioItem.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: newComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete comment
// @route   DELETE /api/portfolio/:id/comment/:commentId
// @access  Private (Comment owner or portfolio owner)
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const portfolioItem = await Portfolio.findById(req.params.id);

    if (!portfolioItem) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

    const comment = portfolioItem.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment or the portfolio item
    const canDelete = 
      comment.user.toString() === req.user.id ||
      portfolioItem.tailor.toString() === req.user.id;

    if (!canDelete) {
      return res.status(403).json({ message: 'Access denied' });
    }

    comment.remove();
    await portfolioItem.save();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get tailor's portfolio
// @route   GET /api/portfolio/tailor/:tailorId
// @access  Public
const getTailorPortfolio = async (req, res) => {
  try {
    const { tailorId } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: {
        path: 'tailor',
        select: 'name shopName avatar rating experience'
      }
    };

    const portfolioItems = await Portfolio.paginate(
      { tailor: tailorId, isVisible: true },
      options
    );

    res.json({
      success: true,
      data: portfolioItems
    });
  } catch (error) {
    console.error('Get tailor portfolio error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get my portfolio items
// @route   GET /api/portfolio/my-items
// @access  Private (Tailor only)
const getMyPortfolioItems = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };

    const portfolioItems = await Portfolio.paginate(
      { tailor: req.user.id },
      options
    );

    res.json({
      success: true,
      data: portfolioItems
    });
  } catch (error) {
    console.error('Get my portfolio items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createPortfolioItem,
  getPortfolioItems,
  getPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  toggleLike,
  addComment,
  deleteComment,
  getTailorPortfolio,
  getMyPortfolioItems
};