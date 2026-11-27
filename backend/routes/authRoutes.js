
const express = require("express");
const router = express.Router();

const { body, param, validationResult } = require("express-validator");
const { rateLimit } = require("express-rate-limit");

const {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword
} = require("../controllers/authController");

// Return validation errors
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg
            }))
        });
    }

    next();
};

// Authentication rate limiter
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many authentication requests. Try again later."
    }
});

router.use(authLimiter);

// Registration
router.post(
    "/register",
    [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Name is required"),

        body("email")
            .trim()
            .isEmail()
            .withMessage("Please provide a valid email"),

        body("password")
            .isString()
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters"),

        body("role")
            .optional()
            .isIn(["candidate", "recruiter"])
            .withMessage("Invalid role")
    ],
    validateRequest,
    registerUser
);

// Login
router.post(
    "/login",
    [
        body("email")
            .trim()
            .isEmail()
            .withMessage("Please provide a valid email"),

        body("password")
            .notEmpty()
            .withMessage("Password is required")
    ],
    validateRequest,
    loginUser
);

// Forgot password
router.post(
    "/forgot-password",
    [
        body("email")
            .trim()
            .isEmail()
            .withMessage("Please provide a valid email")
    ],
    validateRequest,
    forgotPassword
);

// Reset password
router.put(
    "/reset-password/:token",
    [
        param("token")
            .matches(/^[a-f0-9]{64}$/i)
            .withMessage("Invalid reset token"),

        body("password")
            .isString()
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters")
    ],
    validateRequest,
    resetPassword
);

module.exports = router;
