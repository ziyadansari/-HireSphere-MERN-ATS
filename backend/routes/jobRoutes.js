const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");



const {
    createJob,
    getAllJobs,
    getMyJobs,
    getJobById,
    updateJob,
    deleteJob
} = require("../controllers/jobController");




const {
    saveJob,
    unsaveJob,
    getSavedJobs
} = require("../controllers/savedJobController");


// Candidate saved jobs
router.get(
    "/saved",
    protect,
    authorizeRoles("candidate"),
    getSavedJobs
);

router.post(
    "/:id/save",
    protect,
    authorizeRoles("candidate"),
    saveJob
);

router.delete(
    "/:id/save",
    protect,
    authorizeRoles("candidate"),
    unsaveJob
);


// Get all active jobs (public route)
router.get("/", getAllJobs);


// Get jobs posted by logged-in recruiter
router.get(
    "/my-jobs",
    protect,
    authorizeRoles("recruiter"),
    getMyJobs
);

// Get single job by ID
router.get("/:id", getJobById);

// Create job (recruiter only)
router.post(
    "/",
    protect,
    authorizeRoles("recruiter"),
    createJob
);
// Update job (recruiter only)
router.put(
    "/:id",
    protect,
    authorizeRoles("recruiter"),
    updateJob
);


// Delete job (recruiter only)
router.delete(
    "/:id",
    protect,
    authorizeRoles("recruiter"),
    deleteJob
);


module.exports = router;