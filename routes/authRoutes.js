const express = require("express");
const { 
  loginUser, 
  registerUser, 
  getUserDetails,
  logoutUser,
  updateUser
} = require("../controllers/authController");
const { 
  authenticate, 
  requireRole,
  requirePermission,
  requireGeoAccess,
  requireHigherRole
} = require("../middlewares/authMiddleware");

const router = express.Router();

// Public routes (no authentication required)
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);

// Protected routes (require authentication)
router.get("/profile", authenticate, getUserDetails);
router.put("/profile", authenticate, updateUser);

// Role-based protected routes
router.get("/admin/dashboard", authenticate, requireRole(["super-admin", "country-admin"]), (req, res) => {
  res.json({ message: "Admin dashboard accessed successfully" });
});

// Permission-based protected routes
router.get("/reports", authenticate, requirePermission("view-reports"), (req, res) => {
  res.json({ message: "Reports accessed successfully" });
});

// Geographic access protected routes
router.get("/regional-data", authenticate, requireGeoAccess("region"), (req, res) => {
  res.json({ message: "Regional data accessed successfully" });
});

// Admin management routes
router.post("/admins", authenticate, requireHigherRole(), (req, res) => {
  res.json({ message: "Admin created successfully" });
});

// Complex combined protection example
router.get("/country-dashboard", 
  authenticate,
  requireRole(["country-admin"]),
  requireGeoAccess("country"),
  requirePermission("view-dashboard"),
  (req, res) => {
    res.json({ message: "Country dashboard accessed successfully" });
  }
);

module.exports = router;