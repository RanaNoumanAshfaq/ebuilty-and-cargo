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
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

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
    const trucks = await Truck.find(req.query.ownerId ? { ownerId: req.query.ownerId } : {});
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

app.post('/api/cargo', authMiddleware, async (req, res) => {
  try {
    const cargo = new Cargo({ ...req.body, transporterId: req.user.id });
    await cargo.save();
    res.status(201).json(cargo);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.post('/api/bookings', authMiddleware, async (req, res) => {
  try {
    const booking = new Booking({ ...req.body, transporterId: req.user.id });
    await booking.save();
    await sendNotification(booking.truckOwnerId, `New booking request for ${booking.cargoTitle}`);
    res.status(201).json(booking);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.patch('/api/bookings/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    // Notify appropriate party
    const targetId = req.user.id.toString() === booking.truckOwnerId.toString() ? booking.transporterId : booking.truckOwnerId;
    await sendNotification(targetId, `Booking status updated to ${booking.status} for ${booking.cargoTitle}`);
    res.json(booking);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
