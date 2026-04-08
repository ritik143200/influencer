const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const users = await User.find().limit(5);
    users.forEach(u => {
      console.log(`User: ${u.email} | Role: ${u.role}`);
    });

    mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};

checkDB();
