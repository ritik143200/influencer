const mongoose = require('mongoose');
const User = require('./models/User');
const crypto = require('crypto');
require('dotenv').config();

const resetPasswordTest = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const email = 'admin@gmail.com'; // Use a real user email
    const user = await User.findOne({ email });

    if (!user) {
      console.log('User not found');
      return;
    }

    // Generate a test reset token
    const token = 'test-token-123';
    const hashed = crypto.createHash('sha256').update(token).digest('hex');

    user.resetPasswordToken = hashed;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    console.log('Reset token set for admin@gmail.com');
    console.log(`Test URL: http://localhost:5173/reset-password?token=${token}`);

    mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};

resetPasswordTest();
