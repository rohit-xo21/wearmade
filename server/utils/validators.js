const { body, validationResult } = require('express-validator');

// Common validation rules
const validateEmail = body('email')
  .isEmail()
  .withMessage('Please provide a valid email')
  .normalizeEmail();

const validatePassword = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number');

const validateName = body('name')
  .trim()
  .isLength({ min: 2, max: 50 })
  .withMessage('Name must be between 2 and 50 characters');

const validatePhone = body('phone')
  .optional()
  .isMobilePhone()
  .withMessage('Please provide a valid phone number');

// Registration validation
const validateRegister = [
  validateName,
  validateEmail,
  validatePassword,
  body('role')
    .isIn(['customer', 'tailor'])
    .withMessage('Role must be either customer or tailor'),
  validatePhone
];

// Login validation
const validateLogin = [
  validateEmail,
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Order validation
const validateOrder = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('category')
    .isIn(['suit', 'dress', 'shirt', 'pants', 'skirt', 'jacket', 'blouse', 'lehenga', 'kurta', 'sherwani', 'saree_blouse', 'other'])
    .withMessage('Please select a valid category'),
  body('gender')
    .isIn(['male', 'female', 'unisex'])
    .withMessage('Please select a valid gender'),
  body('garmentType')
    .optional()
    .isIn(['new', 'alteration', 'repair'])
    .withMessage('Garment type must be new, alteration, or repair'),
  body('size')
    .optional()
    .isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'custom'])
    .withMessage('Please select a valid size'),
  body('budget.min')
    .optional()
    .isNumeric()
    .withMessage('Minimum budget must be a number')
    .bail()
    .custom((value) => {
      if (parseFloat(value) < 0) {
        throw new Error('Minimum budget cannot be negative');
      }
      return true;
    }),
  body('budget.max')
    .optional()
    .isNumeric()
    .withMessage('Maximum budget must be a number')
    .bail()
    .custom((value) => {
      if (parseFloat(value) < 0) {
        throw new Error('Maximum budget cannot be negative');
      }
      return true;
    })
    .custom((value, { req }) => {
      if (req.body.budget && req.body.budget.min && parseFloat(value) <= parseFloat(req.body.budget.min)) {
        throw new Error('Maximum budget must be greater than minimum budget');
      }
      return true;
    }),
  body('preferredDeliveryDate')
    .optional()
    .isISO8601()
    .withMessage('Preferred delivery date must be a valid date')
    .custom((value) => {
      const selected = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        throw new Error('Preferred delivery date cannot be in the past');
      }
      return true;
    })
];

// Portfolio validation
const validatePortfolio = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('category')
    .isIn(['suit', 'dress', 'shirt', 'pants', 'skirt', 'jacket', 'blouse', 'traditional', 'formal', 'casual', 'other'])
    .withMessage('Please select a valid category'),
  body().custom((_, { req }) => {
    const minRaw = req.body?.['priceRange[min]'] ?? req.body?.priceRange?.min ?? req.body?.priceRangeMin;
    const maxRaw = req.body?.['priceRange[max]'] ?? req.body?.priceRange?.max ?? req.body?.priceRangeMax;

    const minPrice = parseFloat(minRaw);
    const maxPrice = parseFloat(maxRaw);

    if (Number.isNaN(minPrice) || Number.isNaN(maxPrice)) {
      throw new Error('Price range values are required and must be numeric');
    }

    if (minPrice < 0 || maxPrice < 0) {
      throw new Error('Price range values cannot be negative');
    }

    if (maxPrice <= minPrice) {
      throw new Error('Maximum price must be greater than minimum price');
    }

    return true;
  }),
  body('timeToComplete')
    .isNumeric()
    .withMessage('Time to complete must be a number')
];

// Estimate validation
const validateEstimate = [
  body('price')
    .isNumeric()
    .withMessage('Price must be a number')
    .isFloat({ min: 1 })
    .withMessage('Price must be greater than 0'),
  body('deliveryTime')
    .isNumeric()
    .withMessage('Delivery time must be a number')
    .isInt({ min: 1 })
    .withMessage('Delivery time must be at least 1 day'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message cannot be more than 500 characters')
];

// Profile update validation
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('shopName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Shop name must be between 2 and 100 characters'),
  body('experience')
    .optional()
    .isNumeric()
    .withMessage('Experience must be a number'),
  body('specialties')
    .optional()
    .isArray()
    .withMessage('Specialties must be an array')
];

// Password reset validation
const validatePasswordReset = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateOrder,
  validatePortfolio,
  validateEstimate,
  validateProfileUpdate,
  validatePasswordReset,
  handleValidationErrors
};