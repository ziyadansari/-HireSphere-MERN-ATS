
const mongoose = require("mongoose");
const Job = require("../models/jobModel");

// Get all jobs or filter by moderation status
const getAllAdminJobs = async (req, res) => {
    try {
        const {
            status = "",
            search = "",
            page = 1,
            limit = 10
        } = req.query;

        const currentPage = Math.max(1, Number(page) || 1);
        const pageLimit = Math.min(100, Math.max(1, Number(limit) || 10));

        const filter = {};

        if (status) {
            if (!["Pending", "Approved", "Rejected"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid moderation status"
                });
            }

            if (status === "Pending") {
                filter.$or = [
                    { moderationStatus: "Pending" },
                    { moderationStatus: { $exists: false } }
                ];
            } else {
                filter.moderationStatus = status;
            }
        }

        if (search.trim()) {
            const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

            filter.title = {
                $regex: safeSearch,
                $options: "i"
            };
        }

        const totalJobs = await Job.countDocuments(filter);

        const jobs = await Job.find(filter)
            .populate("company", "name location")
            .populate("recruiter", "name email")
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * pageLimit)
            .limit(pageLimit);

        res.status(200).json({
            success: true,
            totalJobs,
            currentPage,
            totalPages: Math.ceil(totalJobs / pageLimit),
            jobs
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Approve a job
const approveJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        job.moderationStatus = "Approved";
        job.rejectionReason = "";

        await job.save();

        res.status(200).json({
            success: true,
            message: "Job approved successfully",
            job
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Reject a job
const rejectJob = async (req, res) => {
    try {
        const { reason } = req.body;

        if (!reason || !reason.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please provide a rejection reason"
            });
        }

        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        job.moderationStatus = "Rejected";
        job.rejectionReason = reason.trim();

        await job.save();

        res.status(200).json({
            success: true,
            message: "Job rejected successfully",
            job
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete inappropriate job
const deleteAdminJob = async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Job deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAllAdminJobs,
    approveJob,
    rejectJob,
    deleteAdminJob
};
