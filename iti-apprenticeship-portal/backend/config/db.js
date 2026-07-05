const mongoose = require("mongoose");

// Establishes the connection to MongoDB using the URI from environment
// variables. The process exits if the connection cannot be made, since the
// API is useless without a working database.
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/iti_apprenticeship_portal";
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
