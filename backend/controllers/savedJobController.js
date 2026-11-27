
const SavedJob = require("../models/savedJobModel");
const Job = require("../models/jobModel");

// Save a job
const saveJob = async (req, res) => {
    try {
        const { id } = req.params;

        const job = await Job.findOne({
            _id: id,
            isActive: true,
            moderationStatus: "Approved"
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found or not approved"
            });
        }

        const existingJob = await SavedJob.findOne({
            candidate: req.user.id,
            job: id
        });

        if (existingJob) {
            return res.status(409).json({
                success: false,
                message: "Job already saved"
            });
        }

        const savedJob = await SavedJob.create({
            candidate: req.user.id,
            job: id
        });

        res.status(201).json({
            success: true,
            message: "Job saved successfully",
            savedJob
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Job already saved"
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Unsave a job
const unsaveJob = async (req, res) => {
    try {
        const deletedJob = await SavedJob.findOneAndDelete({
            candidate: req.user.id,
            job: req.params.id
        });

        if (!deletedJob) {
            return res.status(404).json({
                success: false,
                message: "Saved job not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Job removed from saved jobs"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get candidate's saved jobs
const getSavedJobs = async (req, res) => {
    try {
        const savedJobs = await SavedJob.find({
            candidate: req.user.id
        })
            .populate({
                path: "job",
                match: {
                    isActive: true,
                    moderationStatus: "Approved"
                },
                populate: {
                    path: "company",
                    select: "name location logo"
                }
            })
            .sort({ createdAt: -1 });

        const activeSavedJobs = savedJobs.filter(item => item.job);

        res.status(200).json({
            success: true,
            count: activeSavedJobs.length,
            savedJobs: activeSavedJobs
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    saveJob,
    unsaveJob,
    getSavedJobs
};
