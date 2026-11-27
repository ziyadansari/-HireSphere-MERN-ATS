const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");


const {
    createCompany,
    getMyCompanies,
    getPendingCompanies,
    approveCompany
} = require("../controllers/companyController");

// Recruiter routes
router.post(
    "/",
    protect,
    authorizeRoles("recruiter"),
    createCompany
);

router.get(
    "/my-companies",
    protect,
    authorizeRoles("recruiter"),
    getMyCompanies
);
router.patch(
    "/:id/approve",
    protect,
    authorizeRoles("admin"),
    approveCompany
);

// Admin route: View pending companies
router.get(
    "/pending",
    protect,
    authorizeRoles("admin"),
    getPendingCompanies
);

module.exports = router;