const express = require("express");
const { 
  getVolunteers, 
  createVolunteer, 
  updateVolunteer, 
  deleteVolunteer 
} = require("../controllers/volunteerController");
const { authenticate, requireModulePermission } = require("../middlewares/authMiddleware");

const router = express.Router();

// Protected routes
router.use(authenticate);

// Get all volunteers
router.get("/", requireModulePermission("volunteers", "read"), getVolunteers);

// Create new volunteer
router.post("/", requireModulePermission("volunteers", "create"), createVolunteer);

// Update volunteer
router.put("/:id", requireModulePermission("volunteers", "update"), updateVolunteer);

// Delete volunteer
router.delete("/:id", requireModulePermission("volunteers", "delete"), deleteVolunteer);

module.exports = router; 