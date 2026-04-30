const mongoose = require('mongoose');

// Truck Model
const truckSchema = new mongoose.Schema({
  id: { type: String, required: true }, // Plate Number
  capacity: { type: String, required: true },
  loc: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Available', 'In Transit', 'Maintenance'], default: 'Available' },
  coordinates: { type: [Number], default: [31.5204, 74.3587] },
  createdAt: { type: Date, default: Date.now }
});

// Cargo Model
const cargoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  weight: { type: String, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  transporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Pending', 'In Transit', 'Completed'], default: 'Pending' },
  assignedTruck: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Booking Model
const bookingSchema = new mongoose.Schema({
  truckId: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck', required: true },
  truckPlate: { type: String, required: true },
  truckOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cargoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cargo', required: true },
  cargoTitle: { type: String, required: true },
  transporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transporterName: { type: String, required: true },
  price: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected', 'Counter-Offered', 'Completed', 'Cancelled'], default: 'Pending' },
  eta: { type: String },
  messages: [{
    sender: String,
    text: String,
    time: { type: Date, default: Date.now }
  }],
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Notification Model
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Complaint Model
const complaintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userRole: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Open', 'Resolved'], default: 'Open' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  Truck: mongoose.model('Truck', truckSchema),
  Cargo: mongoose.model('Cargo', cargoSchema),
  Booking: mongoose.model('Booking', bookingSchema),
  Notification: mongoose.model('Notification', notificationSchema),
  Complaint: mongoose.model('Complaint', complaintSchema)
};
