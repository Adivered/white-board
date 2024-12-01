const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const connectDB = async () => {
  try {
    console.log("Process.env.MONGODB_URI: ", process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI, {
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

connectDB();

module.exports = mongoose.connection;