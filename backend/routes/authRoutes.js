const express = require('express');
const passport = require('../config/passport');

const router = express.Router();

const {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    changePassword
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', protect, changePassword);

// Google OAuth routes (only if configured)
router.get('/google', (req, res, next) => {
  console.log('🔍 Google OAuth Request - /google endpoint');
  console.log('🔍 Request Headers:', {
    origin: req.headers.origin,
    host: req.headers.host,
    referer: req.headers.referer
  });
  console.log('🔍 Environment Check:', {
    clientId: process.env.GOOGLE_CLIENT_ID ? '✅ SET' : '❌ NOT SET',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ? '✅ SET' : '❌ NOT SET',
    callbackURL: `http://localhost:${process.env.PORT || 5002}/api/auth/google/callback`
  });
  
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log('❌ Google OAuth not configured - credentials missing');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/auth?error=google_not_configured`);
  }
  
  console.log('✅ Proceeding with Google OAuth - authenticate middleware');
  console.log('🔍 Available strategies:', Object.keys(passport._strategies || {}));
  try {
    const authenticator = passport.authenticate('google', { scope: ['profile', 'email'] });
    authenticator(req, res, next);
  } catch (error) {
    console.error('❌ Google OAuth Error:', error.message, error.stack);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/auth?error=google_error&msg=${encodeURIComponent(error.message)}`);
  }
});

router.get('/google/callback', (req, res, next) => {
  console.log('🔍 Google OAuth Callback - /google/callback endpoint');
  console.log('🔍 Environment Check:', {
    clientId: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET'
  });
  
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log('❌ Google OAuth not configured');
    return res.status(503).json({ 
      success: false, 
      message: 'Google OAuth is not configured.' 
    });
  }
  
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const failureUrl = `${frontendUrl}/auth?error=google_auth_failed`;
  
  passport.authenticate('google', { failureRedirect: failureUrl })(req, res, next);
}, (req, res) => {
  // Successful authentication, redirect to frontend callback
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/?path=auth/callback`);
});

// Get current user from session
router.get('/google/user', (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      user: req.user
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'No user in session'
    });
  }
});

// Handle successful OAuth with token generation
router.get('/google/success', async (req, res) => {
  try {
    if (req.user) {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { id: req.user._id || req.user.id, email: req.user.email },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '30d' }
      );

      res.json({
        success: true,
        token,
        user: {
          _id: req.user._id || req.user.id,
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone,
          role: req.user.role || 'user'
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'No user found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Debug endpoint to check environment variables
router.get('/debug', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET',
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || '5002'
  });
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth routes working',
    timestamp: new Date().toISOString(),
    environment: {
      googleClientId: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET',
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET'
    }
  });
});

module.exports = router;