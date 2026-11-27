
const mongoose = require("mongoose");
const User = require("../models/userModel");

// 1. Get all users with search, filter and pagination
const getAllUsers = async (req, res) => {
    try {
        const {
            search = "",
            role = "",
            page = 1,
            limit = 10
        } = req.query;

        const currentPage = Math.max(1, Number(page) || 1);
        const pageLimit = Math.min(100, Math.max(1, Number(limit) || 10));

        const filter = {};

        // Search by name or email
        if (search.trim()) {
            const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

            filter.$or = [
                { name: { $regex: safeSearch, $options: "i" } },
                { email: { $regex: safeSearch, $options: "i" } }
            ];
        }

        // Filter by role
        if (role) {
            if (!["admin", "recruiter", "candidate"].includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid user role"
                });
            }

            filter.role = role;
        }

        const totalUsers = await User.countDocuments(filter);

        const users = await User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * pageLimit)
            .limit(pageLimit);

        res.status(200).json({
            success: true,
            totalUsers,
            currentPage,
            totalPages: Math.ceil(totalUsers / pageLimit),
            users
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 2. Get one user's details
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const user = await User.findById(id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 3. Activate or deactivate a user
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isActive must be true or false"
            });
        }

        // Prevent admin from changing their own account status
        if (id === req.user.id) {
            return res.status(400).json({
                success: false,
                message: "You cannot change your own account status"
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Protect admin accounts
        if (user.role === "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin accounts cannot be deactivated here"
            });
        }

        user.isActive = isActive;
        await user.save();

        res.status(200).json({
            success: true,
            message: isActive
                ? "User activated successfully"
                : "User deactivated successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUserStatus
};
