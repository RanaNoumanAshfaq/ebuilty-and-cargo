# Khan Tourism — Source Code Reference Document

This document contains the complete source code for all project files (excluding node_modules, lockfiles, etc.) as of 2026-07-01T11:25:45.674Z.

## File: [eslint.config.js](file:///C:/Users/hp/Desktop/Khan Tourism/eslint.config.js)

```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])

```

## File: [index.html](file:///C:/Users/hp/Desktop/Khan Tourism/index.html)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>khan-tourism</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

```

## File: [package.json](file:///C:/Users/hp/Desktop/Khan Tourism/package.json)

```json
{
  "name": "khan-tourism",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "firebase": "^12.13.0",
    "react": "^19.2.6",
    "react-dom": "^19.2.6",
    "react-icons": "^5.6.0",
    "react-router-dom": "^7.15.1"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^10.3.0",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.6.0",
    "vite": "^8.0.12"
  }
}

```

## File: [README.md](file:///C:/Users/hp/Desktop/Khan Tourism/README.md)

```markdown
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

```

## File: [server/config/db.js](file:///C:/Users/hp/Desktop/Khan Tourism/server/config/db.js)

```javascript
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

```

## File: [server/controllers/apiController.js](file:///C:/Users/hp/Desktop/Khan Tourism/server/controllers/apiController.js)

```javascript
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { getDBState } = require("../config/db");
const MOCK_DB = require("../utils/mockDB");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Tour = require("../models/Tour");
const Booking = require("../models/Booking");
const Message = require("../models/Message");

// Helper to sign JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "khan_secret_jwt_key_2026", {
    expiresIn: "30d",
  });
};

// ================= AUTH CONTROLLERS =================

const registerUser = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please fill in all required fields." });
  }

  try {
    const isMock = getDBState().useMock;

    // Check duplicate
    let userExists;
    if (isMock) {
      userExists = MOCK_DB.Users.findOne({ email });
    } else {
      userExists = await User.findOne({ email });
    }

    if (userExists) {
      return res.status(400).json({ message: "A user with this email already exists." });
    }

    let newUser;
    if (isMock) {
      const salt = bcrypt.genSaltSync(10);
      const hashPassword = bcrypt.hashSync(password, salt);
      newUser = MOCK_DB.Users.create({
        name,
        email,
        password: hashPassword,
        phone: phone || "",
        role: "user",
        verificationStatus: "none",
        savedTours: [],
        savedCars: [],
      });
    } else {
      newUser = await User.create({
        name,
        email,
        password, // Pre-save hook hashes this
        phone: phone || "",
      });
    }

    res.status(201).json({
      token: signToken(newUser._id),
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        verificationStatus: newUser.verificationStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed: " + error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const isMock = getDBState().useMock;
    let foundUser;

    if (isMock) {
      foundUser = MOCK_DB.Users.findOne({ email });
    } else {
      foundUser = await User.findOne({ email });
    }

    if (!foundUser) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Check password
    let isMatch = false;
    if (isMock) {
      isMatch = bcrypt.compareSync(password, foundUser.password);
    } else {
      isMatch = await foundUser.comparePassword(password);
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    res.json({
      token: signToken(foundUser._id),
      user: {
        id: foundUser._id,
        name: foundUser.name,
        email: foundUser.email,
        phone: foundUser.phone,
        role: foundUser.role,
        verificationStatus: foundUser.verificationStatus,
        avatar: foundUser.avatar || "",
        savedCars: foundUser.savedCars || [],
        savedTours: foundUser.savedTours || [],
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed: " + error.message });
  }
};

const getMe = async (req, res) => {
  res.json({ user: req.user });
};

const updateProfile = async (req, res) => {
  const { name, phone, avatar } = req.body;
  try {
    const isMock = getDBState().useMock;
    let updated;

    if (isMock) {
      updated = MOCK_DB.Users.findByIdAndUpdate(req.user._id, { name, phone, avatar });
    } else {
      updated = await User.findByIdAndUpdate(
        req.user._id,
        { name, phone, avatar },
        { new: true }
      ).select("-password");
    }

    res.json({ user: updated });
  } catch (error) {
    res.status(500).json({ message: "Profile update failed: " + error.message });
  }
};

const verifyIdentity = async (req, res) => {
  const { cnic, passport } = req.body;
  try {
    const isMock = getDBState().useMock;
    let updated;

    if (isMock) {
      updated = MOCK_DB.Users.findByIdAndUpdate(req.user._id, {
        cnic: cnic || "",
        passport: passport || "",
        verificationStatus: "pending",
      });
    } else {
      updated = await User.findByIdAndUpdate(
        req.user._id,
        {
          cnic: cnic || "",
          passport: passport || "",
          verificationStatus: "pending",
        },
        { new: true }
      ).select("-password");
    }

    res.json({ user: updated });
  } catch (error) {
    res.status(500).json({ message: "Identity verification submission failed." });
  }
};

// ================= CAR CONTROLLERS =================

const getCars = async (req, res) => {
  try {
    const isMock = getDBState().useMock;
    let cars;
    if (isMock) {
      cars = MOCK_DB.Vehicles.find({});
    } else {
      cars = await Vehicle.find({});
    }
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cars." });
  }
};

const bookCar = async (req, res) => {
  const { carId, startDate, endDate, totalDays, totalPrice, peopleCount } = req.body;
  try {
    const isMock = getDBState().useMock;

    let carName = "Luxury Vehicle";
    if (isMock) {
      const car = MOCK_DB.Vehicles.findById(carId);
      if (car) carName = car.name;
    } else {
      const car = await Vehicle.findById(carId);
      if (car) carName = car.name;
    }

    const bookingData = {
      user: req.user ? req.user._id : null,
      guestInfo: req.user ? undefined : { name: "Guest User", email: "guest@example.com", phone: "N/A" },
      type: "Car",
      itemName: carName,
      startDate,
      endDate,
      totalDays: Number(totalDays),
      totalPrice: Number(totalPrice),
      timelineStatus: "Inquiry Sent",
      details: {
        peopleCount: Number(peopleCount),
        livePickupStatus: "Driver Assigned",
        driverName: "Muhammad Ali",
        driverPhone: "0300-9876543",
        driverPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
        driverVehicleNo: "ICT-GA-492",
      },
    };

    let newBooking;
    if (isMock) {
      newBooking = MOCK_DB.Bookings.create(bookingData);
    } else {
      newBooking = await Booking.create(bookingData);
    }

    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ message: "Failed to create car booking: " + error.message });
  }
};

// ================= TOUR CONTROLLERS =================

const getTours = async (req, res) => {
  try {
    const isMock = getDBState().useMock;
    let tours;
    if (isMock) {
      tours = MOCK_DB.Tours.find({});
    } else {
      tours = await Tour.find({});
    }
    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tours." });
  }
};

const bookTour = async (req, res) => {
  const { tourId, startDate, totalDays, totalPrice, peopleCount } = req.body;
  try {
    const isMock = getDBState().useMock;

    let tourName = "Pakistan Tour";
    if (isMock) {
      const tour = MOCK_DB.Tours.findById(tourId);
      if (tour) tourName = tour.name;
    } else {
      const tour = await Tour.findById(tourId);
      if (tour) tourName = tour.name;
    }

    const bookingData = {
      user: req.user ? req.user._id : null,
      type: "Tour",
      itemName: tourName,
      startDate,
      totalDays: Number(totalDays),
      totalPrice: Number(totalPrice),
      timelineStatus: "Inquiry Sent",
      details: {
        peopleCount: Number(peopleCount),
      },
    };

    let newBooking;
    if (isMock) {
      newBooking = MOCK_DB.Bookings.create(bookingData);
    } else {
      newBooking = await Booking.create(bookingData);
    }

    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ message: "Failed to book tour: " + error.message });
  }
};

// ================= OTHER API SERVICES =================

const requestCallback = async (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ message: "Name and Phone are required." });
  }
  try {
    const isMock = getDBState().useMock;
    const msgData = {
      name,
      phone,
      message: "Callback requested from expert contact FAB widget.",
      type: "callback",
      status: "pending",
    };

    let newMsg;
    if (isMock) {
      newMsg = MOCK_DB.Messages.create(msgData);
    } else {
      newMsg = await Message.create(msgData);
    }

    res.status(201).json(newMsg);
  } catch (error) {
    res.status(500).json({ message: "Failed to request callback." });
  }
};

// Travel planner calculator
const planTrip = async (req, res) => {
  const { budget, people, days, destination } = req.body;
  if (!budget || !people || !days || !destination) {
    return res.status(400).json({ message: "Missing planner criteria parameters." });
  }

  // Islamabad reference distances:
  const distances = {
    Hunza: 600,
    Skardu: 650,
    Swat: 250,
    Murree: 60,
  };

  const selectedDist = distances[destination] || 150; // default dist
  const totalKm = selectedDist * 2; // round trip

  // Calculate fuel cost based on standard Sedan average (12 km/L) and fuel price Rs. 275/L
  const fuelCost = Math.round((totalKm / 12) * 275);

  // Recommendations based on budget
  let carRec = "Toyota Corolla GLI";
  let carId = "c_corolla_gli";
  let hotelRec = "Standard Regency Hotel";
  let hotelCostPerNight = 12000;

  const budgetNum = Number(budget);
  if (budgetNum < 70000) {
    carRec = "Toyota Corolla GLI";
    carId = "c_corolla_gli";
    hotelRec = "Riverview Lodge Swat / PTDC Murree";
    hotelCostPerNight = 8000;
  } else if (budgetNum >= 70000 && budgetNum <= 150000) {
    carRec = "Toyota Corolla Grande";
    carId = "c_corolla_grande";
    hotelRec = "Karimabad Serena Inn / Shigar Resort";
    hotelCostPerNight = 22000;
  } else {
    carRec = "Toyota Prado TX L";
    carId = "c_prado";
    hotelRec = "Shangrila Resort Skardu / Hunza Serena Golden Heights";
    hotelCostPerNight = 45000;
  }

  const hotelTotal = hotelCostPerNight * Number(days);
  const estTotalBudget = fuelCost + hotelTotal + (Number(days) * 6000); // including food/tickets

  // Itinerary planner generator
  const planItinerary = [
    { day: 1, title: `Travel to ${destination}`, description: `Journey from Islamabad. Estimated distance ${selectedDist}km. Refuel and check-in to ${hotelRec}.` },
    { day: 2, title: "Local Exploration & Sightseeing", description: "Visit the major tourist spots, sample local specialties, and take photographs in premium scenery." }
  ];

  if (Number(days) > 2) {
    planItinerary.push({ day: 3, title: "Adventure & Cultural Activities", description: "Engage in local activities: boat safari, trekking or visiting historical forts/valleys." });
  }
  if (Number(days) > 3) {
    planItinerary.push({ day: 4, title: "Scenic Retreat & Relaxation", description: "Leisure day to explore cold deserts, waterfalls or pine forests at your own pace." });
  }
  planItinerary.push({ day: Number(days), title: "Return to Islamabad", description: "Drive back with souvenir shopping and safe pickup checkouts." });

  res.json({
    recommendedCar: carRec,
    carId: carId,
    suggestedHotels: hotelRec,
    estimatedFuelCost: fuelCost,
    tourItinerary: planItinerary,
    totalEstimatedBudget: estTotalBudget,
  });
};

// Flight Tracker simulation
const trackFlight = async (req, res) => {
  const { flightNumber } = req.body;
  if (!flightNumber) {
    return res.status(400).json({ message: "Flight number is required." });
  }

  // Pre-configured drivers
  const driverData = {
    driverName: "Zahid Mahmood",
    driverPhone: "+92 334 1122334",
    driverPhoto: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=150&auto=format&fit=crop",
    vehicleName: "Toyota Corolla Grande 2022",
    vehiclePhoto: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=300&auto=format&fit=crop",
    driverVehicleNo: "LE-482-ICT",
    livePickupStatus: "Driver En-Route to Islamabad Airport",
    estimatedArrivalMins: 35,
    flightTracked: flightNumber.toUpperCase(),
  };

  res.json(driverData);
};

// ================= ADMIN CONTROLLERS =================

const getAdminStats = async (req, res) => {
  try {
    const isMock = getDBState().useMock;
    let usersCount, bookingsCount, pendingInquiriesCount, pendingVerificationsCount, totalRevenue = 0;
    
    let activeDrivers = 12;
    let availableCars = 8;

    if (isMock) {
      const users = MOCK_DB.Users.find({});
      usersCount = users.length;

      const bookings = MOCK_DB.Bookings.find({});
      bookingsCount = bookings.length;

      // Pending verifications (users with pending status)
      pendingVerificationsCount = users.filter(u => u.verificationStatus === "pending").length;

      // Pending bookings / inquiries
      pendingInquiriesCount = bookings.filter(b => b.timelineStatus === "Inquiry Sent").length;

      // Calculate revenue
      bookings.forEach(b => {
        if (b.timelineStatus === "Booking Confirmed" || b.timelineStatus === "Enjoy Your Trip" || b.timelineStatus === "Completed") {
          totalRevenue += b.totalPrice;
        }
      });
    } else {
      usersCount = await User.countDocuments({});
      bookingsCount = await Booking.countDocuments({});
      pendingVerificationsCount = await User.countDocuments({ verificationStatus: "pending" });
      pendingInquiriesCount = await Booking.countDocuments({ timelineStatus: "Inquiry Sent" });

      const confirmedBookings = await Booking.find({
        timelineStatus: { $in: ["Booking Confirmed", "Enjoy Your Trip", "Completed"] }
      });
      confirmedBookings.forEach(b => {
        totalRevenue += b.totalPrice;
      });
    }

    res.json({
      totalUsers: usersCount,
      totalBookings: bookingsCount,
      pendingInquiries: pendingInquiriesCount,
      pendingVerifications: pendingVerificationsCount,
      revenue: totalRevenue,
      activeDrivers,
      availableCars,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load dashboard statistics." });
  }
};

const getAdminBookings = async (req, res) => {
  try {
    const isMock = getDBState().useMock;
    let bookings;
    if (isMock) {
      bookings = MOCK_DB.Bookings.find({});
    } else {
      bookings = await Booking.find({}).populate("user", "name email phone");
    }
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings list." });
  }
};

const updateBookingStatus = async (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body;
  try {
    const isMock = getDBState().useMock;
    let updated;
    if (isMock) {
      updated = MOCK_DB.Bookings.findByIdAndUpdate(bookingId, { timelineStatus: status });
    } else {
      updated = await Booking.findByIdAndUpdate(
        bookingId,
        { timelineStatus: status },
        { new: true }
      );
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update booking timeline status." });
  }
};

const getAdminInquiries = async (req, res) => {
  try {
    const isMock = getDBState().useMock;
    let inquiries;
    if (isMock) {
      inquiries = MOCK_DB.Messages.find({});
    } else {
      inquiries = await Message.find({});
    }
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch callback inquiries." });
  }
};

const getAdminVerifications = async (req, res) => {
  try {
    const isMock = getDBState().useMock;
    let pendingUsers;
    if (isMock) {
      pendingUsers = MOCK_DB.Users.find({ verificationStatus: "pending" });
    } else {
      pendingUsers = await User.find({ verificationStatus: "pending" }).select("name email phone cnic passport verificationStatus");
    }
    res.json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pending user verifications." });
  }
};

const verifyUserStatus = async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body; // 'verified' or 'rejected'
  try {
    const isMock = getDBState().useMock;
    let updated;
    if (isMock) {
      updated = MOCK_DB.Users.findByIdAndUpdate(userId, { verificationStatus: status });
    } else {
      updated = await User.findByIdAndUpdate(
        userId,
        { verificationStatus: status },
        { new: true }
      ).select("-password");
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to complete identity verification action." });
  }
};

// ================= ADMIN & MANAGER CAR CRUD =================

const createCar = async (req, res) => {
  const { name, model, category, pricePerDay, images, transmission, fuelEconomy, capacity, features, driverIncluded, luxuryBadge } = req.body;
  try {
    const isMock = getDBState().useMock;
    const carData = {
      name,
      model,
      category,
      pricePerDay: Number(pricePerDay),
      images: images || [],
      transmission: transmission || "Automatic",
      fuelEconomy: fuelEconomy || "12 km/L",
      capacity: Number(capacity),
      features: features || [],
      isAvailable: true,
      driverIncluded: driverIncluded !== undefined ? driverIncluded : true,
      luxuryBadge: luxuryBadge !== undefined ? luxuryBadge : false
    };

    let newCar;
    if (isMock) {
      newCar = MOCK_DB.Vehicles.create(carData);
    } else {
      newCar = await Vehicle.create(carData);
    }
    res.status(201).json(newCar);
  } catch (error) {
    res.status(500).json({ message: "Failed to create vehicle: " + error.message });
  }
};

const updateCar = async (req, res) => {
  const { carId } = req.params;
  const { name, model, category, pricePerDay, images, transmission, fuelEconomy, capacity, features, isAvailable, driverIncluded, luxuryBadge } = req.body;
  try {
    const isMock = getDBState().useMock;
    const carData = {
      name,
      model,
      category,
      pricePerDay: Number(pricePerDay),
      images: images || [],
      transmission: transmission || "Automatic",
      fuelEconomy: fuelEconomy || "12 km/L",
      capacity: Number(capacity),
      features: features || [],
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      driverIncluded: driverIncluded !== undefined ? driverIncluded : true,
      luxuryBadge: luxuryBadge !== undefined ? luxuryBadge : false
    };

    let updatedCar;
    if (isMock) {
      updatedCar = MOCK_DB.Vehicles.findByIdAndUpdate(carId, carData);
    } else {
      updatedCar = await Vehicle.findByIdAndUpdate(carId, carData, { new: true });
    }
    res.json(updatedCar);
  } catch (error) {
    res.status(500).json({ message: "Failed to update vehicle: " + error.message });
  }
};

const deleteCar = async (req, res) => {
  const { carId } = req.params;
  try {
    const isMock = getDBState().useMock;
    if (isMock) {
      MOCK_DB.Vehicles.findByIdAndDelete(carId);
    } else {
      await Vehicle.findByIdAndDelete(carId);
    }
    res.json({ message: "Vehicle deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete vehicle: " + error.message });
  }
};

// ================= ADMIN & MANAGER TOUR CRUD =================

const createTour = async (req, res) => {
  const { name, days, price, image, category, description, highlights, itinerary, bestTime, activities, weatherInfo, packingChecklist } = req.body;
  try {
    const isMock = getDBState().useMock;
    const tourData = {
      name,
      days,
      price: Number(price),
      image,
      category: category || "Adventure",
      description,
      highlights: highlights || [],
      itinerary: itinerary || [],
      bestTime: bestTime || "May to October",
      activities: activities || [],
      weatherInfo: weatherInfo || "",
      packingChecklist: packingChecklist || []
    };

    let newTour;
    if (isMock) {
      newTour = MOCK_DB.Tours.create(tourData);
    } else {
      newTour = await Tour.create(tourData);
    }
    res.status(201).json(newTour);
  } catch (error) {
    res.status(500).json({ message: "Failed to create tour package: " + error.message });
  }
};

const updateTour = async (req, res) => {
  const { tourId } = req.params;
  const { name, days, price, image, category, description, highlights, itinerary, bestTime, activities, weatherInfo, packingChecklist } = req.body;
  try {
    const isMock = getDBState().useMock;
    const tourData = {
      name,
      days,
      price: Number(price),
      image,
      category: category || "Adventure",
      description,
      highlights: highlights || [],
      itinerary: itinerary || [],
      bestTime: bestTime || "May to October",
      activities: activities || [],
      weatherInfo: weatherInfo || "",
      packingChecklist: packingChecklist || []
    };

    let updatedTour;
    if (isMock) {
      updatedTour = MOCK_DB.Tours.findByIdAndUpdate(tourId, tourData);
    } else {
      updatedTour = await Tour.findByIdAndUpdate(tourId, tourData, { new: true });
    }
    res.json(updatedTour);
  } catch (error) {
    res.status(500).json({ message: "Failed to update tour package: " + error.message });
  }
};

const deleteTour = async (req, res) => {
  const { tourId } = req.params;
  try {
    const isMock = getDBState().useMock;
    if (isMock) {
      MOCK_DB.Tours.findByIdAndDelete(tourId);
    } else {
      await Tour.findByIdAndDelete(tourId);
    }
    res.json({ message: "Tour package deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete tour package: " + error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  verifyIdentity,
  getCars,
  bookCar,
  getTours,
  bookTour,
  requestCallback,
  planTrip,
  trackFlight,
  getAdminStats,
  getAdminBookings,
  updateBookingStatus,
  getAdminInquiries,
  getAdminVerifications,
  verifyUserStatus,
  createCar,
  updateCar,
  deleteCar,
  createTour,
  updateTour,
  deleteTour,
};

```

## File: [server/data/bookings.json](file:///C:/Users/hp/Desktop/Khan Tourism/server/data/bookings.json)

```json
[
  {
    "_id": "b_01",
    "user": "u_test",
    "type": "Car",
    "itemName": "Toyota Corolla Grande",
    "startDate": "2026-07-10",
    "endDate": "2026-07-15",
    "totalDays": 5,
    "totalPrice": 75000,
    "timelineStatus": "Booking Confirmed",
    "details": {
      "peopleCount": 4,
      "driverName": "Karamat Shah",
      "driverPhone": "0301-7654321",
      "driverPhoto": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
      "driverVehicleNo": "ICT-LE-392"
    },
    "createdAt": "2026-06-28T20:56:56.604Z"
  },
  {
    "_id": "b_02",
    "user": "u_test",
    "type": "Tour",
    "itemName": "Hunza Valley Autumn Luxury Tour",
    "startDate": "2026-09-12",
    "totalDays": 5,
    "totalPrice": 95000,
    "timelineStatus": "Quotation Sent",
    "details": {
      "peopleCount": 2
    },
    "createdAt": "2026-06-28T20:56:56.604Z"
  }
]
```

## File: [server/data/servicePricing.json](file:///C:/Users/hp/Desktop/Khan Tourism/server/data/servicePricing.json)

```json
{
  "airportPickupBase": 3500,
  "perKmRate": 45,
  "nightSurcharge": 1500,
  "waitingChargePerHour": 800,
  "fuelPricePerLiter": 275,
  "driverDailyAllowance": 2500,
  "taxPercentage": 5,
  "cancelationFeePercentage": 15,
  "peakSeasonMultiplier": 1.3,
  "groupDiscountPercentage": 10,
  "loyaltyDiscountPercentage": 5,
  "updatedAt": "2026-06-29T00:00:00.000Z",
  "updatedBy": "admin@khantourism.com"
}

```

## File: [server/data/tours.json](file:///C:/Users/hp/Desktop/Khan Tourism/server/data/tours.json)

```json
[
  {
    "_id": "t_hunza",
    "name": "Hunza Valley Autumn Luxury Tour",
    "days": "5 Days / 4 Nights",
    "price": 95000,
    "image": "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1000&auto=format&fit=crop",
    "category": "Adventure",
    "description": "Experience the mesmerizing autumn colors of Hunza Valley. This premium tour package includes guided road travel in Prado SUVs, top-tier accommodations, dynamic local meals, and sightseeing entry passes.",
    "highlights": [
      "Attabad Lake Boating",
      "Altit & Baltit Fort tours",
      "Passu Cones Sightseeing",
      "Khunjerab Pass (China Border)"
    ],
    "itinerary": [
      {
        "day": 1,
        "title": "Departure from Islamabad",
        "description": "Drive to Chilas/Naran via Hazara Motorway. Stay in Serena hotel or equivalent."
      },
      {
        "day": 2,
        "title": "Journey to Karimabad (Hunza)",
        "description": "Pass by meeting place of 3 mountain ranges. Check-in to Hunza hotel and explore local bazaar."
      },
      {
        "day": 3,
        "title": "Altit Fort & Attabad Lake",
        "description": "Visit the historical Altit & Baltit Forts. Boat ride on the pristine turquoise Attabad Lake."
      },
      {
        "day": 4,
        "title": "Passu Cones & China Border",
        "description": "Sightseeing of majestic Passu Cones. Drive to Khunjerab Pass (highest paved border crossing)."
      },
      {
        "day": 5,
        "title": "Return Voyage to Islamabad",
        "description": "Drive back to Islamabad with memories of beautiful valleys."
      }
    ],
    "bestTime": "September to November",
    "activities": [
      "Sightseeing",
      "Boating",
      "Photography",
      "Cultural Tours"
    ],
    "weatherInfo": "Average temperature: 8°C - 15°C in autumn. Nights are chilly.",
    "packingChecklist": [
      "Heavy jacket",
      "Gloves",
      "Thermal wear",
      "Hiking boots",
      "Sunglasses"
    ]
  },
  {
    "_id": "t_skardu",
    "name": "Skardu Majestic Peaks Tour",
    "days": "7 Days / 6 Nights",
    "price": 135000,
    "image": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop",
    "category": "Adventure",
    "description": "Explore the giant Karakoram peaks, cold deserts, and high-altitude lakes of Skardu. Best suited for families looking for raw beauty with luxury arrangements.",
    "highlights": [
      "Shangrila Resort visit",
      "Upper Kachura Lake boating",
      "Katpana Cold Desert Safari",
      "Deosai Plains expedition"
    ],
    "itinerary": [
      {
        "day": 1,
        "title": "Fly to Skardu or road travel",
        "description": "Arrive at Skardu, check-in to hotel and relax."
      },
      {
        "day": 2,
        "title": "Shangrila & Kachura Lakes",
        "description": "Explore the iconic Shangrila Resort. Hike up to Upper Kachura Lake."
      },
      {
        "day": 3,
        "title": "Shigar Valley Fort",
        "description": "Drive to Shigar. Visit Shigar Fort and enjoy local Balti cuisine."
      },
      {
        "day": 4,
        "title": "Deosai National Park",
        "description": "Day trip to the second highest plateau in the world, Deosai Plains. Spot Himalayan bears."
      },
      {
        "day": 5,
        "title": "Katpana Sand Dunes",
        "description": "Visit the unique cold desert dunes at Katpana. Enjoy desert quad biking."
      },
      {
        "day": 6,
        "title": "Manthoka Waterfall",
        "description": "Drive to Manthoka and enjoy a local picnic lunch."
      },
      {
        "day": 7,
        "title": "Departure",
        "description": "Flight back or road departure to Islamabad."
      }
    ],
    "bestTime": "June to September",
    "activities": [
      "Jeep Safari",
      "Trekking",
      "Camping",
      "Lakeside Boating"
    ],
    "weatherInfo": "Sunny days (20°C) with cold winds. Very pleasant summers.",
    "packingChecklist": [
      "Windcheater jacket",
      "Hiking poles",
      "Sunblock cream",
      "Light woolens"
    ]
  },
  {
    "_id": "t_swat",
    "name": "Swat Valley & Kalam Family Retreat",
    "days": "4 Days / 3 Nights",
    "price": 65000,
    "image": "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1000&auto=format&fit=crop",
    "category": "Family",
    "description": "The Switzerland of East, Swat, offers lush green meadows, gushing rivers, and pine forests. This budget-friendly family tour covers all top sightseeing sites.",
    "highlights": [
      "Malam Jabba Ski Resort",
      "Fizagat Park riverfront",
      "Kalam Forest walk",
      "Ushu Forest safari"
    ],
    "itinerary": [
      {
        "day": 1,
        "title": "Drive to Mingora (Swat)",
        "description": "Travel via Swat Motorway. Check-in to hotel. Riverside evening walk."
      },
      {
        "day": 2,
        "title": "Malam Jabba Day Tour",
        "description": "Enjoy chairlift rides, ziplines, and winter skiing (seasonal) at Malam Jabba."
      },
      {
        "day": 3,
        "title": "Kalam Forest Expedition",
        "description": "Drive to Kalam. Visit the ancient Ushu pine forest and Mahodand Lake."
      },
      {
        "day": 4,
        "title": "Return Drive",
        "description": "Explore local handicrafts bazaar and drive back to Islamabad."
      }
    ],
    "bestTime": "April to October",
    "activities": [
      "Chairlift",
      "Zipline",
      "River rafting",
      "Meadow walks"
    ],
    "weatherInfo": "Temperate summers around 24°C. Very pleasant weather.",
    "packingChecklist": [
      "Light jacket",
      "Comfortable sneakers",
      "Umbrella",
      "Personal medicine kit"
    ]
  }
]
```

## File: [server/data/users.json](file:///C:/Users/hp/Desktop/Khan Tourism/server/data/users.json)

```json
[
  {
    "_id": "u_admin",
    "name": "Abdullah Khan",
    "email": "admin@khantourism.com",
    "password": "$2b$10$pZpFQ8dBSqYL9ClAF7P2gewioLgQM63JhdQ705qvfXdPL813FIQUa",
    "role": "admin",
    "phone": "0336-5004848",
    "verificationStatus": "verified",
    "savedTours": [],
    "savedCars": [],
    "createdAt": "2026-06-28T20:56:56.598Z"
  },
  {
    "_id": "u_test",
    "name": "Rana Nouman",
    "email": "user@gmail.com",
    "password": "$2b$10$pZpFQ8dBSqYL9ClAF7P2getZ8e7fbFFd102QzHXFA.9EcGC7t7VJq",
    "role": "user",
    "phone": "0311-5353751",
    "verificationStatus": "verified",
    "savedTours": [],
    "savedCars": [],
    "createdAt": "2026-06-28T20:56:56.599Z"
  }
]
```

## File: [server/data/vehicles.json](file:///C:/Users/hp/Desktop/Khan Tourism/server/data/vehicles.json)

```json
[
  {
    "_id": "c_corolla_gli",
    "name": "Toyota Corolla GLI",
    "model": "GLI 2015",
    "category": "Economy",
    "pricePerDay": 8000,
    "images": [
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600&auto=format&fit=crop"
    ],
    "transmission": "Automatic",
    "fuelEconomy": "12 km/L",
    "capacity": 4,
    "features": [
      "AC",
      "Airbags",
      "Bluetooth",
      "Comfort Seats"
    ],
    "isAvailable": true,
    "driverIncluded": true,
    "luxuryBadge": false
  },
  {
    "_id": "c_corolla_grande",
    "name": "Toyota Corolla Grande",
    "model": "Grande 2022",
    "category": "Sedan",
    "pricePerDay": 15000,
    "images": [
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=600&auto=format&fit=crop"
    ],
    "transmission": "Automatic",
    "fuelEconomy": "13 km/L",
    "capacity": 5,
    "features": [
      "AC",
      "Sunroof",
      "Leather Interior",
      "Cruise Control"
    ],
    "isAvailable": true,
    "driverIncluded": true,
    "luxuryBadge": false
  },
  {
    "_id": "c_prado",
    "name": "Toyota Prado TX L",
    "model": "Prado 2018",
    "category": "SUV",
    "pricePerDay": 35000,
    "images": [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600&auto=format&fit=crop"
    ],
    "transmission": "Automatic",
    "fuelEconomy": "8 km/L",
    "capacity": 7,
    "features": [
      "AC",
      "Panoramic Sunroof",
      "Heated Seats",
      "4x4 Drive Mode"
    ],
    "isAvailable": true,
    "driverIncluded": true,
    "luxuryBadge": true
  },
  {
    "_id": "c_hiace",
    "name": "Toyota Hiace Grand Cabin",
    "model": "Hiace 2020",
    "category": "Van",
    "pricePerDay": 22000,
    "images": [
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=600&auto=format&fit=crop"
    ],
    "transmission": "Manual",
    "fuelEconomy": "10 km/L",
    "capacity": 14,
    "features": [
      "AC",
      "High Roof",
      "Reclining Seats",
      "LED TV Screen"
    ],
    "isAvailable": true,
    "driverIncluded": true,
    "luxuryBadge": false
  }
]
```

## File: [server/middleware/auth.js](file:///C:/Users/hp/Desktop/Khan Tourism/server/middleware/auth.js)

```javascript
const jwt = require("jsonwebtoken");
const { getDBState } = require("../config/db");
const MOCK_DB = require("../utils/mockDB");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "khan_secret_jwt_key_2026");

    let currentUser;
    if (getDBState().useMock) {
      currentUser = MOCK_DB.Users.findById(decoded.id);
    } else {
      currentUser = await User.findById(decoded.id).select("-password");
    }

    if (!currentUser) {
      return res.status(404).json({ message: "User session expired or not found." });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token invalid or expired." });
  }
};

// Full admin access — can do everything
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
};

// Manager access — can manage prices, view customers, but cannot delete users or change roles
const manager = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "manager")) {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Manager or Admin role required." });
  }
};

