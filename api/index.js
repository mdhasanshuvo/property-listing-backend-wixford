require('dotenv').config();
const app = require('../src/app');
const { connectDB } = require('../src/config/db');

// Cache the database connection
let isConnected = false;

// Connect to MongoDB before handling requests
const handler = async (req, res) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  
  return app(req, res);
};

module.exports = handler;
