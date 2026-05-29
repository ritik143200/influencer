const mongoose = require('mongoose');
require('dotenv').config();

let lastConnectionError = null;

mongoose.connection.on('connected', () => {
  lastConnectionError = null;
});

mongoose.connection.on('error', (error) => {
  lastConnectionError = error;
});

mongoose.connection.on('disconnected', () => {
  if (process.env.NODE_ENV === 'production') {
    console.warn('MongoDB disconnected');
  }
});

const getDBStatus = () => ({
  state: mongoose.connection.readyState,
  status: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
  host: mongoose.connection.host || null,
  name: mongoose.connection.name || null,
  lastError: lastConnectionError ? lastConnectionError.message : null
});

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    const error = new Error('MONGODB_URI is missing. Add your MongoDB Atlas/local URI in backend/.env.');
    lastConnectionError = error;
    throw error;
  }

  try {
    const options = {
      maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE, 10) || 50,
      serverSelectionTimeoutMS: parseInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS, 10) || 7000,
      socketTimeoutMS: parseInt(process.env.MONGO_SOCKET_TIMEOUT_MS, 10) || 45000,
      autoIndex: process.env.MONGO_AUTO_INDEX !== 'false',
      family: 4
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    lastConnectionError = null;
    return conn;
  } catch (error) {
    lastConnectionError = error;
    console.error('Database connection error:', error);
    // Let the caller decide whether the app should keep running in preview/dev.
    throw error;
  }
};

module.exports = {
  connectDB,
  getDBStatus
};
