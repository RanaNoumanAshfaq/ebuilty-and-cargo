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
