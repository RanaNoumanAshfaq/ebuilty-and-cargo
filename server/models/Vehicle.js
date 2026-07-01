const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true, // e.g. "XLI", "GLI", "Grande", "V8", "Hiace"
  },
  category: {
    type: String,
    required: true,
    enum: ["Economy", "Sedan", "SUV", "Luxury", "Van", "Coaster"],
  },
  pricePerDay: {
    type: Number,
    required: true,
  },
  images: [{
    type: String, // Array of image URLs
  }],
  transmission: {
    type: String,
    enum: ["Automatic", "Manual"],
    default: "Automatic",
  },
  fuelEconomy: {
    type: String, // e.g., "12 km/L"
    default: "12 km/L",
  },
  capacity: {
    type: Number, // Number of seats
    required: true,
  },
  features: [{
    type: String, // AC, Bluetooth, Sunroof, Leather Seats, etc.
  }],
  isAvailable: {
    type: Boolean,
    default: true,
  },
  driverIncluded: {
    type: Boolean,
    default: true,
  },
  luxuryBadge: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Vehicle", VehicleSchema);