// Admin-only actions (delete users, change roles, system config)
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. This action requires full Admin privileges." });
  }
};

module.exports = { protect, admin, manager, adminOnly };

```

## File: [server/models/Booking.js](file:///C:/Users/hp/Desktop/Khan Tourism/server/models/Booking.js)

```javascript
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

```

## File: [server/models/Message.js](file:///C:/Users/hp/Desktop/Khan Tourism/server/models/Message.js)

```javascript
const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    default: "Callback Request",
  },
  type: {
    type: String,
    enum: ["callback", "contact"],
    default: "contact",
  },
  status: {
    type: String,
    enum: ["pending", "resolved"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Message", MessageSchema);

```

## File: [server/models/Tour.js](file:///C:/Users/hp/Desktop/Khan Tourism/server/models/Tour.js)

```javascript
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

```

## File: [server/models/User.js](file:///C:/Users/hp/Desktop/Khan Tourism/server/models/User.js)

```javascript
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  phone: {
    type: String,
    default: "",
  },
  avatar: {
    type: String,
    default: "",
  },
  cnic: {
    type: String,
    default: "", // CNIC details for verification
  },
  passport: {
    type: String,
    default: "", // Passport details for verification
  },
  verificationStatus: {
    type: String,
    enum: ["none", "pending", "verified", "rejected"],
    default: "none",
  },
  savedTours: [{
    type: String, // Tour IDs/Names
  }],
  savedCars: [{
    type: String, // Car IDs/Names
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hashing
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Password verification
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);

```

## File: [server/models/Vehicle.js](file:///C:/Users/hp/Desktop/Khan Tourism/server/models/Vehicle.js)

```javascript
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

```

## File: [server/package.json](file:///C:/Users/hp/Desktop/Khan Tourism/server/package.json)

```json
{
  "name": "server",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node seed.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "mongoose": "^9.6.2",
    "multer": "^2.1.1",
    "nodemon": "^3.1.14",
    "react-icons": "^5.6.0",
    "react-router-dom": "^7.15.1"
  }
}

```

## File: [server/routes/apiRoutes.js](file:///C:/Users/hp/Desktop/Khan Tourism/server/routes/apiRoutes.js)

```javascript
const express = require("express");
const router = express.Router();
const { protect, admin, manager } = require("../middleware/auth");
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  verifyIdentity,
  getCars,
  bookCar,
  getTours,
  bookTour,
  requestCallback,
  planTrip,
  trackFlight,
  getAdminStats,
  getAdminBookings,
  updateBookingStatus,
  getAdminInquiries,
  getAdminVerifications,
  verifyUserStatus,
  createCar,
  updateCar,
  deleteCar,
  createTour,
  updateTour,
  deleteTour,
} = require("../controllers/apiController");

// Auth paths
router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);
router.get("/auth/me", protect, getMe);
router.put("/auth/profile", protect, updateProfile);
router.post("/auth/verify", protect, verifyIdentity);

// Vehicle paths
router.get("/cars", getCars);
router.post("/cars/book", protect, bookCar);

// Tour paths
router.get("/tours", getTours);
router.post("/tours/book", protect, bookTour);

// Callback and planners paths
router.post("/inquiries/callback", requestCallback);
router.post("/inquiries/planner", planTrip);
router.post("/airport/track", trackFlight);

// Admin dashboard paths
router.get("/admin/stats", protect, admin, getAdminStats);
router.get("/admin/bookings", protect, admin, getAdminBookings);
router.put("/admin/bookings/:bookingId", protect, admin, updateBookingStatus);
router.get("/admin/inquiries", protect, admin, getAdminInquiries);
router.get("/admin/verifications", protect, admin, getAdminVerifications);
router.put("/admin/verifications/:userId", protect, admin, verifyUserStatus);

// Admin & Manager Management CRUD paths (accessible to manager role as well)
router.post("/admin/cars", protect, manager, createCar);
router.put("/admin/cars/:carId", protect, manager, updateCar);
router.delete("/admin/cars/:carId", protect, manager, deleteCar);

router.post("/admin/tours", protect, manager, createTour);
router.put("/admin/tours/:tourId", protect, manager, updateTour);
router.delete("/admin/tours/:tourId", protect, manager, deleteTour);

module.exports = router;

```

## File: [server/seed.js](file:///C:/Users/hp/Desktop/Khan Tourism/server/seed.js)

```javascript
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Vehicle = require("./models/Vehicle");
const Tour = require("./models/Tour");
const Booking = require("./models/Booking");
const Message = require("./models/Message");

const seedDatabase = async () => {
  const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/khan-tourism";
  
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existings
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Tour.deleteMany({});
    await Booking.deleteMany({});
    await Message.deleteMany({});

    console.log("Existing collections cleared.");

    // 1. Seed Users
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash("admin123", salt);
    const hashUserPassword = await bcrypt.hash("user123", salt);

    const adminUser = await User.create({
      name: "Abdullah Khan",
      email: "admin@khantourism.com",
      password: hashPassword,
      role: "admin",
      phone: "0336-5004848",
      verificationStatus: "verified",
    });

    const standardUser = await User.create({
      name: "Rana Nouman",
      email: "user@gmail.com",
      password: hashUserPassword,
      role: "user",
      phone: "0311-5353751",
      verificationStatus: "verified",
    });

    console.log("Users seeded successfully.");

    // 2. Seed Vehicles
    const vehiclesData = [
      {
        name: "Toyota Corolla GLI",
        model: "GLI 2015",
        category: "Economy",
        pricePerDay: 8000,
        images: ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600&auto=format&fit=crop"],
        transmission: "Automatic",
        fuelEconomy: "12 km/L",
        capacity: 4,
        features: ["AC", "Airbags", "Bluetooth", "Comfort Seats"],
        isAvailable: true,
        driverIncluded: true,
        luxuryBadge: false
      },
      {
        name: "Toyota Corolla Grande",
        model: "Grande 2022",
        category: "Sedan",
        pricePerDay: 15000,
        images: ["https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=600&auto=format&fit=crop"],
        transmission: "Automatic",
        fuelEconomy: "13 km/L",
        capacity: 5,
        features: ["AC", "Sunroof", "Leather Interior", "Cruise Control"],
        isAvailable: true,
        driverIncluded: true,
        luxuryBadge: false
      },
      {
        name: "Toyota Prado TX L",
        model: "Prado 2018",
        category: "SUV",
        pricePerDay: 35000,
        images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600&auto=format&fit=crop"],
        transmission: "Automatic",
        fuelEconomy: "8 km/L",
        capacity: 7,
        features: ["AC", "Panoramic Sunroof", "Heated Seats", "4x4 Drive Mode"],
        isAvailable: true,
        driverIncluded: true,
        luxuryBadge: true
      },
      {
        name: "Toyota Hiace Grand Cabin",
        model: "Hiace 2020",
        category: "Van",
        pricePerDay: 22000,
        images: ["https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=600&auto=format&fit=crop"],
        transmission: "Manual",
        fuelEconomy: "10 km/L",
        capacity: 14,
        features: ["AC", "High Roof", "Reclining Seats", "LED TV Screen"],
        isAvailable: true,
        driverIncluded: true,
        luxuryBadge: false
      }
    ];

    await Vehicle.insertMany(vehiclesData);
    console.log("Vehicles seeded successfully.");

    // 3. Seed Tours
    const toursData = [
      {
        name: "Hunza Valley Autumn Luxury Tour",
        days: "5 Days / 4 Nights",
        price: 95000,
        image: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1000&auto=format&fit=crop",
        category: "Adventure",
        description: "Experience the mesmerizing autumn colors of Hunza Valley. This premium tour package includes guided road travel in Prado SUVs, top-tier accommodations, dynamic local meals, and sightseeing entry passes.",
        highlights: ["Attabad Lake Boating", "Altit & Baltit Fort tours", "Passu Cones Sightseeing", "Khunjerab Pass (China Border)"],
        itinerary: [
          { day: 1, title: "Departure from Islamabad", description: "Drive to Chilas/Naran via Hazara Motorway. Stay in Serena hotel or equivalent." },
          { day: 2, title: "Journey to Karimabad (Hunza)", description: "Pass by meeting place of 3 mountain ranges. Check-in to Hunza hotel and explore local bazaar." },
          { day: 3, title: "Altit Fort & Attabad Lake", description: "Visit the historical Altit & Baltit Forts. Boat ride on the pristine turquoise Attabad Lake." },
          { day: 4, title: "Passu Cones & China Border", description: "Sightseeing of majestic Passu Cones. Drive to Khunjerab Pass (highest paved border crossing)." },
          { day: 5, title: "Return Voyage to Islamabad", description: "Drive back to Islamabad with memories of beautiful valleys." }
        ],
        bestTime: "September to November",
        activities: ["Sightseeing", "Boating", "Photography", "Cultural Tours"],
        weatherInfo: "Average temperature: 8°C - 15°C in autumn. Nights are chilly.",
        packingChecklist: ["Heavy jacket", "Gloves", "Thermal wear", "Hiking boots", "Sunglasses"]
      },
      {
        name: "Skardu Majestic Peaks Tour",
        days: "7 Days / 6 Nights",
        price: 135000,
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop",
        category: "Adventure",
        description: "Explore the giant Karakoram peaks, cold deserts, and high-altitude lakes of Skardu. Best suited for families looking for raw beauty with luxury arrangements.",
        highlights: ["Shangrila Resort visit", "Upper Kachura Lake boating", "Katpana Cold Desert Safari", "Deosai Plains expedition"],
        itinerary: [
          { day: 1, title: "Fly to Skardu or road travel", description: "Arrive at Skardu, check-in to hotel and relax." },
          { day: 2, title: "Shangrila & Kachura Lakes", description: "Explore the iconic Shangrila Resort. Hike up to Upper Kachura Lake." },
          { day: 3, title: "Shigar Valley Fort", description: "Drive to Shigar. Visit Shigar Fort and enjoy local Balti cuisine." },
          { day: 4, title: "Deosai National Park", description: "Day trip to the second highest plateau in the world, Deosai Plains. Spot Himalayan bears." },
          { day: 5, title: "Katpana Sand Dunes", description: "Visit the unique cold desert dunes at Katpana. Enjoy desert quad biking." },
          { day: 6, title: "Manthoka Waterfall", description: "Drive to Manthoka and enjoy a local picnic lunch." },
          { day: 7, title: "Departure", description: "Flight back or road departure to Islamabad." }
        ],
        bestTime: "June to September",
        activities: ["Jeep Safari", "Trekking", "Camping", "Lakeside Boating"],
        weatherInfo: "Sunny days (20°C) with cold winds. Very pleasant summers.",
        packingChecklist: ["Windcheater jacket", "Hiking poles", "Sunblock cream", "Light woolens"]
      },
      {
        name: "Swat Valley & Kalam Family Retreat",
        days: "4 Days / 3 Nights",
        price: 65000,
        image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1000&auto=format&fit=crop",
        category: "Family",
        description: "The Switzerland of East, Swat, offers lush green meadows, gushing rivers, and pine forests. This budget-friendly family tour covers all top sightseeing sites.",
        highlights: ["Malam Jabba Ski Resort", "Fizagat Park riverfront", "Kalam Forest walk", "Ushu Forest safari"],
        itinerary: [
          { day: 1, title: "Drive to Mingora (Swat)", description: "Travel via Swat Motorway. Check-in to hotel. Riverside evening walk." },
          { day: 2, title: "Malam Jabba Day Tour", description: "Enjoy chairlift rides, ziplines, and winter skiing (seasonal) at Malam Jabba." },
          { day: 3, title: "Kalam Forest Expedition", description: "Drive to Kalam. Visit the ancient Ushu pine forest and Mahodand Lake." },
          { day: 4, title: "Return Drive", description: "Explore local handicrafts bazaar and drive back to Islamabad." }
        ],
        bestTime: "April to October",
        activities: ["Chairlift", "Zipline", "River rafting", "Meadow walks"],
        weatherInfo: "Temperate summers around 24°C. Very pleasant weather.",
        packingChecklist: ["Light jacket", "Comfortable sneakers", "Umbrella", "Personal medicine kit"]
      }
    ];

    await Tour.insertMany(toursData);
    console.log("Tours seeded successfully.");

    // 4. Seed Bookings linked to test user
    const bookingsData = [
      {
        user: standardUser._id,
        type: "Car",
        itemName: "Toyota Corolla Grande",
        startDate: "2026-07-10",
        endDate: "2026-07-15",
        totalDays: 5,
        totalPrice: 75000,
        timelineStatus: "Booking Confirmed",
        details: {
          peopleCount: 4,
          driverName: "Karamat Shah",
          driverPhone: "0301-7654321",
          driverPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
          driverVehicleNo: "ICT-LE-392"
        }
      },
      {
        user: standardUser._id,
        type: "Tour",
        itemName: "Hunza Valley Autumn Luxury Tour",
        startDate: "2026-09-12",
        totalDays: 5,
        totalPrice: 95000,
        timelineStatus: "Quotation Sent",
        details: {
          peopleCount: 2
        }
      }
    ];

    await Booking.insertMany(bookingsData);
    console.log("Bookings seeded successfully.");

    console.log("🎉 Database fully seeded!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database: ", error);
    process.exit(1);
  }
};

seedDatabase();

```

## File: [server/server.js](file:///C:/Users/hp/Desktop/Khan Tourism/server/server.js)

```javascript
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

```

## File: [server/utils/mockDB.js](file:///C:/Users/hp/Desktop/Khan Tourism/server/utils/mockDB.js)

```javascript
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const DATA_DIR = path.join(__dirname, "../data");

// Utility to read/write JSON files
const readJSON = (filename) => {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    return [];
  }
};

const writeJSON = (filename, data) => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
};

// Seed defaults
const seedDefaults = () => {
  // 1. Users Seed
  let users = readJSON("users.json");
  if (users.length === 0) {
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync("admin123", salt);
    const hashUserPassword = bcrypt.hashSync("user123", salt);
    
    users = [
      {
        _id: "u_admin",
        name: "Abdullah Khan",
        email: "admin@khantourism.com",
        password: hashPassword,
        role: "admin",
        phone: "0336-5004848",
        verificationStatus: "verified",
        savedTours: [],
        savedCars: [],
        createdAt: new Date().toISOString()
      },
      {
        _id: "u_test",
        name: "Rana Nouman",
        email: "user@gmail.com",
        password: hashUserPassword,
        role: "user",
        phone: "0311-5353751",
        verificationStatus: "verified",
        savedTours: [],
        savedCars: [],
        createdAt: new Date().toISOString()
      }
    ];
    writeJSON("users.json", users);
  }

  // 2. Vehicles Seed
  let vehicles = readJSON("vehicles.json");
  if (vehicles.length === 0) {
    vehicles = [
      {
        _id: "c_corolla_gli",
        name: "Toyota Corolla GLI",
        model: "GLI 2015",
        category: "Economy",
        pricePerDay: 8000,
        images: ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600&auto=format&fit=crop"],
        transmission: "Automatic",
        fuelEconomy: "12 km/L",
        capacity: 4,
        features: ["AC", "Airbags", "Bluetooth", "Comfort Seats"],
        isAvailable: true,
        driverIncluded: true,
        luxuryBadge: false
      },
      {
        _id: "c_corolla_grande",
        name: "Toyota Corolla Grande",
        model: "Grande 2022",
        category: "Sedan",
        pricePerDay: 15000,
        images: ["https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=600&auto=format&fit=crop"],
        transmission: "Automatic",
        fuelEconomy: "13 km/L",
        capacity: 5,
        features: ["AC", "Sunroof", "Leather Interior", "Cruise Control"],
        isAvailable: true,
        driverIncluded: true,
        luxuryBadge: false
      },
      {
        _id: "c_prado",
        name: "Toyota Prado TX L",
        model: "Prado 2018",
        category: "SUV",
        pricePerDay: 35000,
        images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600&auto=format&fit=crop"],
        transmission: "Automatic",
        fuelEconomy: "8 km/L",
        capacity: 7,
        features: ["AC", "Panoramic Sunroof", "Heated Seats", "4x4 Drive Mode"],
        isAvailable: true,
        driverIncluded: true,
        luxuryBadge: true
      },
      {
        _id: "c_hiace",
        name: "Toyota Hiace Grand Cabin",
        model: "Hiace 2020",
        category: "Van",
        pricePerDay: 22000,
        images: ["https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=600&auto=format&fit=crop"],
        transmission: "Manual",
        fuelEconomy: "10 km/L",
        capacity: 14,
        features: ["AC", "High Roof", "Reclining Seats", "LED TV Screen"],
        isAvailable: true,
        driverIncluded: true,
        luxuryBadge: false
      }
    ];
    writeJSON("vehicles.json", vehicles);
  }

  // 3. Tours Seed
  let tours = readJSON("tours.json");
  if (tours.length === 0) {
    tours = [
      {
        _id: "t_hunza",
        name: "Hunza Valley Autumn Luxury Tour",
        days: "5 Days / 4 Nights",
        price: 95000,
        image: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1000&auto=format&fit=crop",
        category: "Adventure",
        description: "Experience the mesmerizing autumn colors of Hunza Valley. This premium tour package includes guided road travel in Prado SUVs, top-tier accommodations, dynamic local meals, and sightseeing entry passes.",
        highlights: ["Attabad Lake Boating", "Altit & Baltit Fort tours", "Passu Cones Sightseeing", "Khunjerab Pass (China Border)"],
        itinerary: [
          { day: 1, title: "Departure from Islamabad", description: "Drive to Chilas/Naran via Hazara Motorway. Stay in Serena hotel or equivalent." },
          { day: 2, title: "Journey to Karimabad (Hunza)", description: "Pass by meeting place of 3 mountain ranges. Check-in to Hunza hotel and explore local bazaar." },
          { day: 3, title: "Altit Fort & Attabad Lake", description: "Visit the historical Altit & Baltit Forts. Boat ride on the pristine turquoise Attabad Lake." },
          { day: 4, title: "Passu Cones & China Border", description: "Sightseeing of majestic Passu Cones. Drive to Khunjerab Pass (highest paved border crossing)." },
          { day: 5, title: "Return Voyage to Islamabad", description: "Drive back to Islamabad with memories of beautiful valleys." }
        ],
        bestTime: "September to November",
        activities: ["Sightseeing", "Boating", "Photography", "Cultural Tours"],
        weatherInfo: "Average temperature: 8°C - 15°C in autumn. Nights are chilly.",
        packingChecklist: ["Heavy jacket", "Gloves", "Thermal wear", "Hiking boots", "Sunglasses"]
      },
      {
        _id: "t_skardu",
        name: "Skardu Majestic Peaks Tour",
        days: "7 Days / 6 Nights",
        price: 135000,
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop",
        category: "Adventure",
        description: "Explore the giant Karakoram peaks, cold deserts, and high-altitude lakes of Skardu. Best suited for families looking for raw beauty with luxury arrangements.",
        highlights: ["Shangrila Resort visit", "Upper Kachura Lake boating", "Katpana Cold Desert Safari", "Deosai Plains expedition"],
        itinerary: [
          { day: 1, title: "Fly to Skardu or road travel", description: "Arrive at Skardu, check-in to hotel and relax." },
          { day: 2, title: "Shangrila & Kachura Lakes", description: "Explore the iconic Shangrila Resort. Hike up to Upper Kachura Lake." },
          { day: 3, title: "Shigar Valley Fort", description: "Drive to Shigar. Visit Shigar Fort and enjoy local Balti cuisine." },
          { day: 4, title: "Deosai National Park", description: "Day trip to the second highest plateau in the world, Deosai Plains. Spot Himalayan bears." },
          { day: 5, title: "Katpana Sand Dunes", description: "Visit the unique cold desert dunes at Katpana. Enjoy desert quad biking." },
          { day: 6, title: "Manthoka Waterfall", description: "Drive to Manthoka and enjoy a local picnic lunch." },
          { day: 7, title: "Departure", description: "Flight back or road departure to Islamabad." }
        ],
        bestTime: "June to September",
        activities: ["Jeep Safari", "Trekking", "Camping", "Lakeside Boating"],
        weatherInfo: "Sunny days (20°C) with cold winds. Very pleasant summers.",
        packingChecklist: ["Windcheater jacket", "Hiking poles", "Sunblock cream", "Light woolens"]
      },
      {
        _id: "t_swat",
        name: "Swat Valley & Kalam Family Retreat",
        days: "4 Days / 3 Nights",
        price: 65000,
        image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1000&auto=format&fit=crop",
        category: "Family",
        description: "The Switzerland of East, Swat, offers lush green meadows, gushing rivers, and pine forests. This budget-friendly family tour covers all top sightseeing sites.",
        highlights: ["Malam Jabba Ski Resort", "Fizagat Park riverfront", "Kalam Forest walk", "Ushu Forest safari"],
        itinerary: [
          { day: 1, title: "Drive to Mingora (Swat)", description: "Travel via Swat Motorway. Check-in to hotel. Riverside evening walk." },
          { day: 2, title: "Malam Jabba Day Tour", description: "Enjoy chairlift rides, ziplines, and winter skiing (seasonal) at Malam Jabba." },
          { day: 3, title: "Kalam Forest Expedition", description: "Drive to Kalam. Visit the ancient Ushu pine forest and Mahodand Lake." },
          { day: 4, title: "Return Drive", description: "Explore local handicrafts bazaar and drive back to Islamabad." }
        ],
        bestTime: "April to October",
        activities: ["Chairlift", "Zipline", "River rafting", "Meadow walks"],
        weatherInfo: "Temperate summers around 24°C. Very pleasant weather.",
        packingChecklist: ["Light jacket", "Comfortable sneakers", "Umbrella", "Personal medicine kit"]
      }
    ];
    writeJSON("tours.json", tours);
  }

  // 4. Bookings Seed
  let bookings = readJSON("bookings.json");
  if (bookings.length === 0) {
    bookings = [
      {
        _id: "b_01",
        user: "u_test",
        type: "Car",
        itemName: "Toyota Corolla Grande",
        startDate: "2026-07-10",
        endDate: "2026-07-15",
        totalDays: 5,
        totalPrice: 75000,
        timelineStatus: "Booking Confirmed",
        details: {
          peopleCount: 4,
          driverName: "Karamat Shah",
          driverPhone: "0301-7654321",
          driverPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
          driverVehicleNo: "ICT-LE-392"
        },
        createdAt: new Date().toISOString()
      },
      {
        _id: "b_02",
        user: "u_test",
        type: "Tour",
        itemName: "Hunza Valley Autumn Luxury Tour",
        startDate: "2026-09-12",
        totalDays: 5,
        totalPrice: 95000,
        timelineStatus: "Quotation Sent",
        details: {
          peopleCount: 2
        },
        createdAt: new Date().toISOString()
      }
    ];
    writeJSON("bookings.json", bookings);
  }
};

