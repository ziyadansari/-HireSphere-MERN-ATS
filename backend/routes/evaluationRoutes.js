
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const {
    createEvaluation,
    getInterviewEvaluations,
    getRecruiterEvaluations,
    updateEvaluation
} = require("../controllers/evaluationController");

router.post(
    "/",
    protect,
    authorizeRoles("recruiter"),
    createEvaluation
);

router.get(
    "/recruiter",
    protect,
    authorizeRoles("recruiter"),
    getRecruiterEvaluations
);

router.get(
    "/interview/:interviewId",
    protect,
    authorizeRoles("recruiter"),
    getInterviewEvaluations
);

router.patch(
    "/:id",
    protect,
    authorizeRoles("recruiter"),
    updateEvaluation
);

module.exports = router;
