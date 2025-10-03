const express = require('express');
const {
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
} = require('../controllers/portfolioController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadMultiple } = require('../middleware/upload');
const { processImages } = require('../middleware/cloudinaryUpload');
const {
  validatePortfolio,
  handleValidationErrors
} = require('../utils/validators');

const router = express.Router();

// @desc    Create portfolio item
// @route   POST /api/portfolio
// @access  Private (Tailor only)
router.post('/', 
  protect, 
  authorize('tailor'),
  uploadMultiple,
  processImages,
  validatePortfolio, 
  handleValidationErrors, 
  createPortfolioItem
);

// @desc    Get all portfolio items (with filters)
// @route   GET /api/portfolio
// @access  Public
router.get('/', getPortfolioItems);

// @desc    Get my portfolio items
// @route   GET /api/portfolio/my-items
// @access  Private (Tailor only)
router.get('/my-items', protect, authorize('tailor'), getMyPortfolioItems);

// @desc    Get tailor's portfolio
// @route   GET /api/portfolio/tailor/:tailorId
// @access  Public
router.get('/tailor/:tailorId', getTailorPortfolio);

// @desc    Get single portfolio item
// @route   GET /api/portfolio/:id
// @access  Public
router.get('/:id', getPortfolioItem);

// @desc    Update portfolio item
// @route   PUT /api/portfolio/:id
// @access  Private (Tailor only - own items)
router.put('/:id', 
  protect, 
  authorize('tailor'),
  validatePortfolio, 
  handleValidationErrors, 
  updatePortfolioItem
);

// @desc    Delete portfolio item
// @route   DELETE /api/portfolio/:id
// @access  Private (Tailor only - own items)
router.delete('/:id', protect, authorize('tailor'), deletePortfolioItem);

// @desc    Like/Unlike portfolio item
// @route   POST /api/portfolio/:id/like
// @access  Private
router.post('/:id/like', protect, toggleLike);

// @desc    Add comment to portfolio item
// @route   POST /api/portfolio/:id/comment
// @access  Private
router.post('/:id/comment', protect, addComment);

// @desc    Delete comment
// @route   DELETE /api/portfolio/:id/comment/:commentId
// @access  Private (Comment owner or portfolio owner)
router.delete('/:id/comment/:commentId', protect, deleteComment);

module.exports = router;