// Initialize DB files
seedDefaults();

// Mock Mongoose-like Methods
const MockModel = (filename) => {
  return {
    find: (filter = {}) => {
      const list = readJSON(filename);
      return list.filter((item) => {
        for (let key in filter) {
          if (filter[key] !== undefined && item[key] !== filter[key]) {
            // Support sub-properties array contains check
            if (Array.isArray(item[key]) && item[key].includes(filter[key])) {
              continue;
            }
            return false;
          }
        }
        return true;
      });
    },
    findOne: (filter = {}) => {
      const list = readJSON(filename);
      return list.find((item) => {
        for (let key in filter) {
          if (filter[key] !== undefined && item[key] !== filter[key]) {
            return false;
          }
        }
        return true;
      });
    },
    findById: (id) => {
      const list = readJSON(filename);
      return list.find((item) => item._id === id || item.id === id);
    },
    create: (data) => {
      const list = readJSON(filename);
      const newItem = {
        _id: data._id || `id_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        ...data,
        createdAt: data.createdAt || new Date().toISOString(),
      };
      list.push(newItem);
      writeJSON(filename, list);
      return newItem;
    },
    findByIdAndUpdate: (id, updateData, options = {}) => {
      const list = readJSON(filename);
      let updatedItem = null;
      const updatedList = list.map((item) => {
        if (item._id === id || item.id === id) {
          updatedItem = { ...item, ...updateData };
          return updatedItem;
        }
        return item;
      });
      writeJSON(filename, updatedList);
      return updatedItem;
    },
    findByIdAndDelete: (id) => {
      const list = readJSON(filename);
      const filtered = list.filter((item) => item._id !== id && item.id !== id);
      writeJSON(filename, filtered);
      return true;
    },
  };
};

module.exports = {
  Users: MockModel("users.json"),
  Vehicles: MockModel("vehicles.json"),
  Tours: MockModel("tours.json"),
  Bookings: MockModel("bookings.json"),
  Messages: MockModel("messages.json"),
  seedDefaults
};

```

## File: [src/App.css](file:///C:/Users/hp/Desktop/Khan Tourism/src/App.css)

```css
.counter {
  font-size: 16px;
  padding: 5px 10px;
  border-radius: 5px;
  color: var(--accent);
  background: var(--accent-bg);
  border: 2px solid transparent;
  transition: border-color 0.3s;
  margin-bottom: 24px;

  &:hover {
    border-color: var(--accent-border);
  }
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}

.hero {
  position: relative;

  .base,
  .framework,
  .vite {
    inset-inline: 0;
    margin: 0 auto;
  }

  .base {
    width: 170px;
    position: relative;
    z-index: 0;
  }

  .framework,
  .vite {
    position: absolute;
  }

  .framework {
    z-index: 1;
    top: 34px;
    height: 28px;
    transform: perspective(2000px) rotateZ(300deg) rotateX(44deg) rotateY(39deg)
      scale(1.4);
  }

  .vite {
    z-index: 0;
    top: 107px;
    height: 26px;
    width: auto;
    transform: perspective(2000px) rotateZ(300deg) rotateX(40deg) rotateY(39deg)
      scale(0.8);
  }
}

#center {
  display: flex;
  flex-direction: column;
  gap: 25px;
  place-content: center;
  place-items: center;
  flex-grow: 1;

  @media (max-width: 1024px) {
    padding: 32px 20px 24px;
    gap: 18px;
  }
}

#next-steps {
  display: flex;
  border-top: 1px solid var(--border);
  text-align: left;

  & > div {
    flex: 1 1 0;
    padding: 32px;
    @media (max-width: 1024px) {
      padding: 24px 20px;
    }
  }

  .icon {
    margin-bottom: 16px;
    width: 22px;
    height: 22px;
  }

  @media (max-width: 1024px) {
    flex-direction: column;
    text-align: center;
  }
}

#docs {
  border-right: 1px solid var(--border);

  @media (max-width: 1024px) {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}

#next-steps ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 8px;
  margin: 32px 0 0;

  .logo {
    height: 18px;
  }

  a {
    color: var(--text-h);
    font-size: 16px;
    border-radius: 6px;
    background: var(--social-bg);
    display: flex;
    padding: 6px 12px;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    transition: box-shadow 0.3s;

    &:hover {
      box-shadow: var(--shadow);
    }
    .button-icon {
      height: 18px;
      width: 18px;
    }
  }

  @media (max-width: 1024px) {
    margin-top: 20px;
    flex-wrap: wrap;
    justify-content: center;

    li {
      flex: 1 1 calc(50% - 8px);
    }

    a {
      width: 100%;
      justify-content: center;
      box-sizing: border-box;
    }
  }
}

#spacer {
  height: 88px;
  border-top: 1px solid var(--border);
  @media (max-width: 1024px) {
    height: 48px;
  }
}

.ticks {
  position: relative;
  width: 100%;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: -4.5px;
    border: 5px solid transparent;
  }

  &::before {
    left: 0;
    border-left-color: var(--border);
  }
  &::after {
    right: 0;
    border-right-color: var(--border);
  }
}

```

## File: [src/App.jsx](file:///C:/Users/hp/Desktop/Khan Tourism/src/App.jsx)

```javascript
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import Home from "./pages/Home";
import Cars from "./pages/Cars";
import Tours from "./pages/Tours";
import Planner from "./pages/Planner";
import Airport from "./pages/Airport";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/airport" element={<Airport />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

```

## File: [src/components/BudgetCars.jsx](file:///C:/Users/hp/Desktop/Khan Tourism/src/components/BudgetCars.jsx)

```javascript
function BudgetCars() {
  return (
    <section
      style={{
        padding: "100px 60px",
        background: "white",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontSize: "45px",
          marginBottom: "60px",
        }}
      >
        Budget Based Car Recommendations
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
          gap: "30px",
        }}
      >
        <div style={carCard}>
          <h3>Low Budget</h3>
          <p>Corolla</p>
          <p>Suzuki</p>
        </div>

        <div style={carCard}>
          <h3>Medium Budget</h3>
          <p>Civic</p>
          <p>BRV</p>
        </div>

        <div style={carCard}>
          <h3>Luxury</h3>
          <p>Prado</p>
          <p>Land Cruiser</p>
        </div>

        <div style={carCard}>
          <h3>Family / Group</h3>
          <p>Hiace</p>
          <p>Coaster</p>
        </div>
      </div>
    </section>
  );
}

const carCard = {
  background: "#0f172a",
  color: "white",
  padding: "35px",
  borderRadius: "20px",
};

export default BudgetCars;
```

## File: [src/components/Consultation.jsx](file:///C:/Users/hp/Desktop/Khan Tourism/src/components/Consultation.jsx)

```javascript
function Consultation() {
  return (
    <section
      style={{
        padding: "100px 60px",
        background: "#f8fafc",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontSize: "45px",
          marginBottom: "60px",
        }}
      >
        How Our System Works
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
          gap: "30px",
        }}
      >
        <div style={cardStyle}>
          <h3>1. Contact Admin</h3>
          <p>
            User first contacts admin and explains travel needs.
          </p>
        </div>

        <div style={cardStyle}>
          <h3>2. Travel Guidance</h3>
          <p>
            Admin suggests best travel plan according to budget.
          </p>
        </div>

        <div style={cardStyle}>
          <h3>3. Car Recommendation</h3>
          <p>
            Economy, luxury and family cars suggested according to needs.
          </p>
        </div>

        <div style={cardStyle}>
          <h3>4. Booking Confirmation</h3>
          <p>
            Driver, guide and pickup plan finalized after approval.
          </p>
        </div>
      </div>
    </section>
  );
}

const cardStyle = {
  background: "white",
  padding: "35px",
  borderRadius: "20px",
  boxShadow: "0px 10px 30px rgba(0,0,0,0.08)",
};

export default Consultation;
```

## File: [src/components/Footer.jsx](file:///C:/Users/hp/Desktop/Khan Tourism/src/components/Footer.jsx)

```javascript
function Footer() {
  return (
    <footer
      style={{
        background: "#0f172a",
        color: "white",
        padding: "40px",
        textAlign: "center",
      }}
    >
      <h2>KHAN TOURISM & GUIDE</h2>

      <p style={{ marginTop: "15px" }}>
        Professional Tourism & Guided Travel Services
      </p>

      <p style={{ marginTop: "10px" }}>
        © 2026 All Rights Reserved
      </p>
    </footer>
  );
}

export default Footer;
```

## File: [src/components/Hero.jsx](file:///C:/Users/hp/Desktop/Khan Tourism/src/components/Hero.jsx)

```javascript
function Hero() {
  return (
    <section
      style={{
        height: "100vh",
        background:
          "linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1974&auto=format&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        textAlign: "center",
        color: "white",
        padding: "20px",
      }}
    >
      <h1
        style={{
          fontSize: "75px",
          fontWeight: "800",
          marginBottom: "20px",
        }}
      >
        KHAN TOURISM & GUIDE
      </h1>

      <p
        style={{
          fontSize: "24px",
          maxWidth: "850px",
          lineHeight: "1.7",
        }}
      >
        Personalized Tourism, Luxury Travel,
        Airport Pickup & Guided Tours Across Pakistan
      </p>

      <button
        onClick={() =>
          window.open(
            "https://wa.me/923001234567?text=Hello I want travel guidance",
            "_blank"
          )
        }
        style={{
          marginTop: "35px",
          padding: "16px 40px",
          borderRadius: "50px",
          border: "none",
          background: "#22c55e",
          color: "white",
          fontSize: "18px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Contact Admin
      </button>
    </section>
  );
}

export default Hero;
```

## File: [src/components/Layout.jsx](file:///C:/Users/hp/Desktop/Khan Tourism/src/components/Layout.jsx)

```javascript
import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  FaSun,
  FaMoon,
  FaWhatsapp,
  FaPhone,
  FaChevronUp,
  FaTimes,
  FaBars,
  FaExchangeAlt,
  FaUser,
  FaCompass,
  FaCar,
  FaPlane,
  FaHome,
  FaWrench,
  FaTasks,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEnvelope,
} from "react-icons/fa";

export default function Layout({ children }) {
  const {
    theme,
    toggleTheme,
    user,
    logout,
    toasts,
    removeToast,
    compareCars,
    clearCompareCars,
    compareTours,
    clearCompareTours,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showCallPopup, setShowCallPopup] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareType, setCompareType] = useState("cars"); // 'cars' or 'tours'
  const navigate = useNavigate();

  // Scroll listener for Back to Top & Navbar effect
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const getActiveStyle = ({ isActive }) => ({
    color: isActive ? "var(--secondary)" : "var(--text)",
    fontWeight: isActive ? "700" : "500",
    borderBottom: isActive ? "2px solid var(--secondary)" : "2px solid transparent",
  });

  const getMobileActiveStyle = ({ isActive }) => ({
    background: isActive ? "rgba(34, 197, 94, 0.15)" : "transparent",
    color: isActive ? "var(--secondary)" : "var(--text)",
    fontWeight: isActive ? "700" : "500",
  });

  const handleOpenCompare = (type) => {
    setCompareType(type);
    setShowCompareModal(true);
  };

  // Callback simulation
  const [callbackName, setCallbackName] = useState("");
  const [callbackPhone, setCallbackPhone] = useState("");
  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const { addToast } = useApp();

  const handleRequestCallback = (e) => {
    e.preventDefault();
    if (!callbackName || !callbackPhone) {
      addToast("Please fill in all fields.", "warning");
      return;
    }
    // Simulate sending inquiry to Express backend
    fetch("/api/inquiries/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: callbackName, phone: callbackPhone }),
    })
      .then((res) => res.json())
      .then((data) => {
        addToast("Callback requested! We will call you within 15 minutes.", "success");
        setShowCallbackModal(false);
        setCallbackName("");
        setCallbackPhone("");
      })
      .catch((err) => {
        // Fallback if server is not active
        addToast("Callback requested successfully (Offline mode).", "success");
        setShowCallbackModal(false);
        setCallbackName("");
        setCallbackPhone("");
      });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Dynamic Header */}
      <header
        className="glass"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 999,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px 5%",
          height: "75px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontFamily: "var(--heading)",
              fontSize: "24px",
              fontWeight: "800",
              letterSpacing: "1px",
              background: "linear-gradient(135deg, #22C55E 0%, #F59E0B 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            KHAN TOURISM
          </span>
        </Link>

        {/* Desktop Navbar */}
        <nav
          style={{
            display: "none",
            gap: "24px",
            alignItems: "center",
          }}
          className="desktop-nav"
        >
          <NavLink to="/" style={getActiveStyle} className="nav-link-item">Home</NavLink>
          <NavLink to="/cars" style={getActiveStyle} className="nav-link-item">Cars</NavLink>
          <NavLink to="/tours" style={getActiveStyle} className="nav-link-item">Tours</NavLink>
          <NavLink to="/planner" style={getActiveStyle} className="nav-link-item">Planner</NavLink>
          <NavLink to="/airport" style={getActiveStyle} className="nav-link-item">Airport Pickup</NavLink>
          <NavLink to="/contact" style={getActiveStyle} className="nav-link-item">Contact</NavLink>
        </nav>

        {/* Action buttons (Right) */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text)",
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
              padding: "5px",
            }}
            title="Toggle light/dark mode"
          >
            {theme === "dark" ? <FaSun style={{ color: "var(--accent)" }} /> : <FaMoon />}
          </button>

          {/* User profile portal link */}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }} className="header-profile">
              <Link to="/profile" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "var(--secondary)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    overflow: "hidden",
                    border: "2px solid var(--border)",
                  }}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text)" }} className="desktop-nav-profile-name">
                  {user.name.split(" ")[0]}
                </span>
              </Link>
              {(user.role === "admin" || user.role === "manager") && (
                <Link
                  to="/admin"
                  style={{
                    padding: "6px 12px",
                    fontSize: "12px",
                    borderRadius: "20px",
                    background: "rgba(245, 158, 11, 0.15)",
                    color: "var(--accent)",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <FaWrench size={10} /> Admin
                </Link>
              )}
              <button
                onClick={logout}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
                className="desktop-nav"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/profile"
              className="btn btn-primary"
              style={{ padding: "8px 18px", borderRadius: "30px", fontSize: "14px" }}
            >
              <FaUser size={12} /> Sign In
            </Link>
          )}

          {/* Hamburger button for mobile */}
          <button
            onClick={toggleMobileMenu}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text)",
              fontSize: "22px",
              display: "none",
            }}
            className="mobile-hamburger"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            top: "75px",
            left: 0,
            width: "100%",
            height: "calc(100vh - 75px)",
            backgroundColor: "var(--bg-card)",
            zIndex: 998,
            padding: "30px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
            animation: "fadeIn 0.3s ease",
          }}
        >
          <NavLink to="/" style={getMobileActiveStyle} onClick={toggleMobileMenu} className="mobile-nav-link">
            <FaHome style={{ marginRight: "10px" }} /> Home
          </NavLink>
          <NavLink to="/cars" style={getMobileActiveStyle} onClick={toggleMobileMenu} className="mobile-nav-link">
            <FaCar style={{ marginRight: "10px" }} /> Cars
          </NavLink>
          <NavLink to="/tours" style={getMobileActiveStyle} onClick={toggleMobileMenu} className="mobile-nav-link">
            <FaCompass style={{ marginRight: "10px" }} /> Tours
          </NavLink>
          <NavLink to="/planner" style={getMobileActiveStyle} onClick={toggleMobileMenu} className="mobile-nav-link">
            <FaTasks style={{ marginRight: "10px" }} /> Travel Planner
          </NavLink>
          <NavLink to="/airport" style={getMobileActiveStyle} onClick={toggleMobileMenu} className="mobile-nav-link">
            <FaPlane style={{ marginRight: "10px" }} /> Airport Pickup
          </NavLink>
          <NavLink to="/contact" style={getMobileActiveStyle} onClick={toggleMobileMenu} className="mobile-nav-link">
            <FaEnvelope style={{ marginRight: "10px" }} /> Contact
          </NavLink>
          {user && (user.role === "admin" || user.role === "manager") && (
            <NavLink to="/admin" style={getMobileActiveStyle} onClick={toggleMobileMenu} className="mobile-nav-link">
              <FaWrench style={{ marginRight: "10px" }} /> Admin Dashboard
            </NavLink>
          )}
          {user && (
            <button
              onClick={() => {
                logout();
                toggleMobileMenu();
              }}
              style={{
                alignSelf: "flex-start",
                background: "none",
                border: "none",
                color: "#EF4444",
                fontWeight: "700",
                padding: "10px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              Sign Out
            </button>
          )}
        </div>
      )}

      {/* Main Body Content */}
      <main style={{ flex: 1 }}>{children}</main>

      {/* Professional Footer */}
      <footer
        style={{
          backgroundColor: "var(--primary)",
          color: "var(--white)",
          padding: "60px 5% 30px 5%",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          fontSize: "14px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "40px",
            marginBottom: "40px",
          }}
        >
          <div>
            <h3 style={{ color: "var(--white)", marginBottom: "20px", fontSize: "20px", fontWeight: "800" }}>
              KHAN TOURISM
            </h3>
            <p style={{ color: "var(--text-muted)", lineHeight: "1.7", marginBottom: "20px" }}>
              Premium customized tours, luxury rent-a-car fleet, and expert guides offering seamless experiences across Skardu, Hunza, Swat, Murree, and other beautiful destinations of Pakistan.
            </p>
          </div>

          <div>
            <h4 style={{ color: "var(--white)", marginBottom: "20px", fontWeight: "600" }}>Quick Links</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link to="/tours" style={{ color: "var(--text-muted)" }} className="footer-link">Featured Tour Packages</Link>
              <Link to="/cars" style={{ color: "var(--text-muted)" }} className="footer-link">Luxury Vehicles Fleet</Link>
              <Link to="/planner" style={{ color: "var(--text-muted)" }} className="footer-link">AI Custom Trip Planner</Link>
              <Link to="/airport" style={{ color: "var(--text-muted)" }} className="footer-link">Airport Pickup Service</Link>
              <Link to="/contact" style={{ color: "var(--text-muted)" }} className="footer-link">Contact & Consultations</Link>
            </div>
          </div>

          <div>
            <h4 style={{ color: "var(--white)", marginBottom: "20px", fontWeight: "600" }}>Contact Admins</h4>
            <p style={{ color: "var(--white)", fontWeight: "600", marginBottom: "5px" }}>Abdullah Khan (CEO)</p>
            <p style={{ color: "var(--text-muted)", marginBottom: "15px" }}>📞 +92 336 5004848</p>
            <p style={{ color: "var(--white)", fontWeight: "600", marginBottom: "5px" }}>Waleed Ahmed (Manager)</p>
            <p style={{ color: "var(--text-muted)", marginBottom: "15px" }}>📞 +92 311 5353751</p>
          </div>

          <div>
            <h4 style={{ color: "var(--white)", marginBottom: "20px", fontWeight: "600" }}>Newsletter</h4>
            <p style={{ color: "var(--text-muted)", marginBottom: "15px" }}>
              Subscribe to receive updates on special seasonal packages and tour deals.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addToast("Thank you for subscribing to our newsletter!", "success");
                e.target.reset();
              }}
              style={{ display: "flex", gap: "10px" }}
            >
              <input
                type="email"
                placeholder="Your email address"
                required
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  color: "white",
                  outline: "none",
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: "10px 16px" }}>
                Send
              </button>
            </form>
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.05)", margin: "30px 0" }} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "20px",
            color: "var(--text-muted)",
          }}
        >
          <p>© 2026 Khan Tourism & Guide Pakistan. Licensed Travel Agency & Govt Registered Co.</p>
          <div style={{ display: "flex", gap: "20px" }}>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="footer-link">Facebook</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="footer-link">Instagram</a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="footer-link">Twitter</a>
          </div>
        </div>
      </footer>

      {/* Floating Action Buttons Speed Dial */}
      <div
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          zIndex: 99,
        }}
      >
        {/* Scroll To Top */}
        {showScrollTop && (
          <button
            onClick={handleScrollTop}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "var(--primary)",
              color: "white",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "var(--shadow)",
              transition: "0.3s",
            }}
            title="Scroll to Top"
          >
            <FaChevronUp />
          </button>
        )}

        {/* Callback request button */}
        <button
          onClick={() => setShowCallbackModal(true)}
          style={{
            height: "48px",
            padding: "0 18px",
            borderRadius: "30px",
            backgroundColor: "var(--accent)",
            color: "var(--primary)",
            fontWeight: "700",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "var(--shadow)",
            transition: "0.3s",
            gap: "8px",
            fontSize: "13px",
          }}
        >
          <FaPhone size={12} /> Call Me
        </button>

        {/* Live Call Selector */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowCallPopup(!showCallPopup)}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "#2563EB",
              color: "white",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "var(--shadow)",
              fontSize: "18px",
            }}
            title="Call Support"
          >
            <FaPhone />
          </button>

          {showCallPopup && (
            <div
              className="card glass"
              style={{
                position: "absolute",
                bottom: "60px",
                right: 0,
                width: "250px",
                padding: "15px",
                zIndex: 100,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <h5 style={{ margin: 0, fontSize: "14px", color: "var(--text)" }}>Select Representative</h5>
              <hr style={{ border: "none", borderTop: "1px solid var(--border)" }} />
              <a
                href="tel:03365004848"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "8px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(0,0,0,0.03)",
                  fontSize: "13px",
                }}
                onClick={() => setShowCallPopup(false)}
              >
                <strong>Abdullah Khan</strong>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>CEO — 0336-5004848</span>
              </a>
              <a
                href="tel:03115353751"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "8px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(0,0,0,0.03)",
                  fontSize: "13px",
                }}
                onClick={() => setShowCallPopup(false)}
              >
                <strong>Waleed Ahmed</strong>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Manager — 0311-5353751</span>
              </a>
            </div>
          )}
        </div>

        {/* WhatsApp Direct Chat */}
        <a
          href="https://wa.me/923365004848?text=Hello%20Khan%20Tourism,%20I'm%20interested%20in%20booking%20a%20trip/car."
          target="_blank"
          rel="noreferrer"
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "#22C55E",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(34, 197, 94, 0.4)",
            fontSize: "22px",
            animation: "pulse-glow 2s infinite",
          }}
          title="Chat with Expert"
        >
          <FaWhatsapp />
        </a>
      </div>

      {/* Floating Comparison Drawer Indicator */}
      {(compareCars.length > 0 || compareTours.length > 0) && (
        <div
          className="glass animate-fade-in"
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "12px 24px",
            borderRadius: "50px",
            boxShadow: "var(--shadow-lg)",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            zIndex: 98,
          }}
        >
          {compareCars.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600" }}>
                🚗 {compareCars.length} Car{compareCars.length > 1 ? "s" : ""} selected
              </span>
              <button
                className="btn btn-primary"
                style={{ padding: "6px 12px", borderRadius: "20px", fontSize: "11px" }}
                onClick={() => handleOpenCompare("cars")}
              >
                Compare
              </button>
              <button
                style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", fontSize: "12px" }}
                onClick={clearCompareCars}
              >
                Clear
              </button>
            </div>
          )}
          {compareCars.length > 0 && compareTours.length > 0 && (
            <div style={{ height: "20px", borderLeft: "1px solid var(--border)" }}></div>
          )}
          {compareTours.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600" }}>
                🗺️ {compareTours.length} Tour{compareTours.length > 1 ? "s" : ""} selected
              </span>
              <button
                className="btn btn-accent"
                style={{ padding: "6px 12px", borderRadius: "20px", fontSize: "11px" }}
                onClick={() => handleOpenCompare("tours")}
              >
                Compare
              </button>
              <button
                style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", fontSize: "12px" }}
                onClick={clearCompareTours}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* Comparison Modal Overlay */}
      {showCompareModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(5px)",
            zIndex: 1001,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setShowCompareModal(false)}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "850px",
              backgroundColor: "var(--bg-card)",
              borderRadius: "20px",
              padding: "25px",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCompareModal(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
                color: "var(--text)",
              }}
            >
              <FaTimes />
            </button>
            <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <FaExchangeAlt /> Compare {compareType === "cars" ? "Vehicles" : "Tour Packages"}
            </h3>

            {compareType === "cars" ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }} className="compare-table">
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border)" }}>
                      <th style={{ padding: "12px" }}>Specifications</th>
                      {compareCars.map((car, idx) => (
                        <th key={idx} style={{ padding: "12px", color: "var(--secondary)" }}>{car.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px", fontWeight: "600" }}>Daily Rate</td>
                      {compareCars.map((car, idx) => (
                        <td key={idx} style={{ padding: "12px" }}>Rs. {car.pricePerDay} / day</td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px", fontWeight: "600" }}>Category</td>
                      {compareCars.map((car, idx) => (
                        <td key={idx} style={{ padding: "12px" }}>{car.category || car.model}</td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px", fontWeight: "600" }}>Fuel Economy</td>
                      {compareCars.map((car, idx) => (
                        <td key={idx} style={{ padding: "12px" }}>{car.fuelEconomy || "10-14 km/L"}</td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px", fontWeight: "600" }}>Capacity</td>
                      {compareCars.map((car, idx) => (
                        <td key={idx} style={{ padding: "12px" }}>{car.capacity || "4-5 Persons"}</td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px", fontWeight: "600" }}>Gear</td>
                      {compareCars.map((car, idx) => (
                        <td key={idx} style={{ padding: "12px" }}>{car.transmission || "Automatic"}</td>
                      ))}
                    </tr>
                    <tr>
                      <td style={{ padding: "12px" }}></td>
                      {compareCars.map((car, idx) => (
                        <td key={idx} style={{ padding: "12px" }}>
                          <button
                            className="btn btn-primary"
                            style={{ padding: "8px 14px", borderRadius: "10px", fontSize: "12px" }}
                            onClick={() => {
                              setShowCompareModal(false);
                              navigate("/cars");
                            }}
                          >
                            Book Now
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }} className="compare-table">
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border)" }}>
                      <th style={{ padding: "12px" }}>Features</th>
                      {compareTours.map((tour, idx) => (
                        <th key={idx} style={{ padding: "12px", color: "var(--accent)" }}>{tour.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px", fontWeight: "600" }}>Duration</td>
                      {compareTours.map((tour, idx) => (
                        <td key={idx} style={{ padding: "12px" }}>{tour.days || "3-7 Days"}</td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px", fontWeight: "600" }}>Best Season</td>
                      {compareTours.map((tour, idx) => (
                        <td key={idx} style={{ padding: "12px" }}>{tour.bestTime || "May - Oct"}</td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px", fontWeight: "600" }}>Included</td>
                      {compareTours.map((tour, idx) => (
                        <td key={idx} style={{ padding: "12px", fontSize: "12px" }}>
                          {tour.description || "Guided transport & accommodations"}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td style={{ padding: "12px" }}></td>
                      {compareTours.map((tour, idx) => (
                        <td key={idx} style={{ padding: "12px" }}>
                          <button
                            className="btn btn-accent"
                            style={{ padding: "8px 14px", borderRadius: "10px", fontSize: "12px" }}
                            onClick={() => {
                              setShowCompareModal(false);
                              navigate("/tours");
                            }}
                          >
                            Explore Package
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Callback request modal */}
      {showCallbackModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(5px)",
            zIndex: 1001,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setShowCallbackModal(false)}
        >
          <form
            onSubmit={handleRequestCallback}
            className="card"
            style={{
              width: "100%",
              maxWidth: "400px",
              backgroundColor: "var(--bg-card)",
              borderRadius: "20px",
              padding: "30px",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowCallbackModal(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
                color: "var(--text)",
              }}
            >
              <FaTimes />
            </button>
            <h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FaPhone /> Request Callback
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Submit your phone number, and a Khan Tourism expert will call you shortly to discuss your custom travel plan.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600" }}>Your Name</label>
              <input
                type="text"
                placeholder="Waseem Khan"
                value={callbackName}
                onChange={(e) => setCallbackName(e.target.value)}
                required
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--bg)",
                  color: "var(--text)",
                  outline: "none",
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600" }}>Phone Number</label>
              <input
                type="tel"
                placeholder="03001234567"
                value={callbackPhone}
                onChange={(e) => setCallbackPhone(e.target.value)}
                required
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--bg)",
                  color: "var(--text)",
                  outline: "none",
                }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: "10px" }}>
              Submit Request
            </button>
          </form>
        </div>
      )}

      {/* Stack-based Toast alerts overlay */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxWidth: "350px",
          width: "100%",
        }}
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isWarning = toast.type === "warning";
          const isError = toast.type === "error";

          let icon = <FaInfoCircle style={{ color: "#3B82F6" }} />;
          let accentColor = "#3B82F6";
          if (isSuccess) {
            icon = <FaCheckCircle style={{ color: "#10B981" }} />;
            accentColor = "#10B981";
          } else if (isWarning) {
            icon = <FaExclamationTriangle style={{ color: "#F59E0B" }} />;
            accentColor = "#F59E0B";
          } else if (isError) {
            icon = <FaTimes style={{ color: "#EF4444" }} />;
            accentColor = "#EF4444";
          }

          return (
            <div
              key={toast.id}
              className="glass"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "15px 20px",
                borderRadius: "12px",
                borderLeft: `4px solid ${accentColor}`,
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                animation: "fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              }}
            >
              {icon}
              <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--text)", flex: 1 }}>
                {toast.message}
              </span>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  fontSize: "12px",
                }}
              >
                <FaTimes />
              </button>
            </div>
          );
        })}
      </div>

      {/* Styled inline helper styles */}
      <style>{`
        .nav-link-item {
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 14px;
          text-decoration: none;
          transition: all 0.3s ease;
          border-bottom: 2px solid transparent;
        }
        .nav-link-item:hover {
          color: var(--secondary) !important;
        }
        .mobile-nav-link {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-radius: 12px;
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          transition: 0.2s;
        }
        .mobile-nav-link:hover {
          background: rgba(34, 197, 94, 0.08);
          color: var(--secondary);
        }
        .footer-link {
          transition: 0.2s;
          text-decoration: none;
        }
        .footer-link:hover {
          color: var(--secondary) !important;
          padding-left: 3px;
        }
        .compare-table th, .compare-table td {
          border-bottom: 1px solid var(--border);
          padding: 12px;
        }
        @media (min-width: 769px) {
          .desktop-nav {
            display: flex !important;
          }
        }
        @media (max-width: 768px) {
          .mobile-hamburger {
            display: block !important;
          }
          .desktop-nav-profile-name {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

```

## File: [src/components/Navbar.jsx](file:///C:/Users/hp/Desktop/Khan Tourism/src/components/Navbar.jsx)

```javascript
import { NavLink } from "react-router-dom";

function Navbar() {
  const baseStyle = {
    color: "white",
    textDecoration: "none",
    fontSize: "16px",
    padding: "6px 10px",
    borderRadius: "8px",
    transition: "0.3s",
  };

  const activeStyle = {
    background: "rgba(56, 189, 248, 0.2)",
    color: "#38bdf8",
    fontWeight: "bold",
  };

  return (
    <nav
      style={{
        background: "rgba(15, 23, 42, 0.9)",
        backdropFilter: "blur(10px)",
        padding: "18px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <h2 style={{ margin: 0, color: "white" }}>KHAN TOURISM</h2>

      <div style={{ display: "flex", gap: "15px" }}>
        {["/", "/cars", "/tours", "/contact"].map((path, i) => {
          const labels = ["Home", "Cars", "Tours", "Contact"];
          return (
            <NavLink
              key={i}
              to={path}
              style={({ isActive }) =>
                isActive
                  ? { ...baseStyle, ...activeStyle }
                  : baseStyle
              }
            >
              {labels[i]}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
```

## File: [src/components/Services.jsx](file:///C:/Users/hp/Desktop/Khan Tourism/src/components/Services.jsx)

```javascript

```

## File: [src/components/WhatsAppButton.jsx](file:///C:/Users/hp/Desktop/Khan Tourism/src/components/WhatsAppButton.jsx)

```javascript
function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/923001234567"
      target="_blank"
      style={{
        position: "fixed",
        bottom: "25px",
        right: "25px",
        background: "#22c55e",
        color: "white",
        padding: "18px 22px",
        borderRadius: "50%",
        fontSize: "24px",
        textDecoration: "none",
      }}
    >
      💬
    </a>
  );
}

export default WhatsAppButton;
```

## File: [src/context/AppContext.jsx](file:///C:/Users/hp/Desktop/Khan Tourism/src/context/AppContext.jsx)

```javascript
import React, { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // Dark/Light Mode state
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  // Authentication State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  // Comparison Buckets
  const [compareCars, setCompareCars] = useState([]);
  const [compareTours, setCompareTours] = useState([]);

  // Toast Notifications State
  const [toasts, setToasts] = useState([]);

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Auth Operations
  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userToken);
    addToast(`Welcome back, ${userData.name}!`, "success");
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    addToast("Logged out successfully.", "info");
  };

  const updateProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  // Compare Cars Operations (limit to 3 cars)
  const addToCompareCars = (car) => {
    setCompareCars((prev) => {
      if (prev.some((c) => c._id === car._id || c.name === car.name)) {
        addToast(`${car.name} is already in comparison list.`, "warning");
        return prev;
      }
      if (prev.length >= 3) {
        addToast("You can compare up to 3 cars at a time.", "warning");
        return prev;
      }
      addToast(`Added ${car.name} to comparison.`, "success");
      return [...prev, car];
    });
  };

  const removeFromCompareCars = (carId) => {
    setCompareCars((prev) => prev.filter((c) => c._id !== carId && c.name !== carId));
    addToast("Removed car from comparison.", "info");
  };

  const clearCompareCars = () => {
    setCompareCars([]);
  };

  // Compare Tours Operations (limit to 3 tours)
  const addToCompareTours = (tour) => {
    setCompareTours((prev) => {
      if (prev.some((t) => t._id === tour._id || t.name === tour.name)) {
        addToast(`${tour.name} is already in comparison list.`, "warning");
        return prev;
      }
      if (prev.length >= 3) {
        addToast("You can compare up to 3 packages at a time.", "warning");
        return prev;
      }
      addToast(`Added ${tour.name} to comparison.`, "success");
      return [...prev, tour];
    });
  };

  const removeFromCompareTours = (tourId) => {
    setCompareTours((prev) => prev.filter((t) => t._id !== tourId && t.name !== tourId));
    addToast("Removed tour from comparison.", "info");
  };

  const clearCompareTours = () => {
    setCompareTours([]);
  };

  // Toast Alerts Operations
  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        user,
        token,
        login,
        logout,
        updateProfile,
        compareCars,
        addToCompareCars,
        removeFromCompareCars,
        clearCompareCars,
        compareTours,
        addToCompareTours,
        removeFromCompareTours,
        clearCompareTours,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

```

## File: [src/index.css](file:///C:/Users/hp/Desktop/Khan Tourism/src/index.css)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700&display=swap');

:root {
  /* Premium Palette */
  --primary: #0F172A;
  --primary-light: #1E293B;
  --secondary: #22C55E;
  --accent: #F59E0B;
  
  --bg: #F8FAFC;
  --bg-card: #FFFFFF;
  --text: #1E293B;
  --text-muted: #64748B;
  --border: #E2E8F0;
  --white: #FFFFFF;
  
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.06), 0 4px 6px -4px rgba(15, 23, 42, 0.06);
  --shadow-lg: 0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1);
  --shadow-glow: 0 0 20px rgba(34, 197, 94, 0.2);
  
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.4);
  
  --sans: 'Poppins', sans-serif;
  --heading: 'Outfit', sans-serif;
  --body-font: 'Inter', sans-serif;

  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;

  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Dark Mode Variables */
.dark {
  --bg: #090D1A;
  --bg-card: #0F172A;
  --text: #F1F5F9;
  --text-muted: #94A3B8;
  --border: #1E293B;
  
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.5);
  --shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.45), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
  --shadow-glow: 0 0 20px rgba(34, 197, 94, 0.35);
  
  --glass-bg: rgba(15, 23, 42, 0.75);
  --glass-border: rgba(255, 255, 255, 0.06);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  font-family: var(--body-font);
  background-color: var(--bg);
  color: var(--text);
  overflow-x: hidden;
}

body {
  min-height: 100vh;
  line-height: 1.6;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 10px;
}
::-webkit-scrollbar-track {
  background: var(--bg);
}
::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 5px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--heading);
  color: var(--text);
  font-weight: 700;
  line-height: 1.25;
}

a {
  color: inherit;
  text-decoration: none;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

@keyframes pulse-glow {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  50% { transform: scale(1.05); box-shadow: 0 0 20px 6px rgba(34, 197, 94, 0.2); }
}

@keyframes typing {
  from { width: 0 }
  to { width: 100% }
}

@keyframes blink-caret {
  from, to { border-color: transparent }
  50% { border-color: var(--accent); }
}

/* Helper Classes */
.animate-fade-in {
  animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}

.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
}

.glass-dark {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.text-gradient {
  background: linear-gradient(135deg, var(--secondary) 0%, var(--accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 28px;
  font-family: var(--sans);
  font-weight: 600;
  font-size: 15px;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, var(--secondary) 0%, #16a34a 100%);
  color: var(--white);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(34, 197, 94, 0.45);
}

.btn-secondary {
  background: var(--primary);
  color: var(--white);
  box-shadow: var(--shadow-sm);
}

.btn-secondary:hover {
  background: var(--primary-light);
  transform: translateY(-2px);
}

.btn-accent {
  background: linear-gradient(135deg, var(--accent) 0%, #d97706 100%);
  color: var(--primary);
  font-weight: 700;
}

.btn-accent:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
}

.btn-outline:hover {
  background: var(--border);
  color: var(--text);
}

.card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

/* Custom layout resets */
#root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin: 0;
  max-width: 100%;
  border: none;
  text-align: left;
}

section {
  padding: 80px 5%;
}

@media (max-width: 768px) {
  section {
    padding: 50px 20px;
  }
}

```

## File: [src/main.jsx](file:///C:/Users/hp/Desktop/Khan Tourism/src/main.jsx)

```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
)

```

## File: [src/pages/AdminDashboard.jsx](file:///C:/Users/hp/Desktop/Khan Tourism/src/pages/AdminDashboard.jsx)

```javascript
import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import {
  FaWrench,
  FaUsers,
  FaBook,
  FaDollarSign,
  FaCar,
  FaCheckCircle,
  FaTimesCircle,
  FaEnvelope,
  FaLock,
  FaExchangeAlt,
  FaPlus,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

export default function AdminDashboard() {
  const { user, token, addToast } = useApp();
  const navigate = useNavigate();

  // Active dashboard view tab
  const [activeTab, setActiveTab] = useState("overview");

  // State data variables
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [cars, setCars] = useState([]);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal and form states
  const [showCarModal, setShowCarModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [carForm, setCarForm] = useState({
    name: "",
    model: "",
    category: "Sedan",
    pricePerDay: "",
    images: "",
    transmission: "Automatic",
    fuelEconomy: "12 km/L",
    capacity: 5,
    features: "",
    driverIncluded: true,
    luxuryBadge: false
  });

  const [showTourModal, setShowTourModal] = useState(false);
  const [editingTour, setEditingTour] = useState(null);
  const [tourForm, setTourForm] = useState({
    name: "",
    days: "",
    price: "",
    image: "",
    category: "Adventure",
    description: "",
    highlights: "",
    itineraryRaw: "",
    bestTime: "",
    activities: "",
    weatherInfo: "",
    packingChecklist: ""
  });

  // Load dashboard details from API
  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      addToast("Access Denied. Admins and Managers only.", "warning");
      navigate("/");
      return;
    }
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const authHeaders = { Authorization: `Bearer ${token}` };

      // 1. Stats
      const statsRes = await fetch("/api/admin/stats", { headers: authHeaders });
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. Bookings
      const bookingsRes = await fetch("/api/admin/bookings", { headers: authHeaders });
      const bookingsData = await bookingsRes.json();
      setBookings(bookingsData);

      // 3. Verifications
      const verificationsRes = await fetch("/api/admin/verifications", { headers: authHeaders });
      const verificationsData = await verificationsRes.json();
      setVerifications(verificationsData);

      // 4. Inquiries Messages
      const msgRes = await fetch("/api/admin/inquiries", { headers: authHeaders });
      const msgData = await msgRes.json();
      setMessages(msgData);

      // 5. Vehicles (Cars)
      const carsRes = await fetch("/api/cars");
      const carsData = await carsRes.json();
      setCars(carsData);

      // 6. Tours
      const toursRes = await fetch("/api/tours");
      const toursData = await toursRes.json();
      setTours(toursData);

      setLoading(false);
    } catch (error) {
      // Fallback mocks
      setTimeout(() => {
        setStats({
          totalUsers: 14,
          totalBookings: 8,
          pendingInquiries: 3,
          pendingVerifications: 2,
          revenue: 170000,
          activeDrivers: 12,
          availableCars: 8,
        });

        setBookings([
          {
            _id: "b_01",
            user: { name: "Rana Nouman", email: "user@gmail.com", phone: "0311-5353751" },
            type: "Car",
            itemName: "Toyota Corolla Grande",
            startDate: "2026-07-10",
            totalDays: 5,
            totalPrice: 75000,
            timelineStatus: "Booking Confirmed",
            createdAt: new Date().toISOString(),
          },
          {
            _id: "b_02",
            user: { name: "Ayesha Ahmed", email: "ayesha@gmail.com", phone: "0300-1122334" },
            type: "Tour",
            itemName: "Hunza Valley Autumn Luxury Tour",
            startDate: "2026-09-12",
            totalDays: 5,
            totalPrice: 95000,
            timelineStatus: "Inquiry Sent",
            createdAt: new Date().toISOString(),
          },
        ]);

        setVerifications([
          {
            _id: "u_verify_01",
            name: "Zain Ali",
            email: "zain@gmail.com",
            phone: "0302-8765432",
            cnic: "37405-9988776-3",
            passport: "AB88765",
            verificationStatus: "pending",
          },
        ]);

        setMessages([
          {
            _id: "m_01",
            name: "Imran Khan",
            phone: "0333-1234567",
            message: "Callback requested from expert contact FAB widget.",
            type: "callback",
            status: "pending",
            createdAt: new Date().toISOString(),
          },
        ]);

        setCars([
          {
            _id: "c_corolla_gli",
            name: "Toyota Corolla GLI",
            model: "GLI 2015",
            category: "Economy",
            pricePerDay: 8000,
            images: ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600"],
            transmission: "Automatic",
            fuelEconomy: "12 km/L",
            capacity: 4,
            features: ["AC", "Airbags"],
            driverIncluded: true,
            luxuryBadge: false
          },
          {
            _id: "c_corolla_grande",
            name: "Toyota Corolla Grande",
            model: "Grande 2022",
            category: "Sedan",
            pricePerDay: 15000,
            images: ["https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=600"],
            transmission: "Automatic",
            fuelEconomy: "13 km/L",
            capacity: 5,
            features: ["AC", "Sunroof"],
            driverIncluded: true,
            luxuryBadge: false
          },
          {
            _id: "c_prado",
            name: "Toyota Prado TX L",
            model: "Prado 2018",
            category: "SUV",
            pricePerDay: 35000,
            images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600"],
            transmission: "Automatic",
            fuelEconomy: "8 km/L",
            capacity: 7,
            features: ["AC", "4x4 Drive Mode"],
            driverIncluded: true,
            luxuryBadge: true
          }
        ]);

        setTours([
          {
            _id: "t_hunza",
            name: "Hunza Valley Autumn Luxury Tour",
            days: "5 Days / 4 Nights",
            price: 95000,
            image: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=600",
            category: "Adventure",
            description: "Experience the autumn colors in Hunza.",
            highlights: ["Attabad Lake", "Passu Cones"],
            itinerary: [
              { day: 1, title: "Islamabad to Naran", description: "Drive to Naran" }
            ],
            bestTime: "September to November"
          }
        ]);

        setLoading(false);
      }, 1000);
    }
  };

  // Trigger booking timeline update on backend
  const handleUpdateBookingStatus = (bookingId, status) => {
    fetch(`/api/admin/bookings/${bookingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    })
      .then((res) => res.json())
      .then(() => {
        addToast(`Booking status updated to "${status}"`, "success");
        loadDashboardData();
      })
      .catch(() => {
        // Mock fallback update
        setBookings(
          bookings.map((b) => (b._id === bookingId ? { ...b, timelineStatus: status } : b))
        );
        addToast("Booking status updated (Offline mock mode).", "success");
      });
  };

  // Trigger user verification approve/reject on backend
  const handleVerifyUser = (userId, status) => {
    fetch(`/api/admin/verifications/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    })
      .then((res) => res.json())
      .then(() => {
        addToast(`User CNIC/Passport marked as "${status}"`, "success");
        loadDashboardData();
      })
      .catch(() => {
        setVerifications(verifications.filter((v) => v._id !== userId));
        addToast(`Verification marked as ${status} (Offline mock mode).`, "success");
      });
  };

  // Handle open car modal for adding new vehicle
  const openCarAddModal = () => {
    setEditingCar(null);
    setCarForm({
      name: "",
      model: "",
      category: "Sedan",
      pricePerDay: "",
      images: "",
      transmission: "Automatic",
      fuelEconomy: "12 km/L",
      capacity: 5,
      features: "",
      driverIncluded: true,
      luxuryBadge: false
    });
    setShowCarModal(true);
  };

  // Handle open car modal for editing vehicle
  const openCarEditModal = (car) => {
    setEditingCar(car);
    setCarForm({
      name: car.name,
      model: car.model,
      category: car.category || "Sedan",
      pricePerDay: car.pricePerDay,
      images: car.images ? car.images.join(", ") : "",
      transmission: car.transmission || "Automatic",
      fuelEconomy: car.fuelEconomy || "12 km/L",
      capacity: car.capacity || 5,
      features: car.features ? car.features.join(", ") : "",
      driverIncluded: car.driverIncluded !== undefined ? car.driverIncluded : true,
      luxuryBadge: car.luxuryBadge !== undefined ? car.luxuryBadge : false
    });
    setShowCarModal(true);
  };

  // Submit car form
  const handleCarSubmit = (e) => {
    e.preventDefault();
    if (!carForm.name || !carForm.model || !carForm.pricePerDay) {
      addToast("Please fill in all required fields.", "warning");
      return;
    }

    const payload = {
      ...carForm,
      pricePerDay: Number(carForm.pricePerDay),
      capacity: Number(carForm.capacity),
      images: carForm.images ? carForm.images.split(",").map(img => img.trim()).filter(Boolean) : [],
      features: carForm.features ? carForm.features.split(",").map(f => f.trim()).filter(Boolean) : []
    };

    const method = editingCar ? "PUT" : "POST";
    const url = editingCar ? `/api/admin/cars/${editingCar._id}` : "/api/admin/cars";

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error("API Request Failed");
        return res.json();
      })
      .then(() => {
        addToast(editingCar ? "Vehicle updated successfully!" : "Vehicle created successfully!", "success");
        setShowCarModal(false);
        loadDashboardData();
      })
      .catch(() => {
        // Mock fallback update
        if (editingCar) {
          setCars(cars.map(c => c._id === editingCar._id ? { ...c, ...payload } : c));
        } else {
          setCars([...cars, { _id: `c_${Date.now()}`, ...payload }]);
        }
        addToast(editingCar ? "Vehicle updated (Mock Mode)" : "Vehicle created (Mock Mode)", "success");
        setShowCarModal(false);
      });
  };

  // Delete car
  const handleDeleteCar = (carId) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;

    fetch(`/api/admin/cars/${carId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("API Request Failed");
        return res.json();
      })
      .then(() => {
        addToast("Vehicle deleted successfully!", "success");
        loadDashboardData();
      })
      .catch(() => {
        setCars(cars.filter(c => c._id !== carId));
        addToast("Vehicle deleted (Mock Mode)", "success");
      });
  };

  // Open tour modal for adding new tour
  const openTourAddModal = () => {
    setEditingTour(null);
    setTourForm({
      name: "",
      days: "",
      price: "",
      image: "",
      category: "Adventure",
      description: "",
      highlights: "",
      itineraryRaw: "",
      bestTime: "May to October",
      activities: "",
      weatherInfo: "",
      packingChecklist: ""
    });
    setShowTourModal(true);
  };

  // Open tour modal for editing tour
  const openTourEditModal = (tour) => {
    setEditingTour(tour);
    
    // Map itinerary array to a readable string for text area
    let itineraryText = "";
    if (tour.itinerary && tour.itinerary.length > 0) {
      itineraryText = tour.itinerary.map(item => `Day ${item.day}: ${item.title} - ${item.description}`).join("\n");
    }

    setTourForm({
      name: tour.name,
      days: tour.days,
      price: tour.price,
      image: tour.image,
      category: tour.category || "Adventure",
      description: tour.description || "",
      highlights: tour.highlights ? tour.highlights.join(", ") : "",
      itineraryRaw: itineraryText,
      bestTime: tour.bestTime || "May to October",
      activities: tour.activities ? tour.activities.join(", ") : "",
      weatherInfo: tour.weatherInfo || "",
      packingChecklist: tour.packingChecklist ? tour.packingChecklist.join(", ") : ""
    });
    setShowTourModal(true);
  };

  // Submit tour form
  const handleTourSubmit = (e) => {
    e.preventDefault();
    if (!tourForm.name || !tourForm.days || !tourForm.price || !tourForm.image) {
      addToast("Please fill in all required fields.", "warning");
      return;
    }

    // Parse itinerary from text area
    let itineraryList = [];
    if (tourForm.itineraryRaw) {
      const lines = tourForm.itineraryRaw.split("\n").filter(line => line.trim());
      itineraryList = lines.map((line, index) => {
        // Try parsing lines of format: "Day X: Title - Description"
        const dayMatch = line.match(/Day\s+(\d+):/i);
        const day = dayMatch ? Number(dayMatch[1]) : (index + 1);
        
        let TitleDesc = line;
        if (dayMatch) {
          TitleDesc = line.replace(/Day\s+\d+:/i, "").trim();
        }

        const parts = TitleDesc.split("-");
        const title = parts[0] ? parts[0].trim() : `Day ${day} Itinerary`;
        const description = parts.slice(1).join("-").trim() || "Local sightseeing & adventure activities.";

        return { day, title, description };
      });
    }

    const payload = {
      ...tourForm,
      price: Number(tourForm.price),
      highlights: tourForm.highlights ? tourForm.highlights.split(",").map(h => h.trim()).filter(Boolean) : [],
      activities: tourForm.activities ? tourForm.activities.split(",").map(a => a.trim()).filter(Boolean) : [],
      packingChecklist: tourForm.packingChecklist ? tourForm.packingChecklist.split(",").map(p => p.trim()).filter(Boolean) : [],
      itinerary: itineraryList
    };

    const method = editingTour ? "PUT" : "POST";
    const url = editingTour ? `/api/admin/tours/${editingTour._id}` : "/api/admin/tours";

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error("API Request Failed");
        return res.json();
      })
      .then(() => {
        addToast(editingTour ? "Tour updated successfully!" : "Tour created successfully!", "success");
        setShowTourModal(false);
        loadDashboardData();
      })
      .catch(() => {
        // Mock fallback update
        if (editingTour) {
          setTours(tours.map(t => t._id === editingTour._id ? { ...t, ...payload } : t));
        } else {
          setTours([...tours, { _id: `t_${Date.now()}`, ...payload }]);
        }
        addToast(editingTour ? "Tour updated (Mock Mode)" : "Tour created (Mock Mode)", "success");
        setShowTourModal(false);
      });
  };

  // Delete tour
  const handleDeleteTour = (tourId) => {
    if (!window.confirm("Are you sure you want to delete this tour package?")) return;

    fetch(`/api/admin/tours/${tourId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("API Request Failed");
        return res.json();
      })
      .then(() => {
        addToast("Tour package deleted successfully!", "success");
        loadDashboardData();
      })
      .catch(() => {
        setTours(tours.filter(t => t._id !== tourId));
        addToast("Tour package deleted (Mock Mode)", "success");
      });
  };

  if (!user || (user.role !== "admin" && user.role !== "manager")) {
    return (
      <div style={{ padding: "120px 20px", textAlign: "center", minHeight: "100vh" }}>
        <FaLock size={48} style={{ color: "#EF4444", marginBottom: "15px" }} />
        <h2>Access Denied. Admins and Managers Only.</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: "100px 5% 50px 5%", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", flexWrap: "wrap", gap: "15px" }}>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: "800", display: "flex", alignItems: "center", gap: "10px" }}>
              <FaWrench style={{ color: "var(--accent)" }} /> Admin Dashboard
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Registered travel guides, CNIC documents verification center & transport bookings tracker.
            </p>
          </div>
          <button className="btn btn-outline" onClick={loadDashboardData}>
            🔄 Refresh Data
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <div className="loader" style={{ borderTopColor: "var(--secondary)" }}></div>
            <p style={{ marginTop: "15px", color: "var(--text-muted)" }}>Loading administrative metrics...</p>
          </div>
        ) : (
          <>
            {/* Overview Stats Cards Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                marginBottom: "40px",
              }}
            >
              {/* Users */}
              <div className="card" style={{ padding: "20px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total Customers</span>
                    <h3 style={{ fontSize: "28px", margin: "5px 0" }}>{stats?.totalUsers}</h3>
                  </div>
                  <FaUsers size={24} style={{ color: "#3B82F6" }} />
                </div>
              </div>

              {/* Bookings */}
              <div className="card" style={{ padding: "20px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total Bookings</span>
                    <h3 style={{ fontSize: "28px", margin: "5px 0" }}>{stats?.totalBookings}</h3>
                  </div>
                  <FaBook size={24} style={{ color: "var(--secondary)" }} />
                </div>
              </div>

              {/* Revenue */}
              <div className="card" style={{ padding: "20px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total Revenue</span>
                    <h3 style={{ fontSize: "24px", margin: "8px 0", color: "var(--secondary)" }}>Rs. {stats?.revenue}</h3>
                  </div>
                  <FaDollarSign size={24} style={{ color: "var(--accent)" }} />
                </div>
              </div>

              {/* Fleet */}
              <div className="card" style={{ padding: "20px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Available Cars</span>
                    <h3 style={{ fontSize: "28px", margin: "5px 0" }}>{stats?.availableCars}</h3>
                  </div>
                  <FaCar size={24} style={{ color: "#8B5CF6" }} />
                </div>
              </div>
            </div>

            {/* Dashboard Navigation Tabs */}
            <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid var(--border)", paddingBottom: "15px", marginBottom: "35px", flexWrap: "wrap" }}>
              {[
                { id: "overview", label: "📊 Overview Charts" },
                { id: "bookings", label: "🚗 Manage Bookings" },
                { id: "verifications", label: "🆔 CNIC Verifications" },
                { id: "messages", label: "📞 Callback Inquiries" },
                { id: "fleet", label: "🚘 Manage Fleet" },
                { id: "tours", label: "🗺️ Manage Tours" },
              ].map((tb) => (
                <button
                  key={tb.id}
                  onClick={() => setActiveTab(tb.id)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    background: activeTab === tb.id ? "var(--secondary)" : "transparent",
                    color: activeTab === tb.id ? "white" : "var(--text-muted)",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "0.2s",
                  }}
                >
                  {tb.label}
                </button>
              ))}
            </div>

            {/* Tab: Overview Charts */}
            {activeTab === "overview" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                  gap: "30px",
                }}
              >
                {/* SVG Revenue Chart */}
                <div className="card" style={{ padding: "25px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <h3 style={{ fontSize: "16px", marginBottom: "20px" }}>Revenue trends (Monthly Growth)</h3>
                  <div style={{ height: "220px", display: "flex", alignItems: "flex-end", position: "relative" }}>
                    <svg viewBox="0 0 400 200" style={{ width: "100%", height: "100%" }}>
                      <path
                        d="M 50 180 Q 120 150 200 90 T 350 40"
                        fill="none"
                        stroke="var(--secondary)"
                        strokeWidth="4"
                      />
                      <circle cx="50" cy="180" r="6" fill="var(--primary)" stroke="var(--secondary)" strokeWidth="2" />
                      <circle cx="200" cy="90" r="6" fill="var(--primary)" stroke="var(--secondary)" strokeWidth="2" />
                      <circle cx="350" cy="40" r="6" fill="var(--primary)" stroke="var(--secondary)" strokeWidth="2" />
                      {/* Grid labels */}
                      <text x="40" y="195" fill="var(--text-muted)" fontSize="10">May</text>
                      <text x="190" y="195" fill="var(--text-muted)" fontSize="10">June (E)</text>
                      <text x="330" y="195" fill="var(--text-muted)" fontSize="10">July (P)</text>
                    </svg>
                  </div>
                </div>

                {/* SVG Popular Destinations Chart */}
                <div className="card" style={{ padding: "25px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <h3 style={{ fontSize: "16px", marginBottom: "20px" }}>Most Booked Destinations</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "10px 0" }}>
                    {[
                      { name: "Hunza Valley", val: "75%", color: "var(--secondary)" },
                      { name: "Skardu", val: "60%", color: "var(--accent)" },
                      { name: "Swat & Kalam", val: "40%", color: "#3B82F6" },
                      { name: "Murree Hills", val: "25%", color: "#EF4444" },
                    ].map((dest, idx) => (
                      <div key={idx} style={{ fontSize: "13px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <span>{dest.name}</span>
                          <strong>{dest.val}</strong>
                        </div>
                        <div style={{ width: "100%", height: "8px", backgroundColor: "var(--bg)", borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{ width: dest.val, height: "100%", backgroundColor: dest.color, borderRadius: "4px" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Bookings Management */}
            {activeTab === "bookings" && (
              <div className="card" style={{ padding: "25px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--text-muted)" }}>
                      <th style={{ padding: "12px" }}>Booking ID</th>
                      <th style={{ padding: "12px" }}>Customer</th>
                      <th style={{ padding: "12px" }}>Item</th>
                      <th style={{ padding: "12px" }}>Start Date</th>
                      <th style={{ padding: "12px" }}>Amount</th>
                      <th style={{ padding: "12px" }}>Timeline Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking._id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px", fontWeight: "700" }}>#{booking._id.substring(0, 8)}</td>
                        <td style={{ padding: "12px" }}>
                          <div>{booking.user?.name || "Guest User"}</div>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{booking.user?.phone}</span>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <span style={{ fontSize: "11px", background: "var(--bg)", padding: "2px 6px", borderRadius: "4px", marginRight: "5px" }}>
                            {booking.type}
                          </span>
                          {booking.itemName}
                        </td>
                        <td style={{ padding: "12px" }}>{booking.startDate}</td>
                        <td style={{ padding: "12px", fontWeight: "600", color: "var(--secondary)" }}>Rs. {booking.totalPrice}</td>
                        <td style={{ padding: "12px" }}>
                          {/* timeline status update dropdown */}
                          <select
                            value={booking.timelineStatus}
                            onChange={(e) => handleUpdateBookingStatus(booking._id, e.target.value)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: "6px",
                              border: "1px solid var(--border)",
                              backgroundColor: "var(--bg)",
                              color: "var(--text)",
                              fontSize: "12px",
                              fontWeight: "600",
                              outline: "none",
                            }}
                          >
                            <option value="Inquiry Sent">Inquiry Sent</option>
                            <option value="Admin Consultation">Admin Consultation</option>
                            <option value="Vehicle Suggested">Vehicle Suggested</option>
                            <option value="Quotation Sent">Quotation Sent</option>
                            <option value="Verification">Verification</option>
                            <option value="Payment">Payment</option>
                            <option value="Booking Confirmed">Booking Confirmed</option>
                            <option value="Enjoy Your Trip">Enjoy Your Trip</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab: Verifications Review */}
            {activeTab === "verifications" && (
              <div className="card" style={{ padding: "25px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", overflowX: "auto" }}>
                {verifications.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No pending customer identity verifications.</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--text-muted)" }}>
                        <th style={{ padding: "12px" }}>Name</th>
                        <th style={{ padding: "12px" }}>CNIC</th>
                        <th style={{ padding: "12px" }}>Passport</th>
                        <th style={{ padding: "12px" }}>Uploaded Photo</th>
                        <th style={{ padding: "12px" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verifications.map((v) => (
                        <tr key={v._id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "12px" }}>
                            <strong>{v.name}</strong>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{v.email} | {v.phone}</div>
                          </td>
                          <td style={{ padding: "12px" }}>{v.cnic || "N/A"}</td>
                          <td style={{ padding: "12px" }}>{v.passport || "N/A"}</td>
                          <td style={{ padding: "12px" }}>
                            <span
                              style={{ color: "var(--secondary)", cursor: "pointer", fontWeight: "700" }}
                              onClick={() => addToast("Displaying uploaded scan mockup.", "info")}
                            >
                              📄 view_scan.jpg
                            </span>
                          </td>
                          <td style={{ padding: "12px" }}>
                            <div style={{ display: "flex", gap: "10px" }}>
                              <button
                                className="btn btn-primary"
                                style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "11px" }}
                                onClick={() => handleVerifyUser(v._id, "verified")}
                              >
                                <FaCheckCircle size={10} /> Approve
                              </button>
                              <button
                                className="btn btn-outline"
                                style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "11px", color: "#EF4444", borderColor: "#FCA5A5" }}
                                onClick={() => handleVerifyUser(v._id, "rejected")}
                              >
                                <FaTimesCircle size={10} /> Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Tab: Message callbacks inquiries */}
            {activeTab === "messages" && (
              <div className="card" style={{ padding: "25px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", overflowX: "auto" }}>
                {messages.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No callback requests in logs.</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--text-muted)" }}>
                        <th style={{ padding: "12px" }}>Name</th>
                        <th style={{ padding: "12px" }}>Phone</th>
                        <th style={{ padding: "12px" }}>Inquiry Details</th>
                        <th style={{ padding: "12px" }}>Date</th>
                        <th style={{ padding: "12px" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.map((msg) => (
                        <tr key={msg._id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "12px", fontWeight: "700" }}>{msg.name}</td>
                          <td style={{ padding: "12px" }}>{msg.phone}</td>
                          <td style={{ padding: "12px" }}>{msg.message}</td>
                          <td style={{ padding: "12px" }}>{new Date(msg.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: "12px" }}>
                            <span
                              style={{
                                display: "inline-block",
                                background: msg.status === "resolved" ? "rgba(34, 197, 94, 0.15)" : "rgba(245, 158, 11, 0.15)",
                                color: msg.status === "resolved" ? "var(--secondary)" : "var(--accent)",
                                padding: "4px 10px",
                                borderRadius: "8px",
                                fontSize: "11px",
                                fontWeight: "700",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                // Simulate resolving callback in UI
                                addToast("Inquiry marked as Resolved.", "success");
                              }}
                            >
                              {msg.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Tab: Fleet Management */}
            {activeTab === "fleet" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button className="btn btn-primary" onClick={openCarAddModal} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaPlus /> Add New Vehicle
                  </button>
                </div>
                <div className="card" style={{ padding: "25px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--text-muted)" }}>
                        <th style={{ padding: "12px" }}>Vehicle Info</th>
                        <th style={{ padding: "12px" }}>Category</th>
                        <th style={{ padding: "12px" }}>Transmission</th>
                        <th style={{ padding: "12px" }}>Capacity</th>
                        <th style={{ padding: "12px" }}>Price Per Day</th>
                        <th style={{ padding: "12px" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cars.map((car) => (
                        <tr key={car._id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <img src={car.images && car.images[0]} alt={car.name} style={{ width: "50px", height: "35px", objectFit: "cover", borderRadius: "4px" }} />
                              <div>
                                <strong>{car.name}</strong>
                                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Model: {car.model}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "12px" }}>{car.category}</td>
                          <td style={{ padding: "12px" }}>{car.transmission}</td>
                          <td style={{ padding: "12px" }}>{car.capacity} Seats</td>
                          <td style={{ padding: "12px", fontWeight: "600", color: "var(--secondary)" }}>Rs. {car.pricePerDay}</td>
                          <td style={{ padding: "12px" }}>
                            <div style={{ display: "flex", gap: "10px" }}>
                              <button onClick={() => openCarEditModal(car)} className="btn btn-outline" style={{ padding: "6px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                                <FaEdit size={10} /> Edit
                              </button>
                              <button onClick={() => handleDeleteCar(car._id)} className="btn btn-outline" style={{ padding: "6px 12px", fontSize: "12px", color: "#EF4444", borderColor: "#FCA5A5", display: "flex", alignItems: "center", gap: "4px" }}>
                                <FaTrash size={10} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab: Tours Management */}
            {activeTab === "tours" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button className="btn btn-primary" onClick={openTourAddModal} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaPlus /> Add Tour Package
                  </button>
                </div>
                <div className="card" style={{ padding: "25px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--text-muted)" }}>
                        <th style={{ padding: "12px" }}>Tour Details</th>
                        <th style={{ padding: "12px" }}>Duration</th>
                        <th style={{ padding: "12px" }}>Category</th>
                        <th style={{ padding: "12px" }}>Best Season</th>
                        <th style={{ padding: "12px" }}>Base Price</th>
                        <th style={{ padding: "12px" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tours.map((tour) => (
                        <tr key={tour._id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <img src={tour.image} alt={tour.name} style={{ width: "50px", height: "35px", objectFit: "cover", borderRadius: "4px" }} />
                              <strong>{tour.name}</strong>
                            </div>
                          </td>
                          <td style={{ padding: "12px" }}>{tour.days}</td>
                          <td style={{ padding: "12px" }}>{tour.category}</td>
                          <td style={{ padding: "12px" }}>{tour.bestTime}</td>
                          <td style={{ padding: "12px", fontWeight: "600", color: "var(--secondary)" }}>Rs. {tour.price}</td>
                          <td style={{ padding: "12px" }}>
                            <div style={{ display: "flex", gap: "10px" }}>
                              <button onClick={() => openTourEditModal(tour)} className="btn btn-outline" style={{ padding: "6px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                                <FaEdit size={10} /> Edit
                              </button>
                              <button onClick={() => handleDeleteTour(tour._id)} className="btn btn-outline" style={{ padding: "6px 12px", fontSize: "12px", color: "#EF4444", borderColor: "#FCA5A5", display: "flex", alignItems: "center", gap: "4px" }}>
                                <FaTrash size={10} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Car Modal overlay */}
      {showCarModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(4px)",
          zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
        }} onClick={() => setShowCarModal(false)}>
          <div className="card" style={{
            width: "100%", maxWidth: "600px", backgroundColor: "var(--bg-card)",
            borderRadius: "16px", padding: "25px", maxHeight: "90vh", overflowY: "auto"
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "20px" }}>{editingCar ? "Edit Vehicle" : "Add New Vehicle"}</h3>
            <form onSubmit={handleCarSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Vehicle Name *</label>
                  <input type="text" value={carForm.name} onChange={e => setCarForm({...carForm, name: e.target.value})} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Model (e.g. 2024 GLI) *</label>
                  <input type="text" value={carForm.model} onChange={e => setCarForm({...carForm, model: e.target.value})} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
                </div>
              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Category *</label>
                  <select value={carForm.category} onChange={e => setCarForm({...carForm, category: e.target.value})} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }}>
                    <option value="Economy">Economy</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Van">Van</option>
                    <option value="Coaster">Coaster</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Price Per Day (PKR) *</label>
                  <input type="number" value={carForm.pricePerDay} onChange={e => setCarForm({...carForm, pricePerDay: e.target.value})} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Image URLs (comma separated)</label>
                <input type="text" value={carForm.images} onChange={e => setCarForm({...carForm, images: e.target.value})} placeholder="https://unsplash.com/xxx, https://unsplash.com/yyy" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Transmission</label>
                  <select value={carForm.transmission} onChange={e => setCarForm({...carForm, transmission: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }}>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Fuel Economy</label>
                  <input type="text" value={carForm.fuelEconomy} onChange={e => setCarForm({...carForm, fuelEconomy: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Seats Capacity</label>
                  <input type="number" value={carForm.capacity} onChange={e => setCarForm({...carForm, capacity: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Features (comma separated)</label>
                <input type="text" value={carForm.features} onChange={e => setCarForm({...carForm, features: e.target.value})} placeholder="AC, Leather Seats, 4x4, Sunroof" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
              </div>

              <div style={{ display: "flex", gap: "20px", padding: "5px 0" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
                  <input type="checkbox" checked={carForm.driverIncluded} onChange={e => setCarForm({...carForm, driverIncluded: e.target.checked})} />
                  Driver Included
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
                  <input type="checkbox" checked={carForm.luxuryBadge} onChange={e => setCarForm({...carForm, luxuryBadge: e.target.checked})} />
                  Luxury Badge
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "15px" }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowCarModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tour Modal overlay */}
      {showTourModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(4px)",
          zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
        }} onClick={() => setShowTourModal(false)}>
          <div className="card" style={{
            width: "100%", maxWidth: "600px", backgroundColor: "var(--bg-card)",
            borderRadius: "16px", padding: "25px", maxHeight: "90vh", overflowY: "auto"
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "20px" }}>{editingTour ? "Edit Tour Package" : "Add Tour Package"}</h3>
            <form onSubmit={handleTourSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Tour Name *</label>
                  <input type="text" value={tourForm.name} onChange={e => setTourForm({...tourForm, name: e.target.value})} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
                </div>
              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Duration (e.g. 5 Days / 4 Nights) *</label>
                  <input type="text" value={tourForm.days} onChange={e => setTourForm({...tourForm, days: e.target.value})} required placeholder="5 Days / 4 Nights" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Category *</label>
                  <select value={tourForm.category} onChange={e => setTourForm({...tourForm, category: e.target.value})} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }}>
                    <option value="Adventure">Adventure</option>
                    <option value="Honeymoon">Honeymoon</option>
                    <option value="Family">Family</option>
                    <option value="Summer">Summer</option>
                    <option value="Winter">Winter</option>
                    <option value="Eid">Eid</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Price (PKR) *</label>
                  <input type="number" value={tourForm.price} onChange={e => setTourForm({...tourForm, price: e.target.value})} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Main Image URL *</label>
                <input type="text" value={tourForm.image} onChange={e => setTourForm({...tourForm, image: e.target.value})} required placeholder="https://unsplash.com/xxx" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Description *</label>
                <textarea value={tourForm.description} onChange={e => setTourForm({...tourForm, description: e.target.value})} required rows={3} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)", resize: "vertical" }} />
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Highlights (comma separated)</label>
                <input type="text" value={tourForm.highlights} onChange={e => setTourForm({...tourForm, highlights: e.target.value})} placeholder="Attabad Lake Boating, Altit Fort" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Day-by-Day Itinerary (format: One day per line, "Day X: Title - Description")</label>
                <textarea value={tourForm.itineraryRaw} onChange={e => setTourForm({...tourForm, itineraryRaw: e.target.value})} placeholder="Day 1: Arrival - Travel to Naran&#10;Day 2: Sightseeing - Altit & Baltit Fort tours" rows={4} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)", resize: "vertical", fontFamily: "monospace", fontSize: "12px" }} />
              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Best Season to Visit</label>
                  <input type="text" value={tourForm.bestTime} onChange={e => setTourForm({...tourForm, bestTime: e.target.value})} placeholder="May to October" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Activities (comma separated)</label>
                  <input type="text" value={tourForm.activities} onChange={e => setTourForm({...tourForm, activities: e.target.value})} placeholder="Sightseeing, Hiking, Boating" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
                </div>
              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Weather Info Summary</label>
                  <input type="text" value={tourForm.weatherInfo} onChange={e => setTourForm({...tourForm, weatherInfo: e.target.value})} placeholder="Average temp 15C. Chilly nights." style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Packing Checklist (comma separated)</label>
                  <input type="text" value={tourForm.packingChecklist} onChange={e => setTourForm({...tourForm, packingChecklist: e.target.value})} placeholder="Warm clothes, umbrella, boots" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "15px" }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowTourModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

```

## File: [src/pages/Airport.jsx](file:///C:/Users/hp/Desktop/Khan Tourism/src/pages/Airport.jsx)

```javascript
import React, { useState, useEffect } from "react";
import {
  FaPlaneDeparture,
  FaUserAlt,
  FaCar,
  FaPhoneAlt,
  FaClock,
  FaMapMarked,
  FaSearch,
} from "react-icons/fa";

export default function Airport() {
  const [flightNo, setFlightNo] = useState("PK785");
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(35);
  const [activeTab, setActiveTab] = useState("tracker");

  // Simulated countdown interval
  useEffect(() => {
    if (!trackingData) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 35));
    }, 60000);
    return () => clearInterval(timer);
  }, [trackingData]);

  const handleTrackFlight = (e) => {
    e.preventDefault();
    if (!flightNo) return;
    setLoading(true);
    setTrackingData(null);

    fetch("/api/airport/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flightNumber: flightNo }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setTrackingData(data);
        setCountdown(data.estimatedArrivalMins || 35);
        setLoading(false);
      })
      .catch(() => {
        // Fallback mock details if API offline
        setTimeout(() => {
          setTrackingData({
            driverName: "Zahid Mahmood",
            driverPhone: "+92 334 1122334",
            driverPhoto: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=150",
            vehicleName: "Toyota Corolla Grande 2022",
            vehiclePhoto: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=300",
            driverVehicleNo: "LE-482-ICT",
            livePickupStatus: "Driver En-Route to Islamabad Airport",
            estimatedArrivalMins: 35,
            flightTracked: flightNo.toUpperCase(),
          });
          setLoading(false);
        }, 800);
      });
  };

  const steps = [
    { label: "Flight Landed", active: true },
    { label: "Luggage Pickup", active: true },
    { label: "Driver En-Route", active: true },
    { label: "Driver Waiting", active: false },
    { label: "Enjoying Ride", active: false },
  ];

  return (
    <div style={{ padding: "100px 5% 50px 5%", minHeight: "100vh" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: "800", marginBottom: "15px" }}>
            🛫 Airport Pickup Tracker
          </h1>
          <p style={{ color: "var(--text-muted)", maxWidth: "600px", marginInline: "auto" }}>
            Track international or domestic arrival flights. Our system simulates live driver status and terminal locations.
          </p>
        </div>

        {/* Input Form card */}
        <form
          onSubmit={handleTrackFlight}
          className="card glass"
          style={{
            padding: "20px 25px",
            borderRadius: "20px",
            border: "1px solid var(--border)",
            display: "flex",
            gap: "15px",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          <FaPlaneDeparture style={{ fontSize: "20px", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Enter Flight Number (e.g. PK785)"
            value={flightNo}
            onChange={(e) => setFlightNo(e.target.value)}
            required
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg)",
              color: "var(--text)",
              fontSize: "15px",
              fontWeight: "600",
              outline: "none",
            }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: "10px 24px" }}>
            <FaSearch /> Track Flight
          </button>
        </form>

        {loading && (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div className="loader" style={{ borderTopColor: "var(--secondary)" }}></div>
            <p style={{ marginTop: "15px", color: "var(--text-muted)" }}>Scanning flight coordinates...</p>
          </div>
        )}

        {/* Details Display Panel */}
        {trackingData && !loading && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            {/* Tabs */}
            <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid var(--border)", paddingBottom: "15px" }}>
              <button
                onClick={() => setActiveTab("tracker")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: activeTab === "tracker" ? "var(--secondary)" : "var(--text-muted)",
                  fontWeight: "700",
                  fontSize: "14px",
                  borderBottom: activeTab === "tracker" ? "2px solid var(--secondary)" : "2px solid transparent",
                  paddingBottom: "8px",
                }}
              >
                📟 Live Status
              </button>
              <button
                onClick={() => setActiveTab("map")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: activeTab === "map" ? "var(--secondary)" : "var(--text-muted)",
                  fontWeight: "700",
                  fontSize: "14px",
                  borderBottom: activeTab === "map" ? "2px solid var(--secondary)" : "2px solid transparent",
                  paddingBottom: "8px",
                }}
              >
                🗺️ Terminal Map
              </button>
            </div>

            {activeTab === "tracker" ? (
              <>
                {/* Live timeline status progress bar */}
                <div className="card" style={{ padding: "25px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <h3 style={{ fontSize: "16px", marginBottom: "20px" }}>Live Pickup Timeline</h3>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      position: "relative",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    {/* Line connection */}
                    <div
                      style={{
                        position: "absolute",
                        left: "10px",
                        right: "10px",
                        top: "12px",
                        height: "3px",
                        backgroundColor: "var(--border)",
                        zIndex: 1,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: "10px",
                        width: "50%",
                        top: "12px",
                        height: "3px",
                        backgroundColor: "var(--secondary)",
                        zIndex: 1,
                      }}
                    />

                    {steps.map((st, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          zIndex: 2,
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            backgroundColor: st.active ? "var(--secondary)" : "var(--bg-card)",
                            border: `3px solid ${st.active ? "var(--secondary)" : "var(--border)"}`,
                          }}
                        />
                        <span style={{ fontSize: "10px", fontWeight: "600", marginTop: "8px", textAlign: "center", color: st.active ? "var(--text)" : "var(--text-muted)" }}>
                          {st.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Driver information card */}
                <div
                  className="card"
                  style={{
                    padding: "30px",
                    borderRadius: "24px",
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "30px",
                    alignItems: "center",
                  }}
                >
                  {/* Photo details */}
                  <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                    <img
                      src={trackingData.driverPhoto}
                      alt="Driver"
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "3px solid var(--secondary)",
                      }}
                    />
                    <div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Assigned Chauffeur</div>
                      <h3 style={{ fontSize: "18px", margin: "2px 0" }}>{trackingData.driverName}</h3>
                      <span style={{ fontSize: "12px", color: "var(--accent)", fontWeight: "700" }}>⭐ 4.9 Driver Rating</span>
                    </div>
                  </div>

                  {/* Vehicle details */}
                  <div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Pickup Vehicle</span>
                    <div style={{ fontSize: "15px", fontWeight: "700", margin: "2px 0" }}>{trackingData.vehicleName}</div>
                    <span
                      style={{
                        display: "inline-block",
                        background: "var(--primary)",
                        color: "white",
                        padding: "3px 10px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "800",
                      }}
                    >
                      {trackingData.driverVehicleNo}
                    </span>
                  </div>

                  {/* Contact timer */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                      <FaClock style={{ color: "var(--secondary)" }} />
                      <strong>Arrival in {countdown} mins</strong>
                    </div>
                    <a
                      href={`tel:${trackingData.driverPhone}`}
                      className="btn btn-primary"
                      style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "13px" }}
                    >
                      <FaPhoneAlt size={11} /> Call Zahid
                    </a>
                  </div>
                </div>
              </>
            ) : (
              /* Terminal Map blueprint simulation */
              <div
                className="card"
                style={{
                  padding: "30px",
                  borderRadius: "24px",
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  textAlign: "center",
                }}
              >
                <h3 style={{ fontSize: "18px", marginBottom: "10px" }}>Islamabad International Airport (ISB)</h3>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
                  Assigned meeting spot: **International Arrivals Exit Gate #3** (Next to PTDC Information desk).
                </p>

                {/* Map simulation */}
                <div
                  style={{
                    height: "300px",
                    backgroundColor: "var(--bg)",
                    border: "2px dashed var(--border)",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <FaMapMarked style={{ fontSize: "48px", color: "var(--text-muted)" }} />
                  <div
                    style={{
                      position: "absolute",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      background: "rgba(34,197,94,0.15)",
                      color: "var(--secondary)",
                      border: "1px solid var(--secondary)",
                      fontSize: "12px",
                      fontWeight: "700",
                      top: "40%",
                      left: "35%",
                    }}
                  >
                    📍 Driver Zahid Waiting Point (Gate 3)
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      background: "rgba(239,68,68,0.15)",
                      color: "#EF4444",
                      border: "1px solid #EF4444",
                      fontSize: "11px",
                      fontWeight: "700",
                      top: "20%",
                      left: "20%",
                    }}
                  >
                    🛫 Landing Runway
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

## File: [src/pages/Cars.jsx](file:///C:/Users/hp/Desktop/Khan Tourism/src/pages/Cars.jsx)

```javascript
import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import {
  FaCar,
  FaCogs,
  FaUsers,
  FaCheck,
  FaHeart,
  FaTimes,
  FaExchangeAlt,
  FaCalendarAlt,
  FaGasPump,
} from "react-icons/fa";

export default function Cars() {
  const {
    user,
    token,
    addToCompareCars,
    compareCars,
    removeFromCompareCars,
    addToast,
  } = useApp();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [savedWishlist, setSavedWishlist] = useState([]);

  // Booking form states
  const [selectedCar, setSelectedCar] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [people, setPeople] = useState(1);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingTimelineStep, setBookingTimelineStep] = useState(1); // steps of confirmation timeline

  const navigate = useNavigate();

  // Load cars from API
  useEffect(() => {
    fetch("/api/cars")
      .then((res) => res.json())
      .then((data) => {
        setCars(data);
        setLoading(false);
      })
      .catch((err) => {
        // Mock fallback if API fails
        setCars([
          {
            _id: "c_corolla_gli",
            name: "Toyota Corolla GLI",
            model: "GLI 2015",
            category: "Economy",
            pricePerDay: 8000,
            images: ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600"],
            transmission: "Automatic",
            fuelEconomy: "12 km/L",
            capacity: 4,
            features: ["AC", "Airbags", "Bluetooth", "Comfort Seats"],
            isAvailable: true,
            driverIncluded: true,
            luxuryBadge: false,
          },
          {
            _id: "c_corolla_grande",
            name: "Toyota Corolla Grande",
            model: "Grande 2022",
            category: "Sedan",
            pricePerDay: 15000,
            images: ["https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=600"],
            transmission: "Automatic",
            fuelEconomy: "13 km/L",
            capacity: 5,
            features: ["AC", "Sunroof", "Leather Interior", "Cruise Control"],
            isAvailable: true,
            driverIncluded: true,
            luxuryBadge: false,
          },
          {
            _id: "c_prado",
            name: "Toyota Prado TX L",
            model: "Prado 2018",
            category: "SUV",
            pricePerDay: 35000,
            images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600"],
            transmission: "Automatic",
            fuelEconomy: "8 km/L",
            capacity: 7,
            features: ["AC", "Panoramic Sunroof", "Heated Seats", "4x4 Drive Mode"],
            isAvailable: true,
            driverIncluded: true,
            luxuryBadge: true,
          },
          {
            _id: "c_hiace",
            name: "Toyota Hiace Grand Cabin",
            model: "Hiace 2020",
            category: "Van",
            pricePerDay: 22000,
            images: ["https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=600"],
            transmission: "Manual",
            fuelEconomy: "10 km/L",
            capacity: 14,
            features: ["AC", "High Roof", "Reclining Seats", "LED TV Screen"],
            isAvailable: true,
            driverIncluded: true,
            luxuryBadge: false,
          },
        ]);
        setLoading(false);
      });
  }, []);

  const handleFavoriteToggle = (car) => {
    if (savedWishlist.includes(car._id)) {
      setSavedWishlist(savedWishlist.filter((id) => id !== car._id));
      addToast(`Removed ${car.name} from wishlist.`, "info");
    } else {
      setSavedWishlist([...savedWishlist, car._id]);
      addToast(`Added ${car.name} to wishlist!`, "success");
    }
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const handleOpenBooking = (car) => {
    if (!user) {
      addToast("Please sign in to proceed with vehicle reservations.", "warning");
      navigate("/profile");
      return;
    }
    setSelectedCar(car);
    setStartDate("");
    setEndDate("");
    setPeople(1);
    setBookingConfirmed(false);
    setBookingTimelineStep(1);
  };

  // Submit car booking to API
  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      addToast("Please fill in start and end dates.", "warning");
      return;
    }

    const totalDays = calculateDays();
    const totalPrice = selectedCar.pricePerDay * totalDays;

    setBookingTimelineStep(2); // Move along checkout timeline step

    fetch("/api/cars/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        carId: selectedCar._id,
        startDate,
        endDate,
        totalDays,
        totalPrice,
        peopleCount: people,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("API Booking failed");
        return res.json();
      })
      .then((data) => {
        setBookingConfirmed(true);
        setBookingTimelineStep(3); // Completed confirmation
        addToast(`Successfully booked ${selectedCar.name}!`, "success");
      })
      .catch((err) => {
        // Fallback for mock environment
        setBookingConfirmed(true);
        setBookingTimelineStep(3);
        addToast("Booking request registered (Offline demo mode).", "success");
      });
  };

  const filteredCars =
    filter === "ALL" ? cars : cars.filter((c) => c.category === filter);

  return (
    <div style={{ padding: "100px 5% 50px 5%", minHeight: "100vh" }}>
      {/* Search Header */}
      <div style={{ maxWidth: "1200px", margin: "0 auto 40px auto", textAlign: "center" }}>
        <h1 style={{ fontSize: "36px", fontWeight: "800", marginBottom: "15px" }}>
          🚗 Premium Rent-A-Car Fleet
        </h1>
        <p style={{ color: "var(--text-muted)", maxWidth: "600px", marginInline: "auto", marginBottom: "40px" }}>
          Experience secure mountain journeys with verified, professional local drivers. Prado SUVs, Sedans and family coaster vans available at standard rates.
        </p>

        {/* Filter Badges */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            flexWrap: "wrap",
            borderBottom: "1px solid var(--border)",
            paddingBottom: "20px",
          }}
        >
          {["ALL", "Sedan", "SUV", "Luxury", "Van"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: "10px 20px",
                borderRadius: "30px",
                border: "1px solid var(--border)",
                background: filter === cat ? "var(--primary)" : "var(--bg-card)",
                color: filter === cat ? "var(--white)" : "var(--text)",
                fontWeight: "600",
                cursor: "pointer",
                transition: "0.3s",
              }}
            >
              {cat === "ALL" ? "All Vehicles" : cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <div className="loader" style={{ borderTopColor: "var(--secondary)" }}></div>
          <p style={{ marginTop: "15px", color: "var(--text-muted)" }}>Loading rental vehicles fleet...</p>
        </div>
      ) : (
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "30px",
          }}
        >
          {filteredCars.map((car) => {
            const isComparing = compareCars.some((c) => c._id === car._id);
            return (
              <div
                key={car._id}
                className="card"
                style={{
                  borderRadius: "20px",
                  overflow: "hidden",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* badges top */}
                <div
                  style={{
                    position: "absolute",
                    top: "15px",
                    left: "15px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                    zIndex: 2,
                  }}
                >
                  {car.luxuryBadge && (
                    <span
                      style={{
                        background: "var(--accent)",
                        color: "var(--primary)",
                        padding: "4px 10px",
                        borderRadius: "10px",
                        fontSize: "11px",
                        fontWeight: "700",
                      }}
                    >
                      👑 Premium SUV
                    </span>
                  )}
                  {car.driverIncluded && (
                    <span
                      style={{
                        background: "var(--secondary)",
                        color: "white",
                        padding: "4px 10px",
                        borderRadius: "10px",
                        fontSize: "11px",
                        fontWeight: "700",
                      }}
                    >
                      👨 Driver Included
                    </span>
                  )}
                </div>

                {/* Wishlist toggle */}
                <button
                  onClick={() => handleFavoriteToggle(car)}
                  style={{
                    position: "absolute",
                    top: "15px",
                    right: "15px",
                    background: "rgba(15,23,42,0.6)",
                    border: "none",
                    borderRadius: "50%",
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: savedWishlist.includes(car._id) ? "#EF4444" : "white",
                    zIndex: 2,
                    transition: "0.2s",
                  }}
                >
                  <FaHeart />
                </button>

                {/* Vehicle Picture */}
                <div style={{ height: "200px", overflow: "hidden" }}>
                  <img
                    src={car.images && car.images[0] ? car.images[0] : "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600"}
                    alt={car.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                {/* Body Content */}
                <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <h3 style={{ fontSize: "18px", marginBottom: "5px" }}>{car.name}</h3>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "15px", display: "block" }}>
                    {car.model}
                  </span>

                  {/* Specs indicators grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                      marginBottom: "20px",
                      fontSize: "13px",
                      color: "var(--text-muted)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FaUsers /> {car.capacity} Seats
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FaCogs /> {car.transmission}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FaGasPump /> {car.fuelEconomy}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FaCheck /> AC / Heater
                    </div>
                  </div>

                  <hr style={{ border: "none", borderTop: "1px solid var(--border)", marginBottom: "15px" }} />

                  {/* Pricing and CTAs */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "auto",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "20px", fontWeight: "800", color: "var(--secondary)" }}>
                        Rs. {car.pricePerDay}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>/ day</span>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      {/* Compare toggle */}
                      <button
                        onClick={() => {
                          if (isComparing) {
                            removeFromCompareCars(car._id);
                          } else {
                            addToCompareCars(car);
                          }
                        }}
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "10px",
                          border: "1px solid var(--border)",
                          backgroundColor: isComparing ? "var(--secondary)" : "var(--bg-card)",
                          color: isComparing ? "white" : "var(--text)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="Add to Comparison side-by-side"
                      >
                        <FaExchangeAlt />
                      </button>

                      <button
                        className="btn btn-primary"
                        style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "13px" }}
                        onClick={() => handleOpenBooking(car)}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Form Dialog Modal */}
      {selectedCar && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 1002,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "500px",
              backgroundColor: "var(--bg-card)",
              borderRadius: "24px",
              padding: "30px",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => setSelectedCar(null)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
                color: "var(--text)",
              }}
            >
              <FaTimes />
            </button>

            {/* If booking confirmed, show visual feedback */}
            {bookingConfirmed ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <span style={{ fontSize: "64px", display: "block", marginBottom: "15px" }}>🎉</span>
                <h3 style={{ fontSize: "24px", color: "var(--secondary)", marginBottom: "10px" }}>
                  Booking Request Confirmed!
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "25px" }}>
                  Your inquiry has been sent to CEO Abdullah Khan. The timeline status has been initiated as "Inquiry Sent". Check your profile page to monitor status.
                </p>

                {/* Timeline display */}
                <div
                  style={{
                    backgroundColor: "rgba(34, 197, 94, 0.08)",
                    borderRadius: "16px",
                    padding: "20px",
                    textAlign: "left",
                    marginBottom: "30px",
                    border: "1px solid rgba(34, 197, 94, 0.2)",
                  }}
                >
                  <h4 style={{ fontSize: "14px", marginBottom: "15px", color: "var(--text)" }}>Booking Timeline Status</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                      <span style={{ color: "var(--secondary)" }}>✔</span>
                      <strong>Inquiry Sent</strong> (Initiated)
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "var(--text-muted)" }}>
                      <span>⏳</span>
                      Admin Consultation (Pending Manager Approval)
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-secondary"
                  style={{ width: "100%" }}
                  onClick={() => setSelectedCar(null)}
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <h3 style={{ fontSize: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <FaCalendarAlt /> Rent {selectedCar.name}
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Fill dates and capacity details. Our managers will call to verify transport clearance and driver logs.
                </p>

                {/* Spec summary */}
                <div
                  style={{
                    padding: "15px",
                    backgroundColor: "var(--bg)",
                    borderRadius: "12px",
                    fontSize: "13px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span>Daily Rental Rate:</span>
                    <strong>Rs. {selectedCar.pricePerDay}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Included:</span>
                    <span style={{ color: "var(--secondary)", fontWeight: "600" }}>Mountain Driver & AC</span>
                  </div>
                </div>

                {/* Form Inputs */}
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "600" }}>Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--bg)",
                      color: "var(--text)",
                      outline: "none",
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "600" }}>End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    min={startDate || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--bg)",
                      color: "var(--text)",
                      outline: "none",
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "600" }}>Number of Passengers</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedCar.capacity}
                    value={people}
                    onChange={(e) => setPeople(e.target.value)}
                    required
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--bg)",
                      color: "var(--text)",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Total Cost Review */}
                {startDate && endDate && (
                  <div
                    style={{
                      padding: "15px",
                      backgroundColor: "rgba(34, 197, 94, 0.08)",
                      borderRadius: "12px",
                      border: "1px solid rgba(34, 197, 94, 0.2)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span>Total Days:</span>
                      <strong>{calculateDays()} Days</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", marginTop: "5px", color: "var(--secondary)" }}>
                      <span>Estimated Total:</span>
                      <strong>Rs. {selectedCar.pricePerDay * calculateDays()}</strong>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ marginTop: "10px" }}>
                  Confirm Booking Timeline
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

```

## File: [src/pages/Contact.jsx](file:///C:/Users/hp/Desktop/Khan Tourism/src/pages/Contact.jsx)

```javascript
import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  FaPhoneAlt,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPaperPlane,
} from "react-icons/fa";

export default function Contact() {
  const { addToast } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmitMessage = (e) => {
    e.preventDefault();
    setLoading(true);

    fetch("/api/inquiries/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, message: `Contact Message: ${message}` }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => {
        addToast("Message sent successfully! Our managers will contact you.", "success");
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
        setLoading(false);
      })
      .catch(() => {
        // Fallback demo message
        setTimeout(() => {
          addToast("Message submitted successfully (Offline demo mode).", "success");
          setName("");
          setEmail("");
          setPhone("");
          setMessage("");
          setLoading(false);
        }, 800);
      });
  };

  return (
    <div style={{ padding: "100px 5% 50px 5%", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: "800", marginBottom: "15px" }}>
            📞 Contact & Consultations
          </h1>
          <p style={{ color: "var(--text-muted)", maxWidth: "600px", marginInline: "auto" }}>
            Get in touch with our travel representatives to verify routes and custom design packages.
          </p>
        </div>

        {/* Contact layout grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "40px",
          }}
          className="contact-layout"
        >
          {/* Left: Contact Info and Badges */}
          <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            <h2 style={{ fontSize: "22px", marginBottom: "10px" }}>Connect Directly</h2>
            
            {/* CEO Card */}
            <div className="card glass" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "15px", border: "1px solid var(--border)" }}>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  backgroundColor: "var(--secondary)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                👤
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: "15px", margin: 0 }}>Abdullah Khan</h4>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>CEO / Chief Planner</span>
                <div style={{ display: "flex", gap: "15px", marginTop: "8px", fontSize: "13px" }}>
                  <a href="tel:03365004848" style={{ color: "var(--secondary)", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                    <FaPhoneAlt size={10} /> Call
                  </a>
                  <a href="https://wa.me/923365004848" target="_blank" rel="noreferrer" style={{ color: "#22C55E", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                    <FaWhatsapp size={12} /> WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Manager Card */}
            <div className="card glass" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "15px", border: "1px solid var(--border)" }}>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  backgroundColor: "#3B82F6",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                👤
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: "15px", margin: 0 }}>Waleed Ahmed</h4>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>General Booking Manager</span>
                <div style={{ display: "flex", gap: "15px", marginTop: "8px", fontSize: "13px" }}>
                  <a href="tel:03115353751" style={{ color: "var(--secondary)", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                    <FaPhoneAlt size={10} /> Call
                  </a>
                  <a href="https://wa.me/923115353751" target="_blank" rel="noreferrer" style={{ color: "#22C55E", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                    <FaWhatsapp size={12} /> WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Office location */}
            <div style={{ display: "flex", gap: "15px", fontSize: "14px", color: "var(--text-muted)", marginTop: "15px" }}>
              <FaMapMarkerAlt size={20} style={{ color: "var(--secondary)" }} />
              <div>
                <strong>Khan Tourism HQ</strong>
                <p>Office #12, First Floor, Al-Rehman Plaza, G-11 Markaz, Islamabad, Pakistan.</p>
              </div>
            </div>
          </div>

          {/* Right: Message Form Card */}
          <div className="card" style={{ padding: "30px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "24px" }}>
            <h2 style={{ fontSize: "20px", marginBottom: "20px" }}>Send a Consultation Inquiry</h2>
            <form onSubmit={handleSubmitMessage} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", fontWeight: "600" }}>Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Ali Rizvi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg)",
                    color: "var(--text)",
                    outline: "none",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", fontWeight: "600" }}>Email Address</label>
                <input
                  type="email"
                  placeholder="ali@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg)",
                    color: "var(--text)",
                    outline: "none",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", fontWeight: "600" }}>Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="03009876543"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg)",
                    color: "var(--text)",
                    outline: "none",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", fontWeight: "600" }}>Your Message / Trip Plans</label>
                <textarea
                  required
                  placeholder="Write your custom vehicle preference, destination valleys details and date logs..."
                  rows="4"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg)",
                    color: "var(--text)",
                    outline: "none",
                    fontSize: "13px",
                    resize: "none",
                  }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: "10px" }} disabled={loading}>
                {loading ? "Sending..." : <><FaPaperPlane /> Send Message</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## File: [src/pages/Home.jsx](file:///C:/Users/hp/Desktop/Khan Tourism/src/pages/Home.jsx)

```javascript
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  FaSearch,
  FaMicrophone,
  FaCloudSun,
  FaUsers,
  FaCar,
  FaMapMarkedAlt,
  FaStar,
  FaCheck,
  FaCalendarAlt,
  FaChevronDown,
  FaPlay,
  FaChevronRight,
  FaChevronLeft,
} from "react-icons/fa";

const FAMOUS_DESTINATIONS = [
  { name: "Hunza Valley", desc: "Autumn colors & peak views", key: "Hunza" },
  { name: "Skardu Karakoram", desc: "Cold deserts & crystal lakes", key: "Skardu" },
  { name: "Swat & Kalam", desc: "Green pastures & pine valleys", key: "Swat" },
  { name: "Murree Hills", desc: "Snowy ridges & pine forests", key: "Murree" },
];

const WEATHER_MOCKS = {
  Hunza: { temp: "14°C", condition: "Sunny", wind: "10 km/h", icon: "☀️" },
  Skardu: { temp: "11°C", condition: "Windy", wind: "18 km/h", icon: "💨" },
  Swat: { temp: "22°C", condition: "Cloudy", wind: "8 km/h", icon: "⛅" },
  Murree: { temp: "18°C", condition: "Rainy", wind: "12 km/h", icon: "🌧️" },
  Islamabad: { temp: "34°C", condition: "Sunny", wind: "6 km/h", icon: "☀️" },
};

const TESTIMONIALS = [
  {
    name: "John Miller",
    country: "USA",
    flag: "🇺🇸",
    text: "Khan Tourism provided the most professional guide and Prado SUV. Traveling Hunza was smooth, safe, and truly luxurious. Five stars!",
    rating: 5,
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
  },
  {
    name: "Ayesha Ahmed",
    country: "Pakistan",
    flag: "🇵🇰",
    text: "Mera Swat ka family tour buhat acha raha. Gari bilkul saaf thi aur driver buhat zayada tameezdar aur safety driver tha.",
    rating: 5,
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
  },
  {
    name: "Dr. Kenji Sato",
    country: "Japan",
    flag: "🇯🇵",
    text: "Highly respect the punctuality and support during our Skardu research expedition. Zahid, our driver, was exceptionally skilled.",
    rating: 5,
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop",
  },
];

const GALLERY_PHOTOS = [
  "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=600",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=600",
  "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=600",
  "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600",
  "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600",
];

export default function Home() {
  const { addToast } = useApp();
  const navigate = useNavigate();

  // Search autocomplete & Voice speech search state
  const [searchVal, setSearchVal] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);

  // Weather widget state
  const [selectedWeatherCity, setSelectedWeatherCity] = useState("Hunza");

  // Counter states
  const [counterTravelers, setCounterTravelers] = useState(0);
  const [counterCars, setCounterCars] = useState(0);
  const [counterPackages, setCounterPackages] = useState(0);
  const [counterGuides, setCounterGuides] = useState(0);

  // Carousel index state
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  // Accordion faq index state
  const [activeFaq, setActiveFaq] = useState(null);

  // Lightbox picture state
  const [lightboxImg, setLightboxImg] = useState(null);

  // Counting logic implementation
  useEffect(() => {
    const duration = 2000;
    const steps = 50;
    const stepTime = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCounterTravelers(Math.min(5000, Math.round((5000 / steps) * step)));
      setCounterCars(Math.min(150, Math.round((150 / steps) * step)));
      setCounterPackages(Math.min(100, Math.round((100 / steps) * step)));
      setCounterGuides(Math.min(50, Math.round((50 / steps) * step)));

      if (step >= steps) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  // Voice Search setup using Web Speech API
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast("Your browser does not support Speech Recognition.", "warning");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setVoiceListening(true);
      addToast("Listening for destination name (e.g. Hunza)...", "info");
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setSearchVal(speechToText);
      setVoiceListening(false);
      addToast(`Searched: "${speechToText}"`, "success");
      handleSearchSubmit(speechToText);
    };

    recognition.onerror = () => {
      setVoiceListening(false);
      addToast("Speech recognition failed. Try speaking again.", "error");
    };

    recognition.onend = () => {
      setVoiceListening(false);
    };

    recognition.start();
  };

  const handleSearchSubmit = (val = searchVal) => {
    if (!val) {
      addToast("Please enter a destination to search.", "warning");
      return;
    }
    // Simple redirect to tours filtered by that query
    navigate(`/tours?search=${encodeURIComponent(val)}`);
  };

  // Slideshow images for Hero section background
  const heroImages = [
    "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1920",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1920",
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1920",
  ];
  const [heroBgIdx, setHeroBgIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroBgIdx((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextTestimonial = () => {
    setTestimonialIdx((prev) => (prev + 1) % TESTIMONIALS.length);
  };
  const prevTestimonial = () => {
    setTestimonialIdx((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <div style={{ position: "relative" }}>
      {/* 1. Full-screen Hero Section with Auto Slideshow */}
      <section
        style={{
          position: "relative",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 20px",
          color: "white",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        {/* Cinematic Backdrop Slideshow */}
        {heroImages.map((img, idx) => (
          <div
            key={idx}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.6), rgba(9, 13, 26, 0.85)), url('${img}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              zIndex: -2,
              opacity: idx === heroBgIdx ? 1 : 0,
              transition: "opacity 1.5s ease-in-out",
            }}
          />
        ))}

        {/* Animated Gradient Light Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 70%)",
            zIndex: -1,
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: "850px", width: "100%", zIndex: 1 }} className="animate-fade-in">
          {/* Animated Gold Luxury badge */}
          <span
            style={{
              display: "inline-block",
              background: "rgba(245, 158, 11, 0.15)",
              color: "var(--accent)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              padding: "6px 16px",
              borderRadius: "50px",
              fontSize: "13px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginBottom: "20px",
            }}
          >
            ⭐ Pakistan's Premier Travel Partner
          </span>

          {/* Typing Title Effect */}
          <h1
            style={{
              fontFamily: "var(--heading)",
              fontSize: "clamp(32px, 5vw, 68px)",
              lineHeight: 1.1,
              marginBottom: "20px",
              fontWeight: "800",
              color: "white",
            }}
          >
            Explore Pakistan Like <br />
            <span style={{ color: "var(--secondary)" }}>Never Before</span>
          </h1>

          <p
            style={{
              fontSize: "clamp(15px, 2.5vw, 19px)",
              color: "rgba(255,255,255,0.85)",
              marginBottom: "35px",
              fontWeight: "400",
              maxWidth: "650px",
              marginInline: "auto",
            }}
          >
            Professional private guides, customized tours, and luxury vehicles (Grande, Prado, V8) for a secure, high-end experience in Skardu, Hunza & Swat.
          </p>

          {/* Search bar inside Hero Section */}
          <div
            style={{
              position: "relative",
              maxWidth: "600px",
              width: "100%",
              margin: "0 auto",
            }}
          >
            <div
              className="glass"
              style={{
                display: "flex",
                alignItems: "center",
                borderRadius: "50px",
                padding: "8px 12px 8px 24px",
                boxShadow: "var(--shadow-lg)",
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <FaSearch style={{ color: "rgba(255,255,255,0.7)", marginRight: "10px" }} />
              <input
                type="text"
                placeholder="Where do you want to travel? (e.g. Hunza)"
                value={searchVal}
                onChange={(e) => {
                  setSearchVal(e.target.value);
                  setShowSuggest(e.target.value.length > 0);
                }}
                onFocus={() => setShowSuggest(searchVal.length > 0)}
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  color: "white",
                  outline: "none",
                  fontSize: "15px",
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
              />

              {/* Voice button */}
              <button
                onClick={handleVoiceSearch}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: voiceListening ? "var(--secondary)" : "rgba(255,255,255,0.8)",
                  fontSize: "16px",
                  padding: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: voiceListening ? "pulse-glow 1.5s infinite" : "none",
                  borderRadius: "50%",
                  backgroundColor: voiceListening ? "rgba(34, 197, 94, 0.2)" : "transparent",
                  marginRight: "5px",
                }}
                title="Search with Voice"
              >
                <FaMicrophone />
              </button>

              {/* CTA Button */}
              <button
                className="btn btn-primary"
                style={{
                  borderRadius: "40px",
                  padding: "10px 24px",
                  fontSize: "14px",
                }}
                onClick={() => handleSearchSubmit()}
              >
                Find Tour
              </button>
            </div>

            {/* Autocomplete Suggestions dropdown */}
            {showSuggest && (
              <div
                className="glass-dark animate-fade-in"
                style={{
                  position: "absolute",
                  top: "65px",
                  left: 0,
                  width: "100%",
                  borderRadius: "16px",
                  padding: "10px 0",
                  textAlign: "left",
                  boxShadow: "var(--shadow-lg)",
                  zIndex: 20,
                }}
              >
                {FAMOUS_DESTINATIONS.filter((d) =>
                  d.name.toLowerCase().includes(searchVal.toLowerCase())
                ).map((dest, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "10px 20px",
                      cursor: "pointer",
                      transition: "0.2s",
                    }}
                    className="suggest-item"
                    onClick={() => {
                      setSearchVal(dest.name);
                      setShowSuggest(false);
                      handleSearchSubmit(dest.name);
                    }}
                  >
                    <div style={{ fontWeight: "600", fontSize: "14px", color: "white" }}>
                      📍 {dest.name}
                    </div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                      {dest.desc}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "15px",
              marginTop: "40px",
              flexWrap: "wrap",
            }}
          >
            <Link to="/planner" className="btn btn-accent animate-float">
              🗺️ Personalized Travel Planner
            </Link>
            <Link to="/cars" className="btn btn-outline" style={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}>
              <FaCar /> Rent Luxury Car
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Interactive Weather Forecast Panel */}
      <section style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "20px",
              marginBottom: "40px",
            }}
          >
            <div>
              <h2 style={{ fontSize: "28px", fontWeight: "800" }}>
                🌤️ Live Weather Preview
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                Check live weather forecasts to schedule your Pakistan tour safely.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {Object.keys(WEATHER_MOCKS).map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedWeatherCity(city)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "20px",
                    border: "1px solid var(--border)",
                    background: selectedWeatherCity === city ? "var(--secondary)" : "var(--bg)",
                    color: selectedWeatherCity === city ? "var(--white)" : "var(--text)",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "0.3s",
                  }}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Weather preview card */}
          <div
            className="glass"
            style={{
              borderRadius: "20px",
              padding: "30px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              alignItems: "center",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <span style={{ fontSize: "60px" }}>{WEATHER_MOCKS[selectedWeatherCity].icon}</span>
              <div>
                <h3 style={{ fontSize: "24px", color: "var(--text)" }}>{selectedWeatherCity}</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Current Weather</p>
              </div>
            </div>
            <div>
              <div style={{ fontSize: "36px", fontWeight: "800", color: "var(--secondary)" }}>
                {WEATHER_MOCKS[selectedWeatherCity].temp}
              </div>
              <div style={{ fontSize: "16px", fontWeight: "600" }}>
                {WEATHER_MOCKS[selectedWeatherCity].condition}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>Wind Speed</div>
              <div style={{ fontSize: "18px", fontWeight: "700" }}>{WEATHER_MOCKS[selectedWeatherCity].wind}</div>
            </div>
            <div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Best Booking State</div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--accent)" }}>
                🚀 Perfect time to visit!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Live Statistics Section */}
      <section style={{ background: "var(--primary)", color: "white" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "40px",
            textAlign: "center",
          }}
        >
          <div>
            <span style={{ fontSize: "40px", display: "block" }}><FaUsers style={{ color: "var(--secondary)", margin: "0 auto" }} /></span>
            <h3 style={{ fontSize: "36px", fontWeight: "800", margin: "10px 0", color: "white" }}>
              {counterTravelers}+
            </h3>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>Happy Travelers</p>
          </div>
          <div>
            <span style={{ fontSize: "40px", display: "block" }}><FaCar style={{ color: "var(--accent)", margin: "0 auto" }} /></span>
            <h3 style={{ fontSize: "36px", fontWeight: "800", margin: "10px 0", color: "white" }}>
              {counterCars}+
            </h3>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>Premium Vehicles</p>
          </div>
          <div>
            <span style={{ fontSize: "40px", display: "block" }}><FaMapMarkedAlt style={{ color: "var(--secondary)", margin: "0 auto" }} /></span>
            <h3 style={{ fontSize: "36px", fontWeight: "800", margin: "10px 0", color: "white" }}>
              {counterPackages}+
            </h3>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>Custom Packages</p>
          </div>
          <div>
            <span style={{ fontSize: "40px", display: "block" }}><FaCheck style={{ color: "var(--accent)", margin: "0 auto" }} /></span>
            <h3 style={{ fontSize: "36px", fontWeight: "800", margin: "10px 0", color: "white" }}>
              {counterGuides}+
            </h3>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>Local Tour Guides</p>
          </div>
        </div>
      </section>

      {/* 4. Beautiful Timeline Checklist (How It Works) */}
      <section style={{ backgroundColor: "var(--bg)" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "15px" }}>
            📅 How It Works (Timeline)
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "50px", maxWidth: "600px", marginInline: "auto" }}>
            A smooth, interactive verification and booking flow tailored for local & international travelers.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              position: "relative",
              gap: "35px",
            }}
          >
            {/* Timeline center line */}
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: "25px",
                width: "2px",
                backgroundColor: "var(--border)",
              }}
              className="timeline-bar"
            />

            {[
              { num: "01", title: "Inquiry Sent", desc: "Select a vehicle or tour package and send a callback or booking request." },
              { num: "02", title: "Admin Consultation", desc: "Our managers (Abdullah or Waleed) contact you to align itinerary details." },
              { num: "03", title: "Vehicle Suggested", desc: "Choose optimal cars (Grande, Prado, Hiace) based on track difficulties." },
              { num: "04", title: "Quotation Sent", desc: "Receive customized budget quotes including fuel estimation and guide fees." },
              { num: "05", title: "Verification Status", desc: "Registered users upload CNIC/Passport details for safe travel passes." },
              { num: "06", title: "Booking Confirmation", desc: "Confirm booking timeline status, driver information, and enjoy your Pakistan holiday!" },
            ].map((step, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "25px",
                  textAlign: "left",
                  position: "relative",
                }}
                className="timeline-item"
              >
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    backgroundColor: "var(--bg-card)",
                    border: "2px solid var(--secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "800",
                    color: "var(--secondary)",
                    zIndex: 2,
                  }}
                >
                  {step.num}
                </div>
                <div
                  className="card"
                  style={{
                    flex: 1,
                    padding: "20px 25px",
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <h4 style={{ fontSize: "16px", marginBottom: "5px" }}>{step.title}</h4>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Destination Explorer Cards */}
      <section style={{ backgroundColor: "var(--bg-card)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "15px" }}>
            🗺️ Explore Popular Pakistan Destinations
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "50px" }}>
            Discover majestic northern peaks, lush valleys, and cold sandy deserts.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "30px",
            }}
          >
            {FAMOUS_DESTINATIONS.map((dest, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  borderRadius: "20px",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/tours?search=${dest.key}`)}
              >
                <div style={{ position: "relative", height: "200px" }}>
                  <img
                    src={GALLERY_PHOTOS[idx % GALLERY_PHOTOS.length]}
                    alt={dest.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "0.5s" }}
                    className="zoom-image"
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "15px",
                      left: "15px",
                      background: "rgba(15,23,42,0.75)",
                      color: "white",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    ⭐ Featured
                  </div>
                </div>
                <div style={{ padding: "20px", textAlign: "left" }}>
                  <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>{dest.name}</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "15px" }}>{dest.desc}</p>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "var(--secondary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    Explore Tours <FaChevronRight size={10} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Travel Memories Lightbox Gallery */}
      <section style={{ backgroundColor: "var(--bg)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "15px" }}>
            📸 Travel Memories Gallery
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "40px" }}>
            Real customer memories, drone footage, and scenic photography clicks.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {GALLERY_PHOTOS.map((imgUrl, idx) => (
              <div
                key={idx}
                style={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  height: "250px",
                  cursor: "zoom-in",
                  position: "relative",
                }}
                className="gallery-item-card"
                onClick={() => setLightboxImg(imgUrl)}
              >
                <img
                  src={imgUrl}
                  alt="Pakistan Tourism"
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "0.3s" }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0,0,0,0.3)",
                    opacity: 0,
                    transition: "0.3s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                  className="gallery-item-hover"
                >
                  <span style={{ fontSize: "14px", fontWeight: "600" }}>🔍 View Photo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Testimonials Customer Reviews Carousel */}
      <section style={{ backgroundColor: "var(--bg-card)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "15px" }}>
            ⭐ Travelers Testimonials
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "50px" }}>
            Real reviews and feedback from verified international & national tourists.
          </p>

          <div
            className="card glass"
            style={{
              padding: "40px",
              borderRadius: "24px",
              position: "relative",
              border: "1px solid var(--border)",
            }}
          >
            {/* Nav Arrows */}
            <button
              onClick={prevTestimonial}
              style={{
                position: "absolute",
                left: "-20px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "var(--shadow)",
              }}
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={nextTestimonial}
              style={{
                position: "absolute",
                right: "-20px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "var(--shadow)",
              }}
            >
              <FaChevronRight />
            </button>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              <img
                src={TESTIMONIALS[testimonialIdx].img}
                alt="Client"
                style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", border: "3px solid var(--secondary)" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "4px", marginBottom: "15px" }}>
              {[...Array(TESTIMONIALS[testimonialIdx].rating)].map((_, i) => (
                <FaStar key={i} style={{ color: "var(--accent)" }} />
              ))}
            </div>
            <p
              style={{
                fontSize: "16px",
                fontStyle: "italic",
                lineHeight: "1.8",
                marginBottom: "25px",
                color: "var(--text)",
              }}
            >
              "{TESTIMONIALS[testimonialIdx].text}"
            </p>
            <h4 style={{ fontSize: "16px", color: "var(--text)" }}>
              {TESTIMONIALS[testimonialIdx].name}
              <span style={{ marginLeft: "10px", fontSize: "14px" }}>
                {TESTIMONIALS[testimonialIdx].flag} {TESTIMONIALS[testimonialIdx].country}
              </span>
            </h4>
            <span
              style={{
                display: "inline-block",
                marginTop: "10px",
                background: "rgba(34, 197, 94, 0.1)",
                color: "var(--secondary)",
                padding: "3px 10px",
                borderRadius: "10px",
                fontSize: "11px",
                fontWeight: "700",
              }}
            >
              Verified Traveler
            </span>
          </div>
        </div>
      </section>

      {/* 8. FAQs Accordion */}
      <section style={{ backgroundColor: "var(--bg)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "15px", textAlign: "center" }}>
            ❓ Frequently Asked Questions
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "40px", textAlign: "center" }}>
            Got questions about vehicle rentals, custom tour pricing, and guide availability?
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {[
              { q: "Is fuel cost included in the rent-a-car pricing?", a: "No, standard vehicle rent-a-car quotes exclude fuel. However, our smart calculations inside the planner can give you a highly accurate fuel estimate based on track distance and car mileage." },
              { q: "Does the car rental fee include drivers?", a: "Yes! All luxury SUV and Sedan rentals for northern tourism include experienced local mountain drivers for safety. Under specific verified packages, self-drive can be authorized by managers." },
              { q: "What documents are required to confirm booking?", a: "To complete traveler registration and obtain government border passage NOCs, users must register an account and upload passport pages or clear CNIC photos on their user profile dashboard." },
              { q: "How can I pay for my tour packages?", a: "We accept payments through Bank Transfer, EasyPaisa, and JazzCash. International travelers can consult with CEO Abdullah Khan on custom payments." },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid var(--border)",
                }}
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "20px 25px",
                    background: "var(--bg-card)",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    color: "var(--text)",
                    fontWeight: "600",
                    fontSize: "15px",
                  }}
                >
                  {faq.q}
                  <FaChevronDown
                    style={{
                      transform: activeFaq === idx ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "0.3s",
                    }}
                  />
                </button>
                {activeFaq === idx && (
                  <div
                    style={{
                      padding: "20px 25px",
                      backgroundColor: "var(--bg-card)",
                      borderTop: "1px solid var(--border)",
                      color: "var(--text-muted)",
                      fontSize: "14px",
                      lineHeight: "1.7",
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setLightboxImg(null)}
        >
          <img
            src={lightboxImg}
            alt="Expanded view"
            style={{
              maxWidth: "100%",
              maxHeight: "85vh",
              borderRadius: "16px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
            }}
          />
          <button
            onClick={() => setLightboxImg(null)}
            style={{
              position: "absolute",
              top: "25px",
              right: "25px",
              background: "none",
              border: "none",
              color: "white",
              fontSize: "30px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Styled inline components styles */}
      <style>{`
        .suggest-item:hover {
          background-color: rgba(255, 255, 255, 0.08);
        }
        .gallery-item-card:hover .gallery-item-hover {
          opacity: 1 !important;
        }
        .gallery-item-card:hover img {
          transform: scale(1.05);
        }
        .zoom-image:hover {
          transform: scale(1.08);
        }
      `}</style>
    </div>
  );
}
```

## File: [src/pages/Planner.jsx](file:///C:/Users/hp/Desktop/Khan Tourism/src/pages/Planner.jsx)

```javascript
import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import {
  FaTasks,
  FaGasPump,
  FaHotel,
  FaCar,
  FaCalculator,
  FaCheck,
  FaClock,
} from "react-icons/fa";

export default function Planner() {
  const { user, token, addToast } = useApp();
  const navigate = useNavigate();

  // Input states
  const [budget, setBudget] = useState(80000);
  const [people, setPeople] = useState(2);
  const [days, setDays] = useState(4);
  const [destination, setDestination] = useState("Hunza");

  // Output / result states
  const [loading, setLoading] = useState(false);
  const [plannerResult, setPlannerResult] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const handleGeneratePlan = (e) => {
    e.preventDefault();
    setLoading(true);
    setPlannerResult(null);

    fetch("/api/inquiries/planner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ budget, people, days, destination }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Planner calculation failed");
        return res.json();
      })
      .then((data) => {
        setPlannerResult(data);
        setLoading(false);
        addToast("Travel Plan generated successfully!", "success");
      })
      .catch((err) => {
        // Fallback calculation in case server is offline
        setTimeout(() => {
          const distances = { Hunza: 600, Skardu: 650, Swat: 250, Murree: 60 };
          const dist = distances[destination] || 150;
          const fuel = Math.round(((dist * 2) / 12) * 275);
          
          let car = "Toyota Corolla GLI";
          let hotels = "PTDC Motel / Swat Regency";
          let hotelCost = 10000;
          if (budget > 150000) {
            car = "Toyota Prado TX L";
            hotels = "Serena Golden Heights / Shangrila Resort";
            hotelCost = 35000;
          } else if (budget >= 70000) {
            car = "Toyota Corolla Grande";
            hotels = "Karimabad Serena Inn";
            hotelCost = 18000;
          }

          setPlannerResult({
            recommendedCar: car,
            suggestedHotels: hotels,
            estimatedFuelCost: fuel,
            totalEstimatedBudget: fuel + (hotelCost * days) + (days * 5000),
            tourItinerary: [
              { day: 1, title: `Road Trip to ${destination}`, description: `Depart from Islamabad, travel ${dist}km. Check-in to ${hotels}.` },
              { day: 2, title: "Scenic Valley Sightseeing", description: "Explore local historical forts, capture peak landscapes and enjoy local foods." },
              { day: 3, title: "Cultural & Lake Boating Activities", description: "Hike up viewpoints and enjoy boating or hiking activities." },
              { day: days, title: "Return drive to Islamabad", description: "Drive back safely and complete pickup checklist." }
            ]
          });
          setLoading(false);
          addToast("Travel Plan generated (Offline calculation).", "success");
        }, 1000);
      });
  };

  const handleBookPlannedTrip = () => {
    if (!user) {
      addToast("Please sign in to save or book this planned trip.", "warning");
      navigate("/profile");
      return;
    }

    // Submit custom booking inquiry to backend
    fetch("/api/tours/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tourId: "custom_planner_trip",
        startDate: new Date().toISOString().split("T")[0],
        totalDays: days,
        totalPrice: plannerResult.totalEstimatedBudget,
        peopleCount: people,
      }),
    })
      .then((res) => {
        setBookingConfirmed(true);
        addToast("Custom trip saved to your booking history!", "success");
      })
      .catch(() => {
        setBookingConfirmed(true);
        addToast("Custom trip saved (Offline demo mode).", "success");
      });
  };

  return (
    <div style={{ padding: "100px 5% 50px 5%", minHeight: "100vh" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: "800", marginBottom: "15px" }}>
            💼 Personalized Travel Planner
          </h1>
          <p style={{ color: "var(--text-muted)", maxWidth: "600px", marginInline: "auto" }}>
            Enter your parameters, and our system will calculate recommended cars, lodging, fuel expenditures, and layout a custom daily itinerary.
          </p>
        </div>

        {/* Input Form Card */}
        <form
          className="card glass"
          onSubmit={handleGeneratePlan}
          style={{
            padding: "30px",
            border: "1px solid var(--border)",
            borderRadius: "20px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "20px",
            alignItems: "end",
            marginBottom: "40px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "12px", fontWeight: "600" }}>Total Budget (PKR)</label>
            <input
              type="number"
              min="20000"
              step="5000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg)",
                color: "var(--text)",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "12px", fontWeight: "600" }}>Days of Tour</label>
            <input
              type="number"
              min="2"
              max="14"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              required
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg)",
                color: "var(--text)",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "12px", fontWeight: "600" }}>People</label>
            <input
              type="number"
              min="1"
              max="15"
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              required
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg)",
                color: "var(--text)",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "12px", fontWeight: "600" }}>Destination</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg)",
                color: "var(--text)",
                outline: "none",
              }}
            >
              <option value="Hunza">Hunza Valley</option>
              <option value="Skardu">Skardu</option>
              <option value="Swat">Swat Valley</option>
              <option value="Murree">Murree Hills</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: "11px", borderRadius: "8px" }}>
            <FaCalculator /> Plan Trip
          </button>
        </form>

        {loading && (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <div className="loader" style={{ borderTopColor: "var(--secondary)" }}></div>
            <p style={{ marginTop: "15px", color: "var(--text-muted)" }}>Running planner calculations...</p>
          </div>
        )}

        {/* Results Panel */}
        {plannerResult && !loading && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            {/* Summary details card */}
            <div
              className="card"
              style={{
                padding: "30px",
                borderRadius: "24px",
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              <h2 style={{ fontSize: "22px", marginBottom: "25px", display: "flex", alignItems: "center", gap: "10px" }}>
                🏆 Generated suggestions for {destination}
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "20px",
                  marginBottom: "30px",
                }}
              >
                {/* Car */}
                <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(34,197,94,0.1)",
                      color: "var(--secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                    }}
                  >
                    <FaCar />
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Recommended Car</span>
                    <strong style={{ fontSize: "14px" }}>{plannerResult.recommendedCar}</strong>
                  </div>
                </div>

                {/* Hotel */}
                <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(245,158,11,0.1)",
                      color: "var(--accent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                    }}
                  >
                    <FaHotel />
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Suggested Hotel</span>
                    <strong style={{ fontSize: "14px" }}>{plannerResult.suggestedHotels}</strong>
                  </div>
                </div>

                {/* Fuel Cost */}
                <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(59,130,246,0.1)",
                      color: "#3B82F6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                    }}
                  >
                    <FaGasPump />
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Estimated Fuel Cost</span>
                    <strong style={{ fontSize: "14px" }}>Rs. {plannerResult.estimatedFuelCost}</strong>
                  </div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "var(--bg)",
                  padding: "20px",
                  borderRadius: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid var(--border)",
                }}
              >
                <div>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Total Calculated Budget</span>
                  <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--secondary)" }}>
                    Rs. {plannerResult.totalEstimatedBudget}
                  </div>
                </div>

                {bookingConfirmed ? (
                  <span style={{ color: "var(--secondary)", fontWeight: "700", display: "flex", alignItems: "center", gap: "5px" }}>
                    <FaCheck /> Saved to Booking History
                  </span>
                ) : (
                  <button className="btn btn-primary" onClick={handleBookPlannedTrip}>
                    Inquire / Save Trip
                  </button>
                )}
              </div>
            </div>

            {/* Itinerary planner day list */}
            <div className="card" style={{ padding: "30px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "20px" }}>🗺️ Generated Trip Itinerary</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {plannerResult.tourItinerary.map((day, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                    <div
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "var(--secondary)",
                        color: "white",
                        borderRadius: "8px",
                        fontWeight: "700",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <FaClock size={10} /> Day {day.day}
                    </div>
                    <div>
                      <h4 style={{ fontSize: "15px", marginBottom: "4px" }}>{day.title}</h4>
                      <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6" }}>{day.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

```

## File: [src/pages/Profile.jsx](file:///C:/Users/hp/Desktop/Khan Tourism/src/pages/Profile.jsx)

```javascript
import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaKey,
  FaFileInvoice,
  FaUpload,
  FaAddressCard,
  FaHistory,
  FaHeart,
  FaEdit,
  FaCheckCircle,
  FaTimes,
  FaPhoneAlt,
} from "react-icons/fa";

export default function Profile() {
  const {
    user,
    token,
    login,
    updateProfile,
    addToast,
    compareCars,
    compareTours,
  } = useApp();

  const navigate = useNavigate();

  // Auth form states
  const [isLogin, setIsLogin] = useState(true);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");

  // Edit profile states
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAvatar, setEditAvatar] = useState("");

  // Verification document upload states
  const [cnicNo, setCnicNo] = useState("");
  const [passportNo, setPassportNo] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);

  // Active bookings list
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  // Load user profile details on mount
  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditPhone(user.phone || "");
      setEditAvatar(user.avatar || "");
      loadUserBookings();
    }
  }, [user]);

  const loadUserBookings = () => {
    // In production, we'd fetch user specific bookings. We will call admin bookings and filter for demo, or mock
    fetch("/api/admin/bookings", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        // Filter bookings for current logged-in user
        const myBookings = data.filter(
          (b) => b.user === user.id || b.user?._id === user.id || b.user === "u_test"
        );
        setBookings(myBookings);
        setBookingsLoading(false);
      })
      .catch(() => {
        // Mock fallback
        setBookings([
          {
            _id: "b_01",
            type: "Car",
            itemName: "Toyota Corolla Grande 2022",
            startDate: "2026-07-10",
            endDate: "2026-07-15",
            totalDays: 5,
            totalPrice: 75000,
            timelineStatus: "Booking Confirmed",
            details: {
              peopleCount: 4,
              driverName: "Karamat Shah",
              driverPhone: "0301-7654321",
              driverPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150",
              driverVehicleNo: "ICT-LE-392",
            },
          },
          {
            _id: "b_02",
            type: "Tour",
            itemName: "Hunza Valley Autumn Luxury Tour",
            startDate: "2026-09-12",
            totalDays: 5,
            totalPrice: 95000,
            timelineStatus: "Quotation Sent",
            details: { peopleCount: 2 },
          },
        ]);
        setBookingsLoading(false);
      });
  };

  // Sign In / Register submission handler
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      addToast("Please enter email and password.", "warning");
      return;
    }

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const bodyData = isLogin
      ? { email: authEmail, password: authPassword }
      : { name: authName, email: authEmail, password: authPassword, phone: authPhone };

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            throw new Error(err.message || "Authentication failed");
          });
        }
        return res.json();
      })
      .then((data) => {
        login(data.user, data.token);
      })
      .catch((err) => {
        // Offline test fallback
        if (isLogin) {
          if (authEmail === "admin@khantourism.com" && authPassword === "admin123") {
            login(
              { id: "u_admin", name: "Abdullah Khan", email: "admin@khantourism.com", role: "admin", verificationStatus: "verified" },
              "mock_admin_token"
            );
          } else if (authEmail === "user@gmail.com" && authPassword === "user123") {
            login(
              { id: "u_test", name: "Rana Nouman", email: "user@gmail.com", role: "user", verificationStatus: "verified" },
              "mock_user_token"
            );
          } else {
            addToast("Invalid email or password (Offline check).", "error");
          }
        } else {
          // Register mock
          login(
            { id: `u_${Date.now()}`, name: authName, email: authEmail, role: "user", verificationStatus: "none" },
            "mock_registered_token"
          );
        }
      });
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    fetch("/api/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: editName, phone: editPhone, avatar: editAvatar }),
    })
      .then((res) => res.json())
      .then((data) => {
        updateProfile(data.user);
        addToast("Profile details updated successfully!", "success");
      })
      .catch(() => {
        // Offline mock update
        updateProfile({ ...user, name: editName, phone: editPhone, avatar: editAvatar });
        addToast("Profile updated (Local session).", "success");
      });
  };

  const handleDocumentUpload = (e) => {
    e.preventDefault();
    if (!cnicNo && !passportNo) {
      addToast("Please fill in CNIC or Passport details.", "warning");
      return;
    }
    setUploadLoading(true);

    fetch("/api/auth/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ cnic: cnicNo, passport: passportNo }),
    })
      .then((res) => res.json())
      .then((data) => {
        updateProfile(data.user);
        setUploadLoading(false);
        addToast("Verification documents uploaded successfully. Pending Admin review.", "success");
      })
      .catch(() => {
        setTimeout(() => {
          updateProfile({ ...user, verificationStatus: "pending" });
          setUploadLoading(false);
          addToast("Verification pending (Offline demo).", "success");
        }, 1000);
      });
  };

  // printable invoice generator
  const handlePrintInvoice = (booking) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - Khan Tourism</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1e293b; }
            .invoice-box { max-width: 800px; margin: auto; border: 1px solid #eee; padding: 30px; box-shadow: 0 0 10px rgba(0, 0, 0, .15); }
            h1 { color: #0f172a; border-bottom: 2px solid #22c55e; padding-bottom: 10px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th, td { border-bottom: 1px solid #eee; padding: 12px; text-align: left; }
            th { background-color: #f8fafc; font-weight: bold; }
            .total { font-size: 18px; font-weight: bold; color: #22c55e; margin-top: 20px; text-align: right; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <h1>KHAN TOURISM & GUIDE</h1>
            <p><strong>Invoice ID:</strong> INV-${booking._id}</p>
            <p><strong>Customer Name:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Booking Type:</strong> ${booking.type}</p>
            <p><strong>Reserved Item:</strong> ${booking.itemName}</p>
            
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Dates / Quantity</th>
                  <th>Total Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${booking.itemName} (${booking.type} Rental)</td>
                  <td>Starts: ${booking.startDate} (${booking.totalDays} Days)</td>
                  <td>Rs. ${booking.totalPrice} PKR</td>
                </tr>
              </tbody>
            </table>
            <div class="total">Grand Total: Rs. ${booking.totalPrice} PKR</div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Timeline tracking list
  const TIMELINE_STEPS = [
    "Inquiry Sent",
    "Admin Consultation",
    "Vehicle Suggested",
    "Quotation Sent",
    "Verification",
    "Payment",
    "Booking Confirmed",
    "Enjoy Your Trip",
  ];

  if (!user) {
    return (
      <div
        style={{
          padding: "120px 20px 50px 20px",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          className="card"
          style={{
            width: "100%",
            maxWidth: "450px",
            padding: "40px",
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "24px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <h2 style={{ fontSize: "26px", fontWeight: "800" }}>
              {isLogin ? "Sign In Portal" : "Create Account"}
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "5px" }}>
              {isLogin ? "Access booking timelines & invoice PDF downloads." : "Register to upload CNIC and reserve luxury guides."}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {!isLogin && (
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600" }}>Full Name</label>
                <input
                  type="text"
                  placeholder="Zain Ali"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  required
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg)",
                    color: "var(--text)",
                    outline: "none",
                  }}
                />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600" }}>Email Address</label>
              <input
                type="email"
                placeholder="user@gmail.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--bg)",
                  color: "var(--text)",
                  outline: "none",
                }}
              />
            </div>

            {!isLogin && (
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600" }}>Contact Number</label>
                <input
                  type="tel"
                  placeholder="03001234567"
                  value={authPhone}
                  onChange={(e) => setAuthPhone(e.target.value)}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg)",
                    color: "var(--text)",
                    outline: "none",
                  }}
                />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600" }}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--bg)",
                  color: "var(--text)",
                  outline: "none",
                }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: "10px" }}>
              {isLogin ? "Log In" : "Register"}
            </button>
          </form>

          {/* Quick Mock Accounts hints */}
          {isLogin && (
            <div
              style={{
                marginTop: "20px",
                padding: "12px",
                backgroundColor: "var(--bg)",
                borderRadius: "10px",
                fontSize: "12px",
                color: "var(--text-muted)",
              }}
            >
              <div>💡 <strong>Demo User:</strong> user@gmail.com / user123</div>
              <div style={{ marginTop: "4px" }}>💡 <strong>Demo Admin:</strong> admin@khantourism.com / admin123</div>
            </div>
          )}

          <div style={{ marginTop: "25px", textAlign: "center", fontSize: "13px" }}>
            <span style={{ color: "var(--text-muted)" }}>
              {isLogin ? "Don't have an account?" : "Already registered?"}
            </span>{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              style={{
                background: "none",
                border: "none",
                color: "var(--secondary)",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              {isLogin ? "Create One" : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "100px 5% 50px 5%", minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 2.5fr",
          gap: "40px",
        }}
        className="profile-layout"
      >
        {/* Left Side: Profile & Verification cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
          {/* User Details display */}
          <div className="card" style={{ padding: "25px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "20px" }}>
              <div
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  backgroundColor: "var(--secondary)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "36px",
                  fontWeight: "bold",
                  marginBottom: "15px",
                  overflow: "hidden",
                  border: "3px solid var(--border)",
                }}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <h3 style={{ fontSize: "18px" }}>{user.name}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>{user.email}</p>

              {/* verification status badge */}
              <span
                style={{
                  display: "inline-block",
                  marginTop: "10px",
                  padding: "4px 12px",
                  borderRadius: "15px",
                  fontSize: "11px",
                  fontWeight: "800",
                  textTransform: "uppercase",
                  backgroundColor:
                    user.verificationStatus === "verified"
                      ? "rgba(34, 197, 94, 0.15)"
                      : user.verificationStatus === "pending"
                      ? "rgba(245, 158, 11, 0.15)"
                      : "rgba(100, 116, 139, 0.15)",
                  color:
                    user.verificationStatus === "verified"
                      ? "var(--secondary)"
                      : user.verificationStatus === "pending"
                      ? "var(--accent)"
                      : "var(--text-muted)",
                }}
              >
                Verification: {user.verificationStatus || "none"}
              </span>
            </div>

            <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: "600" }}>Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg)",
                    color: "var(--text)",
                    fontSize: "13px",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: "600" }}>Phone</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg)",
                    color: "var(--text)",
                    fontSize: "13px",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: "600" }}>Avatar URL</label>
                <input
                  type="text"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  placeholder="https://image-link"
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg)",
                    color: "var(--text)",
                    fontSize: "13px",
                  }}
                />
              </div>
              <button type="submit" className="btn btn-secondary" style={{ padding: "8px", fontSize: "12px", borderRadius: "6px" }}>
                <FaEdit size={10} /> Update Profile
              </button>
            </form>
          </div>

          {/* Verification documents upload card */}
          {user.verificationStatus !== "verified" && (
            <div className="card" style={{ padding: "25px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: "16px", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                <FaAddressCard style={{ color: "var(--accent)" }} /> Verify Identity
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "15px" }}>
                Provide CNIC or Passport details to unlock self-drive permissions and government NOC tourist permits.
              </p>

              <form onSubmit={handleDocumentUpload} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "600" }}>CNIC Number (National Identity)</label>
                  <input
                    type="text"
                    placeholder="37405-1234567-1"
                    value={cnicNo}
                    onChange={(e) => setCnicNo(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--bg)",
                      color: "var(--text)",
                      fontSize: "13px",
                    }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "600" }}>Passport Number (Foreigners)</label>
                  <input
                    type="text"
                    placeholder="AB1234567"
                    value={passportNo}
                    onChange={(e) => setPassportNo(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--bg)",
                      color: "var(--text)",
                      fontSize: "13px",
                    }}
                  />
                </div>

                {/* Mock File selector */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "600" }}>Upload Scanned Document Page</label>
                  <div
                    style={{
                      border: "1px dashed var(--border)",
                      borderRadius: "6px",
                      padding: "10px",
                      textAlign: "center",
                      fontSize: "11px",
                      backgroundColor: "var(--bg)",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                    }}
                    onClick={() => addToast("Scanned document selected.", "info")}
                  >
                    <FaUpload /> Choose CNIC/Passport photo
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: "8px", fontSize: "12px", borderRadius: "6px" }}
                  disabled={uploadLoading}
                >
                  {uploadLoading ? "Submitting..." : "Submit Documents"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Side: Active bookings list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
          {/* Active Bookings list */}
          <div className="card" style={{ padding: "30px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: "20px", marginBottom: "25px", display: "flex", alignItems: "center", gap: "10px" }}>
              <FaHistory /> Active Travel Bookings
            </h2>

            {bookingsLoading ? (
              <p>Loading bookings...</p>
            ) : bookings.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>You do not have any active travel reservations.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                {bookings.map((booking) => {
                  const currentStatusIdx = TIMELINE_STEPS.indexOf(booking.timelineStatus);

                  return (
                    <div
                      key={booking._id}
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: "16px",
                        padding: "20px",
                        backgroundColor: "var(--bg)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "10px",
                          marginBottom: "15px",
                        }}
                      >
                        <div>
                          <span
                            style={{
                              fontSize: "11px",
                              backgroundColor: booking.type === "Car" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                              color: booking.type === "Car" ? "var(--secondary)" : "var(--accent)",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontWeight: "700",
                              textTransform: "uppercase",
                              marginRight: "8px",
                            }}
                          >
                            {booking.type}
                          </span>
                          <strong style={{ fontSize: "15px" }}>{booking.itemName}</strong>
                        </div>
                        <button
                          className="btn btn-outline"
                          style={{ padding: "5px 10px", borderRadius: "6px", fontSize: "11px" }}
                          onClick={() => handlePrintInvoice(booking)}
                        >
                          <FaFileInvoice /> Invoice PDF
                        </button>
                      </div>

                      {/* Timeline graphic bar */}
                      <div style={{ margin: "25px 0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
                          <div style={{ position: "absolute", left: "5px", right: "5px", height: "3px", backgroundColor: "var(--border)", zIndex: 1 }} />
                          {TIMELINE_STEPS.map((step, idx) => {
                            const isPassed = idx <= currentStatusIdx;
                            const isCurrent = idx === currentStatusIdx;

                            return (
                              <div
                                key={idx}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  zIndex: 2,
                                }}
                                title={step}
                              >
                                <div
                                  style={{
                                    width: "14px",
                                    height: "14px",
                                    borderRadius: "50%",
                                    backgroundColor: isPassed ? (isCurrent ? "var(--accent)" : "var(--secondary)") : "var(--border)",
                                    border: isCurrent ? "2px solid white" : "none",
                                    transform: isCurrent ? "scale(1.3)" : "none",
                                    transition: "0.3s",
                                  }}
                                />
                                <span style={{ display: "none" }}>{step}</span>
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "var(--text-muted)", marginTop: "8px" }}>
                          <span>Inquiry Sent</span>
                          <span style={{ color: "var(--accent)", fontWeight: "700" }}>Active: {booking.timelineStatus}</span>
                          <span>Enjoy Trip</span>
                        </div>
                      </div>

                      {/* Driver details if type = Car and driver assigned */}
                      {booking.type === "Car" && booking.details?.driverName && (
                        <div
                          style={{
                            display: "flex",
                            backgroundColor: "var(--bg-card)",
                            borderRadius: "12px",
                            padding: "12px",
                            alignItems: "center",
                            gap: "15px",
                            marginTop: "15px",
                            border: "1px solid var(--border)",
                          }}
                        >
                          <img
                            src={booking.details.driverPhoto}
                            alt="Driver"
                            style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
                          />
                          <div style={{ flex: 1, fontSize: "12px" }}>
                            <strong>{booking.details.driverName}</strong> (Driver)
                            <div style={{ color: "var(--text-muted)" }}>📞 {booking.details.driverPhone} | 🚗 {booking.details.driverVehicleNo}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .profile-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

```

## File: [src/pages/Tours.jsx](file:///C:/Users/hp/Desktop/Khan Tourism/src/pages/Tours.jsx)

```javascript
import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaCompass,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaStar,
  FaTimes,
  FaExchangeAlt,
  FaCloudSun,
  FaRoute,
  FaPrint,
  FaInfoCircle,
} from "react-icons/fa";

export default function Tours() {
  const {
    user,
    token,
    addToCompareTours,
    compareTours,
    removeFromCompareTours,
    addToast,
  } = useApp();

  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // Modal Details state
  const [activeTourDetails, setActiveTourDetails] = useState(null);

  // Booking states
  const [selectedTour, setSelectedTour] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [people, setPeople] = useState(1);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Currency Converter Widget states
  const [pkrAmount, setPkrAmount] = useState(100000);
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [convertedVal, setConvertedVal] = useState(0);

  const navigate = useNavigate();

  // Exchange rates mock
  const RATES = {
    USD: 0.0036, // 1 PKR = 0.0036 USD (roughly 278 PKR/USD)
    EUR: 0.0033,
    GBP: 0.0028,
    JPY: 0.57,
  };

  useEffect(() => {
    // Run initial conversion
    setConvertedVal(Math.round(pkrAmount * RATES[currencyCode] * 100) / 100);
  }, [pkrAmount, currencyCode]);

  // Fetch tour packages from Express
  useEffect(() => {
    fetch("/api/tours")
      .then((res) => res.json())
      .then((data) => {
        setTours(data);
        setLoading(false);
      })
      .catch((err) => {
        // Fallback mock tours data
        setTours([
          {
            _id: "t_hunza",
            name: "Hunza Valley Autumn Luxury Tour",
            days: "5 Days / 4 Nights",
            price: 95000,
            image: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1000",
            category: "Adventure",
            description: "Experience the mesmerizing autumn colors of Hunza Valley. This premium tour package includes guided road travel in Prado SUVs, top-tier accommodations, dynamic local meals, and sightseeing entry passes.",
            highlights: ["Attabad Lake Boating", "Altit & Baltit Fort tours", "Passu Cones Sightseeing", "Khunjerab Pass (China Border)"],
            itinerary: [
              { day: 1, title: "Departure from Islamabad", description: "Drive to Chilas/Naran via Hazara Motorway. Stay in Serena hotel or equivalent." },
              { day: 2, title: "Journey to Karimabad (Hunza)", description: "Pass by meeting place of 3 mountain ranges. Check-in to Hunza hotel and explore local bazaar." },
              { day: 3, title: "Altit Fort & Attabad Lake", description: "Visit the historical Altit & Baltit Forts. Boat ride on the pristine turquoise Attabad Lake." },
              { day: 4, title: "Passu Cones & China Border", description: "Sightseeing of majestic Passu Cones. Drive to Khunjerab Pass (highest paved border crossing)." },
              { day: 5, title: "Return Voyage to Islamabad", description: "Drive back to Islamabad with memories of beautiful valleys." }
            ],
            bestTime: "September to November",
            activities: ["Sightseeing", "Boating", "Photography", "Cultural Tours"],
            weatherInfo: "Average temperature: 8°C - 15°C in autumn. Nights are chilly.",
            packingChecklist: ["Heavy jacket", "Gloves", "Thermal wear", "Hiking boots", "Sunglasses"]
          },
          {
            _id: "t_skardu",
            name: "Skardu Majestic Peaks Tour",
            days: "7 Days / 6 Nights",
            price: 135000,
            image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000",
            category: "Adventure",
            description: "Explore the giant Karakoram peaks, cold deserts, and high-altitude lakes of Skardu. Best suited for families looking for raw beauty with luxury arrangements.",
            highlights: ["Shangrila Resort visit", "Upper Kachura Lake boating", "Katpana Cold Desert Safari", "Deosai Plains expedition"],
            itinerary: [
              { day: 1, title: "Fly to Skardu or road travel", description: "Arrive at Skardu, check-in to hotel and relax." },
              { day: 2, title: "Shangrila & Kachura Lakes", description: "Explore the iconic Shangrila Resort. Hike up to Upper Kachura Lake." },
              { day: 3, title: "Shigar Valley Fort", description: "Drive to Shigar. Visit Shigar Fort and enjoy local Balti cuisine." },
              { day: 4, title: "Deosai National Park", description: "Day trip to the second highest plateau in the world, Deosai Plains. Spot Himalayan bears." },
              { day: 5, title: "Katpana Sand Dunes", description: "Visit the unique cold desert dunes at Katpana. Enjoy desert quad biking." },
              { day: 6, title: "Manthoka Waterfall", description: "Drive to Manthoka and enjoy a local picnic lunch." },
              { day: 7, title: "Departure", description: "Flight back or road departure to Islamabad." }
            ],
            bestTime: "June to September",
            activities: ["Jeep Safari", "Trekking", "Camping", "Lakeside Boating"],
            weatherInfo: "Sunny days (20°C) with cold winds. Very pleasant summers.",
            packingChecklist: ["Windcheater jacket", "Hiking poles", "Sunblock cream", "Light woolens"]
          },
          {
            _id: "t_swat",
            name: "Swat Valley & Kalam Family Retreat",
            days: "4 Days / 3 Nights",
            price: 65000,
            image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1000",
            category: "Family",
            description: "The Switzerland of East, Swat, offers lush green meadows, gushing rivers, and pine forests. This budget-friendly family tour covers all top sightseeing sites.",
            highlights: ["Malam Jabba Ski Resort", "Fizagat Park riverfront", "Kalam Forest walk", "Ushu Forest safari"],
            itinerary: [
              { day: 1, title: "Drive to Mingora (Swat)", description: "Travel via Swat Motorway. Check-in to hotel. Riverside evening walk." },
              { day: 2, title: "Malam Jabba Day Tour", description: "Enjoy chairlift rides, ziplines, and winter skiing (seasonal) at Malam Jabba." },
              { day: 3, title: "Kalam Forest Expedition", description: "Drive to Kalam. Visit the ancient Ushu pine forest and Mahodand Lake." },
              { day: 4, title: "Return Drive", description: "Explore local handicrafts bazaar and drive back to Islamabad." }
            ],
            bestTime: "April to October",
            activities: ["Chairlift", "Zipline", "River rafting", "Meadow walks"],
            weatherInfo: "Temperate summers around 24°C. Very pleasant weather.",
            packingChecklist: ["Light jacket", "Comfortable sneakers", "Umbrella", "Personal medicine kit"]
          }
        ]);
        setLoading(false);
      });
  }, []);

  const handleOpenBooking = (tour) => {
    if (!user) {
      addToast("Please login to proceed with booking inquiries.", "warning");
      navigate("/profile");
      return;
    }
    setSelectedTour(tour);
    setStartDate("");
    setPeople(1);
    setBookingConfirmed(false);
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!startDate) {
      addToast("Please select a tour start date.", "warning");
      return;
    }

    fetch("/api/tours/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tourId: selectedTour._id,
        startDate,
        totalDays: selectedTour.days.split(" ")[0] || 5,
        totalPrice: selectedTour.price * people,
        peopleCount: people,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("API Booking failed");
        return res.json();
      })
      .then((data) => {
        setBookingConfirmed(true);
        addToast(`Successfully booked inquiry for ${selectedTour.name}!`, "success");
      })
      .catch((err) => {
        // Fallback for offline demo
        setBookingConfirmed(true);
        addToast("Tour inquiry registered successfully (Offline mode).", "success");
      });
  };

  // Printable print view trigger
  const handlePrintItinerary = (tour) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>${tour.name} Itinerary - Khan Tourism</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            h1 { color: #0f172a; border-bottom: 2px solid #22c55e; padding-bottom: 10px; }
            h2 { color: #0f172a; margin-top: 30px; }
            .meta { font-size: 14px; color: #64748b; margin-bottom: 20px; }
            .day-card { border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
            .day-title { font-weight: bold; color: #22c55e; margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <h1>${tour.name}</h1>
          <div class="meta">
            <p><strong>Duration:</strong> ${tour.days}</p>
            <p><strong>Best Time:</strong> ${tour.bestTime}</p>
            <p><strong>Estimated Pricing:</strong> Rs. ${tour.price} Base Package</p>
          </div>
          <p>${tour.description}</p>
          
          <h2>Detailed Day-by-Day Itinerary</h2>
          ${tour.itinerary.map(
            (day) => `
            <div class="day-card">
              <div class="day-title">Day ${day.day} - ${day.title}</div>
              <p>${day.description}</p>
            </div>
          `
          ).join("")}

          <h2>Recommended Packing Checklist</h2>
          <ul>
            ${tour.packingChecklist.map((item) => `<li>${item}</li>`).join("")}
          </ul>
          <p style="margin-top: 40px; font-size: 12px; color: #94a3b8; text-align: center;">
            © 2026 Khan Tourism & Guide Pakistan. All rights reserved.
          </p>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Filtering + Searching logic
  const filteredTours = tours.filter((t) => {
    const matchesFilter = filter === "ALL" || t.category === filter;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ padding: "100px 5% 50px 5%", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Page Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: "800", marginBottom: "15px" }}>
            🗺️ Pakistan Tour Packages
          </h1>
          <p style={{ color: "var(--text-muted)", maxWidth: "600px", marginInline: "auto" }}>
            Handpicked customized itineraries with private transport, safety guides and luxury stays across Hunza, Skardu, and Kalam.
          </p>
        </div>

        {/* Smart widgets side-by-side panel */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          {/* Currency Converter widget */}
          <div className="card glass" style={{ padding: "20px", border: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "15px" }}>💱 Currency Converter (For Guests)</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="number"
                  value={pkrAmount}
                  onChange={(e) => setPkrAmount(e.target.value)}
                  placeholder="Amount in PKR"
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg)",
                    color: "var(--text)",
                    outline: "none",
                  }}
                />
                <select
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value)}
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg)",
                    color: "var(--text)",
                  }}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--secondary)" }}>
                Rs. {pkrAmount} PKR = {convertedVal} {currencyCode}
              </div>
            </div>
          </div>

          {/* Quick Distance lookup widget */}
          <div className="card glass" style={{ padding: "20px", border: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "15px" }}>🚗 Northern Track Difficulty</h3>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div>📍 <strong>Islamabad to Murree:</strong> 60 km (1.5 hours, Easy Asphalt)</div>
              <div>📍 <strong>Islamabad to Swat:</strong> 250 km (3.5 hours, Expressway, Moderate)</div>
              <div>📍 <strong>Islamabad to Hunza:</strong> 600 km (12 hours, Karakoram Highway, Hard)</div>
              <div>📍 <strong>Islamabad to Skardu:</strong> 650 km (13 hours, Jaglot Mountain Road, Extreme)</div>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
            marginBottom: "30px",
            borderBottom: "1px solid var(--border)",
            paddingBottom: "20px",
          }}
        >
          {/* Categories */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {["ALL", "Adventure", "Family", "Honeymoon"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: "1px solid var(--border)",
                  background: filter === cat ? "var(--secondary)" : "var(--bg-card)",
                  color: filter === cat ? "var(--white)" : "var(--text)",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "0.2s",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <input
            type="text"
            placeholder="Filter tours by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "10px 16px",
              borderRadius: "30px",
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg-card)",
              color: "var(--text)",
              width: "250px",
              outline: "none",
            }}
          />
        </div>

        {/* Directory Grid */}
        {filteredTours.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px", color: "var(--text-muted)" }}>
            No tour packages found matching your criteria.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "30px",
            }}
          >
            {filteredTours.map((tour) => {
              const isComparing = compareTours.some((t) => t._id === tour._id);
              return (
                <div
                  key={tour._id}
                  className="card"
                  style={{
                    borderRadius: "20px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ position: "relative", height: "230px" }}>
                    <img
                      src={tour.image}
                      alt={tour.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: "15px",
                        left: "15px",
                        backgroundColor: "var(--primary)",
                        color: "white",
                        padding: "5px 12px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {tour.days}
                    </div>
                  </div>

                  <div style={{ padding: "25px", display: "flex", flexDirection: "column", flex: 1 }}>
                    <h3 style={{ fontSize: "19px", marginBottom: "10px" }}>{tour.name}</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: "1.6", marginBottom: "20px" }}>
                      {tour.description.substring(0, 120)}...
                    </p>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "auto",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Estimated Package</div>
                        <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--secondary)" }}>
                          Rs. {tour.price}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        {/* Compare toggle */}
                        <button
                          onClick={() => {
                            if (isComparing) {
                              removeFromCompareTours(tour._id);
                            } else {
                              addToCompareTours(tour);
                            }
                          }}
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            border: "1px solid var(--border)",
                            backgroundColor: isComparing ? "var(--accent)" : "var(--bg-card)",
                            color: isComparing ? "var(--primary)" : "var(--text)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title="Compare side-by-side"
                        >
                          <FaExchangeAlt />
                        </button>

                        <button
                          className="btn btn-secondary"
                          style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "13px" }}
                          onClick={() => setActiveTourDetails(tour)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tour Detail Modal Dialog overlay */}
      {activeTourDetails && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(6px)",
            zIndex: 1002,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "700px",
              backgroundColor: "var(--bg-card)",
              borderRadius: "24px",
              padding: "30px",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => setActiveTourDetails(null)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
                color: "var(--text)",
              }}
            >
              <FaTimes />
            </button>

            <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>{activeTourDetails.name}</h2>
            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
              <span>⏱️ <strong>Duration:</strong> {activeTourDetails.days}</span>
              <span>📅 <strong>Best season:</strong> {activeTourDetails.bestTime}</span>
              <span>💰 <strong>Package price:</strong> Rs. {activeTourDetails.price}</span>
            </div>

            <p style={{ fontSize: "14px", lineHeight: "1.7", marginBottom: "25px" }}>
              {activeTourDetails.description}
            </p>

            {/* highlights box */}
            <div
              style={{
                backgroundColor: "var(--bg)",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "25px",
                border: "1px solid var(--border)",
              }}
            >
              <h4 style={{ fontSize: "14px", marginBottom: "10px", color: "var(--text)" }}>✨ Key Highlights</h4>
              <ul style={{ paddingLeft: "20px", fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.8" }}>
                {activeTourDetails.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>

            {/* Timeline Day-by-Day itinerary */}
            <h4 style={{ fontSize: "15px", marginBottom: "15px" }}>📅 Daily Tour Itinerary</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "25px" }}>
              {activeTourDetails.itinerary.map((day) => (
                <div key={day.day} style={{ display: "flex", gap: "15px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: "var(--secondary)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "700",
                      flexShrink: 0,
                    }}
                  >
                    D{day.day}
                  </div>
                  <div>
                    <h5 style={{ fontSize: "14px", color: "var(--text)" }}>{day.title}</h5>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>{day.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Smart checklists panel */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
              <div>
                <h5 style={{ fontSize: "14px", marginBottom: "8px" }}>🎒 Packing Checklist</h5>
                <ul style={{ fontSize: "12px", paddingLeft: "15px", color: "var(--text-muted)" }}>
                  {activeTourDetails.packingChecklist.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 style={{ fontSize: "14px", marginBottom: "8px" }}><FaCloudSun /> Weather Warning</h5>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {activeTourDetails.weatherInfo || "Weather averages around 15°C. Check forecasting before travel."}
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "15px" }}>
              <button
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => handlePrintItinerary(activeTourDetails)}
              >
                <FaPrint /> Print / Save PDF
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  setActiveTourDetails(null);
                  handleOpenBooking(activeTourDetails);
                }}
              >
                Book This Tour
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal dialog */}
      {selectedTour && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 1002,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "450px",
              backgroundColor: "var(--bg-card)",
              borderRadius: "24px",
              padding: "30px",
              position: "relative",
            }}
          >
            <button
              onClick={() => setSelectedTour(null)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
                color: "var(--text)",
              }}
            >
              <FaTimes />
            </button>

            {bookingConfirmed ? (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <span style={{ fontSize: "56px", display: "block", marginBottom: "15px" }}>📅</span>
                <h3 style={{ fontSize: "22px", color: "var(--secondary)", marginBottom: "10px" }}>
                  Tour Booking Initiated!
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "25px" }}>
                  Your tour package inquiry has been logged. Our booking representatives will contact you shortly to confirm hotel allocations and travel dates.
                </p>
                <button className="btn btn-secondary" style={{ width: "100%" }} onClick={() => setSelectedTour(null)}>
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <h3 style={{ fontSize: "18px" }}>Book {selectedTour.name}</h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Timeline status will initiate as "Inquiry Sent" under your user profile.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "600" }}>Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--bg)",
                      color: "var(--text)",
                      outline: "none",
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "600" }}>Number of People</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={people}
                    onChange={(e) => setPeople(e.target.value)}
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--bg)",
                      color: "var(--text)",
                      outline: "none",
                    }}
                  />
                </div>

                <div
                  style={{
                    padding: "15px",
                    backgroundColor: "rgba(34, 197, 94, 0.08)",
                    borderRadius: "12px",
                    fontSize: "14px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Estimated Cost:</span>
                    <strong>Rs. {selectedTour.price * people}</strong>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary">
                  Submit Reservation Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

## File: [TODO.md](file:///C:/Users/hp/Desktop/Khan Tourism/TODO.md)

```markdown
# KHAN TOURISM — Build Plan

## Phase 0 — Architecture + cleanup
- [x] Inspect and refactor `src/App.jsx` to use page components from `src/pages/*` (single source of truth)
- [x] Remove/stop using duplicated inline mock pages currently embedded in `src/App.jsx`
- [ ] Ensure navigation links match actual routes
- [ ] Smoke-test routing locally (dev server) 


## Phase 1 — Landing page
- [ ] Upgrade `src/pages/Home.jsx` and/or add landing section components to match the requested hero + sections

## Phase 2 — Vehicle management
- [ ] Build vehicle gallery listing + filters
- [ ] Add vehicle details page with rich specs

## Phase 3 — Tour packages + booking inquiry
- [ ] Build tours listing + tour detail page
- [ ] Implement inquiry flow (frontend MVP)

## Phase 4 — Auth + verification + profile
- [ ] Add login/register/forgot/password reset pages (frontend)
- [ ] Add verification upload UI + status

## Phase 5 — Backend + admin dashboard
- [ ] Create Node/Express/MongoDB backend structure
- [ ] Implement admin APIs and admin dashboard UI

## Phase 6 — Payments + notifications + maps
- [ ] Add payment UI + backend integration (start with Stripe)
- [ ] Add notifications + maps + driver tracking MVP

## Phase 7 — UX polish + multilingual + premium features
- [ ] Implement i18n structure
- [ ] Add animation/loading skeletons/back-to-top


```

## File: [vite.config.js](file:///C:/Users/hp/Desktop/Khan Tourism/vite.config.js)

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})

```

