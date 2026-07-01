require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectDB } = require("./config/db");
const apiRoutes = require("./routes/apiRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets if uploads is active
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mount API routes
app.use("/api", apiRoutes);

// Simple diagnostic route
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

// Serve frontend build in production (optional hook)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../dist", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;

// Connect to DB and Start Listening
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Khan Tourism Server running on port ${PORT}`);
  });
};

startServer();
