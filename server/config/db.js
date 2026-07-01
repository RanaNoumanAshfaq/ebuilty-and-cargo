const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

let isConnected = false;
let useMock = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/khan-tourism";
  
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000 // Quick timeout to failover to mock mode
    });
    isConnected = true;
    console.log("🚀 MongoDB Connected successfully at: " + mongoURI);
  } catch (error) {
    isConnected = false;
    useMock = true;
    console.log("⚠️ MongoDB connection failed. Switching to Local File Mock DB Mode.");
    
    // Ensure mock data directory exists
    const dataDir = path.join(__dirname, "../data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }
};

const getDBState = () => {
  return { isConnected, useMock };
};

module.exports = { connectDB, getDBState };
