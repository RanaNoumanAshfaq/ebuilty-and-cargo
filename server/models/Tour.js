const mongoose = require("mongoose");

const ItineraryDaySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
});

const TourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  days: {
    type: String, // e.g. "5 Days / 4 Nights"
    required: true,
  },
  price: {
    type: Number,
    required: true, // Base price in PKR
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["Honeymoon", "Adventure", "Summer", "Winter", "Eid", "Family"],
    default: "Adventure",
  },
  description: {
    type: String,
    required: true,
  },
  highlights: [{
    type: String,
  }],
  itinerary: [ItineraryDaySchema],
  bestTime: {
    type: String, // e.g. "May to October"
    default: "May to October",
  },
  activities: [{
    type: String, // Hiking, Boating, Paragliding, sightseeing, etc.
  }],
  weatherInfo: {
    type: String, // e.g. "Average temperature: 15°C. Heavy winter snow."
    default: "",
  },
  packingChecklist: [{
    type: String, // Warm clothes, Hiking boots, Umbrella, etc.
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Tour", TourSchema);
