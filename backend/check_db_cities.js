const mongoose = require('mongoose');
require('dotenv').config();

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const docs = await mongoose.connection.db.collection('cities').find().limit(5).toArray();
    console.log('Cities docs:', JSON.stringify(docs, null, 2));

    mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};

checkDB();
