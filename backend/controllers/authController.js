
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");


// Email transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD?.replace(/\s/g, "")
    }
});


// Register User
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide name, email and password"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const userRole = role || "candidate";

        if (!["candidate", "recruiter"].includes(userRole)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role: userRole
        });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Login User
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Forgot Password

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If the email is registered, a reset link will be sent"
            });
        }

        // Generate secure reset token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Store hashed token
        user.resetPasswordToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        // Expire after 15 minutes
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

        await user.save();

        const resetUrl =
            `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        try {
            await transporter.sendMail({
                from: process.env.SMTP_EMAIL,
                to: user.email,
                subject: "HireSphere Password Reset",
                html: `
                    <h2>Reset Your HireSphere Password</h2>
                    <p>You requested a password reset.</p>
                    <a href="${resetUrl}">Reset Password</a>
                    <p>This link expires in 15 minutes.</p>
                    <p>If you did not request this, ignore this email.</p>
                `
            });

        } catch (emailError) {
            console.error("SMTP ERROR:", emailError);

            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();

            throw emailError;
        }

        return res.status(200).json({
            success: true,
            message: "If the email is registered, a reset link will be sent"
        });

    } catch (error) {
        console.error("FORGOT PASSWORD ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to send password reset email"
        });
    }
};



// Reset Password
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "New password is required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        // Hash the token received from the reset link
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // Find user with a valid, unexpired token
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset link"
            });
        }

        // Hash the new password
        user.password = await bcrypt.hash(password, 10);

        // Make the reset link unusable
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successfully. Please log in."
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword
};

console.log("SMTP HOST:", process.env.SMTP_HOST);
console.log("SMTP PORT:", process.env.SMTP_PORT);
console.log("SMTP EMAIL:", process.env.SMTP_EMAIL);
console.log(
    "SMTP PASSWORD LOADED:",
    Boolean(process.env.SMTP_PASSWORD)
);