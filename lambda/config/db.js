const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('✅ Using existing MongoDB connection');
    return mongoose.connection;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not set in env');

  try {
    await mongoose.connect(uri);
    isConnected = true;
    console.log('✅ MongoDB connected (Lambda)');
    return mongoose.connection;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    throw err;
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected, will reconnect on next invocation');
  isConnected = false;
});

module.exports = connectDB;
