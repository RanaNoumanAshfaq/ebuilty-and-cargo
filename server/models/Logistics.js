const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

// ─── Truck Model ───────────────────────────────────────────────────────────────
const Truck = sequelize.define('Truck', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  plateNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'plate_number'
  },
  capacity: { type: DataTypes.STRING, allowNull: false },
  loc: { type: DataTypes.STRING, allowNull: false },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'owner_id',
    references: { model: User, key: 'id' }
  },
  status: {
    type: DataTypes.ENUM('Available', 'In Transit', 'Maintenance'),
    defaultValue: 'Available'
  },
  lat: { type: DataTypes.FLOAT, defaultValue: 31.5204 },
  lng: { type: DataTypes.FLOAT, defaultValue: 74.3587 }
}, {
  tableName: 'trucks',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false
});

// ─── Cargo Model ───────────────────────────────────────────────────────────────
const Cargo = sequelize.define('Cargo', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  weight: { type: DataTypes.STRING, allowNull: false },
  origin: { type: DataTypes.STRING, allowNull: false },
  destination: { type: DataTypes.STRING, allowNull: false },
  transporterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'transporter_id',
    references: { model: User, key: 'id' }
  },
  status: {
    type: DataTypes.ENUM('Pending', 'In Transit', 'Completed'),
    defaultValue: 'Pending'
  },
  assignedTruck: { type: DataTypes.STRING, field: 'assigned_truck' }
}, {
  tableName: 'cargo',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false
});

// ─── Booking Model ─────────────────────────────────────────────────────────────
const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  truckId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'truck_id',
    references: { model: Truck, key: 'id' }
  },
  truckPlate: { type: DataTypes.STRING, allowNull: false, field: 'truck_plate' },
  truckOwnerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'truck_owner_id',
    references: { model: User, key: 'id' }
  },
  cargoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'cargo_id',
    references: { model: Cargo, key: 'id' }
  },
  cargoTitle: { type: DataTypes.STRING, allowNull: false, field: 'cargo_title' },
  transporterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'transporter_id',
    references: { model: User, key: 'id' }
  },
  transporterName: { type: DataTypes.STRING, allowNull: false, field: 'transporter_name' },
  price: { type: DataTypes.STRING, allowNull: false },
  status: {
    type: DataTypes.ENUM('Pending', 'Accepted', 'Rejected', 'Counter-Offered', 'Completed', 'Cancelled'),
    defaultValue: 'Pending'
  },
  eta: { type: DataTypes.STRING },
  completedAt: { type: DataTypes.DATE, field: 'completed_at' }
}, {
  tableName: 'bookings',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false
});

// ─── Booking Messages Model (replaces embedded array) ─────────────────────────
const BookingMessage = sequelize.define('BookingMessage', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'booking_id',
    references: { model: Booking, key: 'id' }
  },
  sender: { type: DataTypes.STRING },
  text: { type: DataTypes.TEXT }
}, {
  tableName: 'booking_messages',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false
});

// ─── Notification Model ────────────────────────────────────────────────────────
const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: { model: User, key: 'id' }
  },
  message: { type: DataTypes.TEXT, allowNull: false },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_read' }
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false
});

// ─── Complaint Model ───────────────────────────────────────────────────────────
const Complaint = sequelize.define('Complaint', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: { model: User, key: 'id' }
  },
  userName: { type: DataTypes.STRING, allowNull: false, field: 'user_name' },
  userRole: { type: DataTypes.STRING, allowNull: false, field: 'user_role' },
  subject: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  status: {
    type: DataTypes.ENUM('Open', 'Resolved'),
    defaultValue: 'Open'
  }
}, {
  tableName: 'complaints',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false
});

// ─── Associations ──────────────────────────────────────────────────────────────
User.hasMany(Truck, { foreignKey: 'owner_id' });
Truck.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

User.hasMany(Cargo, { foreignKey: 'transporter_id' });
Cargo.belongsTo(User, { foreignKey: 'transporter_id', as: 'transporter' });

Booking.hasMany(BookingMessage, { foreignKey: 'booking_id', as: 'messages' });
BookingMessage.belongsTo(Booking, { foreignKey: 'booking_id' });

User.hasMany(Notification, { foreignKey: 'user_id' });
User.hasMany(Complaint, { foreignKey: 'user_id' });

module.exports = { Truck, Cargo, Booking, BookingMessage, Notification, Complaint };
