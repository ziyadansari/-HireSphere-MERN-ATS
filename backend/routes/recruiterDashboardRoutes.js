const express = require("express");
const router = express.Router();

const {
    getRecruiterDashboard
} = require("../controllers/recruiterDashboardController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.get("/", protect, authorizeRoles("recruiter"), getRecruiterDashboard);

module.exports = router;