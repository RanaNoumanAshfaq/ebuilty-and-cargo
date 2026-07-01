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
