const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const {
    getAdminDashboard
} = require("../controllers/adminDashboardController");

router.use(protect, authorizeRoles("admin"));

router.get("/", getAdminDashboard);

module.exports = router;