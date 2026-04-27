const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const options = {
      maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE, 10) || 50,
      serverSelectionTimeoutMS: 5000
    };
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    // don't exit here — let the caller decide how to handle startup failures
    throw error;
  }
};

module.exports = connectDB;
