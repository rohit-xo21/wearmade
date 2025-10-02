const multer = require('multer');
const cloudinary = require('../config/cloudinary');

// Memory storage for processing before uploading to Cloudinary
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Multiple image upload configurations
const uploadSingle = upload.single('image');
const uploadMultiple = upload.array('images', 5);
const uploadFields = upload.fields([
  { name: 'designImages', maxCount: 3 },
  { name: 'referenceImages', maxCount: 3 }
]);

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  cloudinary
};