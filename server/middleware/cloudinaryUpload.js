const { cloudinary } = require('./upload');
const streamifier = require('streamifier');

const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'wearmade',
        ...options
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

const processImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    const uploadPromises = req.files.map(async (file) => {
      const result = await uploadToCloudinary(file.buffer, {
        public_id: `${Date.now()}-${file.originalname}`,
      });
      
      return {
        url: result.secure_url,
        publicId: result.public_id,
        caption: file.originalname
      };
    });

    const uploadedImages = await Promise.all(uploadPromises);
    req.uploadedImages = uploadedImages;
    
    next();
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Image upload failed',
      error: error.message
    });
  }
};

module.exports = {
  processImages,
  uploadToCloudinary
};