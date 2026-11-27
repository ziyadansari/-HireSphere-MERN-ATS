
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const {
    getAdminDashboard
} = require("../controllers/adminDashboardController");

const {
    getProfile,
    updateProfile
} = require("../controllers/profileController");

const {
    getRecruiterDashboard
} = require("../controllers/recruiterDashboardController");

const resumeUpload = require("../middleware/uploadMiddleware");

const {
    uploadResume,
    getResume
} = require("../controllers/resumeController");

// Candidate profile routes
router.get(
    "/profile",
    protect,
    authorizeRoles("candidate"),
    getProfile
);

router.put(
    "/profile",
    protect,
    authorizeRoles("candidate"),
    updateProfile
);

// Recruiter dashboard
router.get(
    "/recruiter-dashboard",
    protect,
    authorizeRoles("recruiter"),
    getRecruiterDashboard
);

// Admin dashboard 
router.get(
    "/admin-dashboard",
    protect,
    authorizeRoles("admin"),
    getAdminDashboard
);

// Candidate resume routes
router.post(
    "/resume",
    protect,
    authorizeRoles("candidate"),
    resumeUpload,
    uploadResume
);

router.get(
    "/resume",
    protect,
    authorizeRoles("candidate"),
    getResume
);

module.exports = router;
