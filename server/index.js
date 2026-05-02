const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecargobilty';
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// MongoDB Connection
if (!process.env.MONGODB_URI) {
  console.warn('⚠️ MONGODB_URI not found in environment. Using default local connection.');
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    console.log(`📡 Connected to: ${MONGODB_URI.split('@')[1] || 'localhost'}`);
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:');
    console.error(err.message);
    process.exit(1); // Exit if cannot connect to DB
  });

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const status = role === 'admin' ? 'active' : 'pending';
    const user = new User({ name, email, password, role, status });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name, email, role, status } });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email, role: user.role, status: user.status } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Middleware for JWT Verification
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const http = require('http');
const { Server } = require('socket.io');
const { Truck, Cargo, Booking, Notification, Complaint } = require('./models/Logistics');

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });
  socket.on('disconnect', () => console.log('User disconnected'));
});

// Helper for real-time notifications
const sendNotification = async (userId, message) => {
  try {
    const notification = new Notification({ userId, message });
    await notification.save();
    io.to(userId.toString()).emit('notification', notification);
  } catch (e) { console.error(e); }
};

// ... (existing Auth routes)

// Logistics Routes
app.get('/api/trucks', authMiddleware, async (req, res) => {
  try {
    const filter = req.query.ownerId ? { ownerId: req.query.ownerId } : {};
    const trucks = await Truck.find(filter);
    res.json(trucks);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.post('/api/trucks', authMiddleware, async (req, res) => {
  try {
    const truck = new Truck({ ...req.body, ownerId: req.user.id });
    await truck.save();
    res.status(201).json(truck);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.patch('/api/trucks/:id', authMiddleware, async (req, res) => {
  try {
    const truck = await Truck.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(truck);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.delete('/api/trucks/:id', authMiddleware, async (req, res) => {
  try {
    await Truck.findByIdAndDelete(req.params.id);
    res.json({ message: 'Truck deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.get('/api/bookings', authMiddleware, async (req, res) => {
  try {
    const filter = {};
    if (req.query.truckOwnerId) filter.truckOwnerId = req.query.truckOwnerId;
    if (req.query.transporterId) filter.transporterId = req.query.transporterId;
    if (req.query.status) filter.status = { $in: req.query.status.split(',') };
    
    const bookings = await Booking.find(filter);
    res.json(bookings);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.post('/api/bookings', authMiddleware, async (req, res) => {
  try {
    const booking = new Booking({ ...req.body, transporterId: req.user.id });
    await booking.save();
    await sendNotification(booking.truckOwnerId, `New booking request for ${booking.cargoTitle}`);
    io.emit('booking_updated'); // Broad notification for dashboards
    res.status(201).json(booking);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.patch('/api/bookings/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    const targetId = req.user.id.toString() === booking.truckOwnerId.toString() ? booking.transporterId : booking.truckOwnerId;
    await sendNotification(targetId, `Booking status updated to ${booking.status} for ${booking.cargoTitle}`);
    io.emit('booking_updated');
    res.json(booking);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.get('/api/notifications', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.delete('/api/notifications/:id', authMiddleware, async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Notification deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Cargo Routes
app.get('/api/cargo', authMiddleware, async (req, res) => {
  try {
    const filter = req.query.transporterId ? { transporterId: req.query.transporterId } : {};
    const cargo = await Cargo.find(filter).sort({ createdAt: -1 });
    res.json(cargo);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.post('/api/cargo', authMiddleware, async (req, res) => {
  try {
    const cargo = new Cargo({ ...req.body, transporterId: req.user.id });
    await cargo.save();
    res.status(201).json(cargo);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.patch('/api/cargo/:id', authMiddleware, async (req, res) => {
  try {
    const cargo = await Cargo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(cargo);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.delete('/api/cargo/:id', authMiddleware, async (req, res) => {
  try {
    await Cargo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Cargo deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.post('/api/bookings/:id/complete', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // 1. Update Booking
    booking.status = 'Completed';
    booking.completedAt = new Date();
    await booking.save();

    // 2. Update Truck
    await Truck.findByIdAndUpdate(booking.truckId, { status: 'Available' });

    // 3. Update Cargo
    await Cargo.findByIdAndUpdate(booking.cargoId, { status: 'Completed' });

    // 4. Notifications
    await sendNotification(booking.transporterId, `Delivery completed for ${booking.cargoTitle}.`);
    
    io.emit('booking_updated');
    res.json({ message: 'Booking marked as completed', booking });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Complaints Routes
app.post('/api/complaints', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const complaint = new Complaint({ 
      ...req.body, 
      userId: req.user.id,
      userName: user.name,
      userRole: user.role
    });
    await complaint.save();
    res.status(201).json(complaint);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.get('/api/complaints', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.patch('/api/complaints/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  try {
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(complaint);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Admin User Management
app.get('/api/users', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.patch('/api/users/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    await sendNotification(user._id, `Your account status has been updated to: ${user.status}`);
    res.json(user);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.get('/api/admin/stats', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  try {
    const usersCount = await User.countDocuments();
    const trucksCount = await Truck.countDocuments();
    const bookingsCount = await Booking.countDocuments();
    const activeShipments = await Booking.countDocuments({ status: 'Accepted' });
    const complaintsCount = await Complaint.countDocuments({ status: 'Open' });
    res.json({ users: usersCount, trucks: trucksCount, bookings: bookingsCount, activeShipments, complaints: complaintsCount });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
