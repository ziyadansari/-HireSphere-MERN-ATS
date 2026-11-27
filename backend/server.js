
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");

const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const companyRoutes = require("./routes/companyRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const evaluationRoutes = require("./routes/evaluationRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");
const adminJobRoutes = require("./routes/adminJobRoutes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");
const recruiterDashboardRoutes = require("./routes/recruiterDashboardRoutes");

const app = express();

// 1. Security headers
app.use(helmet());

// 2. CORS configuration
const allowedOrigin =
    process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests without an Origin header (e.g. Thunder Client)
        if (!origin || origin === allowedOrigin) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    }
}));

// 3. Parse JSON
app.use(express.json({ limit: "10kb" }));

// 4. Global API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});

app.use("/api", apiLimiter);

// 5. API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/jobs", adminJobRoutes);
app.use("/api/recruiter/dashboard", recruiterDashboardRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);


// 6. Home route
app.get("/", (req, res) => {
    res.status(200).send("Welcome to HireSphere API");
});

// 7. 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// 8. Centralized error handler
app.use((error, req, res, next) => {
    console.error("Server Error:", error.message);

    if (error.message === "Not allowed by CORS") {
        return res.status(403).json({
            success: false,
            message: "This origin is not allowed"
        });
    }

    res.status(error.status || 500).json({
        success: false,
        message:
            process.env.NODE_ENV === "production"
                ? "Internal server error"
                : error.message
    });
});

// 9. Start server after database connection
const startServer = async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();
