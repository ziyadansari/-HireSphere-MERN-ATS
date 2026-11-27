
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const {
    getAllAdminJobs,
    approveJob,
    rejectJob,
    deleteAdminJob
} = require("../controllers/adminJobController");

router.use(protect, authorizeRoles("admin"));

router.get("/", getAllAdminJobs);

router.patch("/:id/approve", approveJob);

router.patch("/:id/reject", rejectJob);

router.delete("/:id", deleteAdminJob);

module.exports = router;
