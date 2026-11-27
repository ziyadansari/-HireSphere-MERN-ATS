
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const {
    getAllUsers,
    getUserById,
    updateUserStatus
} = require("../controllers/adminUserController");

// All routes require admin authentication
router.use(protect, authorizeRoles("admin"));

// GET all users
router.get("/", getAllUsers);

// GET one user
router.get("/:id", getUserById);

// Activate or deactivate user
router.patch("/:id/status", updateUserStatus);

module.exports = router;
