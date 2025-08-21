const mongoose = require('mongoose');

async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI missing in .env');
    process.exit(1);
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    autoIndex: true
  });

  console.log('✅ MongoDB connected');
}

module.exports = { connectMongo };
