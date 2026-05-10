const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const sequelize = require('./db');
const User = require('./models/User');
const { Truck, Cargo, Booking, BookingMessage, Notification, Complaint } = require('./models/Logistics');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// ─── Auth Routes ───────────────────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const status = role === 'admin' ? 'active' : 'pending';
    const user = await User.create({ name, email, password, role, status });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, name, email, role, status } });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email, role: user.role, status: user.status } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── JWT Middleware ────────────────────────────────────────────────────────────

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
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    await User.update(req.body, { where: { id: req.user.id } });
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Socket.io Setup ───────────────────────────────────────────────────────────

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('join', (userId) => {
    socket.join(userId.toString());
    console.log(`User ${userId} joined room`);
  });
  socket.on('disconnect', () => console.log('User disconnected'));
});

// ─── Notification Helper ───────────────────────────────────────────────────────

const sendNotification = async (userId, message) => {
  try {
    const notification = await Notification.create({ userId, message });
    io.to(userId.toString()).emit('notification', notification);
  } catch (e) {
    console.error(e);
  }
};

// ─── Truck Routes ──────────────────────────────────────────────────────────────

app.get('/api/trucks', authMiddleware, async (req, res) => {
  try {
    const where = req.query.ownerId ? { ownerId: req.query.ownerId } : {};
    const trucks = await Truck.findAll({ where });
    // Map to include coordinates array for frontend compatibility
    const result = trucks.map(t => ({
      ...t.toJSON(),
      id: t.id,          // numeric id as primary key
      _id: t.id,         // alias for any legacy frontend refs
      coordinates: [t.lat, t.lng]
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/trucks', authMiddleware, async (req, res) => {
  try {
    const { id: plateNumber, capacity, loc, status, coordinates } = req.body;
    const [lat, lng] = coordinates || [31.5204, 74.3587];
    const truck = await Truck.create({
      plateNumber,
      capacity,
      loc,
      ownerId: req.user.id,
      status: status || 'Available',
      lat,
      lng
    });
    res.status(201).json({ ...truck.toJSON(), _id: truck.id, coordinates: [truck.lat, truck.lng] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/trucks/:id', authMiddleware, async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.body.coordinates) {
      updateData.lat = req.body.coordinates[0];
      updateData.lng = req.body.coordinates[1];
      delete updateData.coordinates;
    }
    if (req.body.id) {
      updateData.plateNumber = req.body.id;
      delete updateData.id;
    }
    await Truck.update(updateData, { where: { id: req.params.id } });
    const truck = await Truck.findByPk(req.params.id);
    res.json({ ...truck.toJSON(), _id: truck.id, coordinates: [truck.lat, truck.lng] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/trucks/:id', authMiddleware, async (req, res) => {
  try {
    await Truck.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Truck deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Cargo Routes ──────────────────────────────────────────────────────────────

app.get('/api/cargo', authMiddleware, async (req, res) => {
  try {
    const where = req.query.transporterId ? { transporterId: req.query.transporterId } : {};
    const cargo = await Cargo.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(cargo.map(c => ({ ...c.toJSON(), _id: c.id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/cargo', authMiddleware, async (req, res) => {
  try {
    const cargo = await Cargo.create({ ...req.body, transporterId: req.user.id });
    res.status(201).json({ ...cargo.toJSON(), _id: cargo.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/cargo/:id', authMiddleware, async (req, res) => {
  try {
    await Cargo.update(req.body, { where: { id: req.params.id } });
    const cargo = await Cargo.findByPk(req.params.id);
    res.json({ ...cargo.toJSON(), _id: cargo.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/cargo/:id', authMiddleware, async (req, res) => {
  try {
    await Cargo.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Cargo deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Booking Routes ────────────────────────────────────────────────────────────

const { Op } = require('sequelize');

app.get('/api/bookings', authMiddleware, async (req, res) => {
  try {
    const where = {};
    if (req.query.truckOwnerId) where.truckOwnerId = req.query.truckOwnerId;
    if (req.query.transporterId) where.transporterId = req.query.transporterId;
    if (req.query.status) where.status = { [Op.in]: req.query.status.split(',') };

    const bookings = await Booking.findAll({
      where,
      include: [{ model: BookingMessage, as: 'messages' }]
    });
    res.json(bookings.map(b => ({ ...b.toJSON(), _id: b.id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/bookings', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.create({ ...req.body, transporterId: req.user.id });
    await sendNotification(booking.truckOwnerId, `New booking request for ${booking.cargoTitle}`);
    io.emit('booking_updated');
    res.status(201).json({ ...booking.toJSON(), _id: booking.id, messages: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/bookings/:id', authMiddleware, async (req, res) => {
  try {
    // Handle message push separately
    if (req.body.$push && req.body.$push.messages) {
      const msg = req.body.$push.messages;
      await BookingMessage.create({ bookingId: req.params.id, sender: msg.sender, text: msg.text });
      const booking = await Booking.findByPk(req.params.id, {
        include: [{ model: BookingMessage, as: 'messages' }]
      });
      return res.json({ ...booking.toJSON(), _id: booking.id });
    }

    await Booking.update(req.body, { where: { id: req.params.id } });
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: BookingMessage, as: 'messages' }]
    });
    const targetId = req.user.id.toString() === booking.truckOwnerId.toString()
      ? booking.transporterId
      : booking.truckOwnerId;
    await sendNotification(targetId, `Booking status updated to ${booking.status} for ${booking.cargoTitle}`);
    io.emit('booking_updated');
    res.json({ ...booking.toJSON(), _id: booking.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Booking Complete Route ────────────────────────────────────────────────────

app.post('/api/bookings/:id/complete', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    await Booking.update({ status: 'Completed', completedAt: new Date() }, { where: { id: req.params.id } });
    await Truck.update({ status: 'Available' }, { where: { id: booking.truckId } });
    await Cargo.update({ status: 'Completed' }, { where: { id: booking.cargoId } });
    await sendNotification(booking.transporterId, `Delivery completed for ${booking.cargoTitle}.`);

    io.emit('booking_updated');
    const updated = await Booking.findByPk(req.params.id);
    res.json({ message: 'Booking marked as completed', booking: { ...updated.toJSON(), _id: updated.id } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Notification Routes ───────────────────────────────────────────────────────

app.get('/api/notifications', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(notifications.map(n => ({ ...n.toJSON(), _id: n.id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/notifications/:id', authMiddleware, async (req, res) => {
  try {
    await Notification.destroy({ where: { id: req.params.id, userId: req.user.id } });
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Complaint Routes ──────────────────────────────────────────────────────────

app.post('/api/complaints', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const complaint = await Complaint.create({
      ...req.body,
      userId: req.user.id,
      userName: user.name,
      userRole: user.role
    });
    res.status(201).json({ ...complaint.toJSON(), _id: complaint.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/complaints', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  try {
    const complaints = await Complaint.findAll({ order: [['createdAt', 'DESC']] });
    res.json(complaints.map(c => ({ ...c.toJSON(), _id: c.id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/complaints/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  try {
    await Complaint.update(req.body, { where: { id: req.params.id } });
    const complaint = await Complaint.findByPk(req.params.id);
    res.json({ ...complaint.toJSON(), _id: complaint.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Admin User Management ────────────────────────────────────────────────────

app.get('/api/users', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users.map(u => ({ ...u.toJSON(), _id: u.id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/users/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  try {
    await User.update(req.body, { where: { id: req.params.id } });
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
    await sendNotification(user.id, `Your account status has been updated to: ${user.status}`);
    res.json({ ...user.toJSON(), _id: user.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/admin/stats', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  try {
    const [usersCount, trucksCount, bookingsCount, activeShipments, complaintsCount] = await Promise.all([
      User.count(),
      Truck.count(),
      Booking.count(),
      Booking.count({ where: { status: 'Accepted' } }),
      Complaint.count({ where: { status: 'Open' } })
    ]);
    res.json({ users: usersCount, trucks: trucksCount, bookings: bookingsCount, activeShipments, complaints: complaintsCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Start Server ──────────────────────────────────────────────────────────────

sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ MySQL Database synced');
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Database sync failed:', err.message);
    process.exit(1);
  });
