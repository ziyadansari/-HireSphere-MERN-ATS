
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const {
    scheduleInterview,
    rescheduleInterview,
    cancelInterview,
    getMyInterviews,
    getRecruiterInterviews,
    completeInterview
} = require("../controllers/interviewController");
// Candidate
router.get(
    "/my-interviews",
    protect,
    authorizeRoles("candidate"),
    getMyInterviews
);

// Recruiter
router.post(
    "/",
    protect,
    authorizeRoles("recruiter"),
    scheduleInterview
);

router.get(
    "/recruiter",
    protect,
    authorizeRoles("recruiter"),
    getRecruiterInterviews
);

router.patch(
    "/:id/reschedule",
    protect,
    authorizeRoles("recruiter"),
    rescheduleInterview
);

router.patch(
    "/:id/cancel",
    protect,
    authorizeRoles("recruiter"),
    cancelInterview
);
router.patch("/:id/complete", protect, authorizeRoles("recruiter"), completeInterview);

module.exports = router;
