const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Allow guest users if necessary, or link to registered user
  },
  guestInfo: {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
  },
  type: {
    type: String,
    enum: ["Car", "Tour", "Airport"],
    required: true,
  },
  itemName: {
    type: String, // e.g. "Toyota Corolla Grande", "Hunza Valley Tour"
    required: true,
  },
  startDate: {
    type: String, // format YYYY-MM-DD
    required: true,
  },
  endDate: {
    type: String,
    required: false,
  },
  totalDays: {
    type: Number,
    default: 1,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  timelineStatus: {
    type: String,
    enum: [
      "Inquiry Sent",
      "Admin Consultation",
      "Vehicle Suggested",
      "Quotation Sent",
      "Verification",
      "Payment",
      "Booking Confirmed",
      "Enjoy Your Trip",
      "Completed",
    ],
    default: "Inquiry Sent",
  },
  details: {
    peopleCount: { type: Number, default: 1 },
    flightNumber: { type: String },
    pickupTime: { type: String },
    fuelCostEstimation: { type: Number },
    driverName: { type: String },
    driverPhone: { type: String },
    driverPhoto: { type: String },
    driverVehicleNo: { type: String },
    livePickupStatus: { type: String, default: "Driver Assigned" }, // For flight pickup tracking
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Booking", BookingSchema);
