
const Application = require("../models/applicationModel");
const Job = require("../models/jobModel");

// 1. Candidate applies for a job
const applyForJob = async (req, res) => {
    try {
        const { jobId, coverLetter } = req.body;

        if (!jobId) {
            return res.status(400).json({
                success: false,
                message: "Job ID is required"
            });
        }

        // Only active and admin-approved jobs can receive applications
        const job = await Job.findOne({
            _id: jobId,
            isActive: true,
            moderationStatus: "Approved"
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found, inactive, or not approved"
            });
        }

        // Check duplicate application
        const existingApplication = await Application.findOne({
            job: jobId,
            candidate: req.user.id
        });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: "You have already applied for this job"
            });
        }

        const application = await Application.create({
            job: jobId,
            candidate: req.user.id,
            coverLetter
        });

        res.status(201).json({
            success: true,
            message: "Application submitted successfully",
            application
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "You have already applied for this job"
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// 2. Candidate views their applications
const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({
            candidate: req.user.id
        })
            .populate({
                path: "job",
                select: "title location jobType salary company",
                populate: {
                    path: "company",
                    select: "name logo location"
                }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            applications
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// 3. Recruiter views applicants for their jobs
const getJobApplicants = async (req, res) => {
    try {
        const job = await Job.findOne({
            _id: req.params.jobId,
            recruiter: req.user.id
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found or you do not own this job"
            });
        }

        const applications = await Application.find({
            job: job._id
        })
            .populate("candidate", "name email")
            .populate("job", "title location jobType")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            applications
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// 4. Recruiter updates application status
const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = [
            "Applied",
            "Under Review",
            "Shortlisted",
            "Interview Scheduled",
            "Selected",
            "Rejected"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application status"
            });
        }

        const application = await Application.findById(
            req.params.applicationId
        );

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }

        // Verify job ownership
        const job = await Job.findOne({
            _id: application.job,
            recruiter: req.user.id
        });

        if (!job) {
            return res.status(403).json({
                success: false,
                message: "You cannot update this application"
            });
        }

        application.status = status;
        await application.save();

        res.status(200).json({
            success: true,
            message: "Application status updated successfully",
            application
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// 5. Recruiter views all applicants across their jobs
const getAllRecruiterApplications = async (req, res) => {
    try {
        const jobs = await Job.find({
            recruiter: req.user.id
        }).select("_id");

        const jobIds = jobs.map(job => job._id);

        const applications = await Application.find({
            job: { $in: jobIds }
        })
            .populate("candidate", "name email")
            .populate("job", "title location")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            applications
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    applyForJob,
    getMyApplications,
    getJobApplicants,
    updateApplicationStatus,
    getAllRecruiterApplications
};
