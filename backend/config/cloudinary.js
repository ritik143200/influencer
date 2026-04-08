const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up storage for portfolio images
const portfolioStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'influencer_portfolios',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }] // Limit size for performance
  }
});

const uploadPortfolio = multer({ storage: portfolioStorage });

module.exports = {
  cloudinary,
  portfolioStorage,
  uploadPortfolio
};
