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
