const mongoose = require('mongoose');
require('dotenv').config();

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    for (const col of collections) {
        if (col.name.toLowerCase().includes('city') || col.name.toLowerCase().includes('location')) {
            console.log(`\nSample from ${col.name}:`);
            const docs = await mongoose.connection.db.collection(col.name).find().limit(3).toArray();
            console.log(docs);
        }
    }

    mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};

checkDB();
