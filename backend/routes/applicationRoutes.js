
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const {
    applyForJob,
    getMyApplications,
    getJobApplicants,
    updateApplicationStatus,
    getAllRecruiterApplications
} = require("../controllers/applicationController");

// Candidate routes
router.post(
    "/",
    protect,
    authorizeRoles("candidate"),
    applyForJob
);

router.get(
    "/my-applications",
    protect,
    authorizeRoles("candidate"),
    getMyApplications
);

// Recruiter routes
router.get(
    "/recruiter/all",
    protect,
    authorizeRoles("recruiter"),
    getAllRecruiterApplications
);

router.get(
    "/job/:jobId",
    protect,
    authorizeRoles("recruiter"),
    getJobApplicants
);

router.patch(
    "/:applicationId/status",
    protect,
    authorizeRoles("recruiter"),
    updateApplicationStatus
);

module.exports = router;
