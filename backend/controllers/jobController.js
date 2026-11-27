
const Job = require("../models/jobModel");
const Company = require("../models/companyModel");

// Helper: safely escape search terms for regular expressions
const escapeRegex = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// 1. Create Job
const createJob = async (req, res) => {
    try {
        const {
            title,
            description,
            requirements,
            skills,
            location,
            jobType,
            salary,
            company,
            applicationDeadline
        } = req.body;

        if (!title || !description || !location || !jobType || !company) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        const companyExists = await Company.findOne({
            _id: company,
            owner: req.user.id,
            isApproved: true
        });

        if (!companyExists) {
            return res.status(403).json({
                success: false,
                message: "Company not found, not approved, or you don't own it"
            });
        }

        const job = await Job.create({
            title,
            description,
            requirements,
            skills,
            location,
            jobType,
            salary,
            company,
            recruiter: req.user.id,
            applicationDeadline,
            moderationStatus: "Pending",
            rejectionReason: "",
            isActive: true
        });

        res.status(201).json({
            success: true,
            message: "Job created successfully. Waiting for admin approval.",
            job
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 2. Get All Approved Jobs (Public)
const getAllJobs = async (req, res) => {
    try {
        const {
            search,
            location,
            jobType,
            skills,
            minSalary,
            maxSalary,
            sort,
            page = 1,
            limit = 10
        } = req.query;

        const currentPage = Math.max(1, parseInt(page) || 1);
        const perPage = Math.min(50, Math.max(1, parseInt(limit) || 10));
        const skip = (currentPage - 1) * perPage;

        // Candidates can only see approved and active jobs
        const filter = {
            isActive: true,
            moderationStatus: "Approved"
        };

        // Search by title, description, requirements and skills
        if (search && search.trim()) {
            const regex = new RegExp(escapeRegex(search.trim()), "i");

            filter.$or = [
                { title: regex },
                { description: regex },
                { requirements: regex },
                { skills: regex }
            ];
        }

        // Filter by location
        if (location && location.trim()) {
            filter.location = {
                $regex: escapeRegex(location.trim()),
                $options: "i"
            };
        }

        // Filter by job type
        if (jobType) {
            filter.jobType = jobType;
        }

        // Filter by skills
        if (skills) {
            const skillList = skills
                .split(",")
                .map(skill => skill.trim())
                .filter(Boolean);

            if (skillList.length > 0) {
                filter.skills = {
                    $in: skillList.map(
                        skill => new RegExp(
                            `^${escapeRegex(skill)}$`,
                            "i"
                        )
                    )
                };
            }
        }

        // Salary filters
        if (
            minSalary !== undefined &&
            minSalary !== "" &&
            Number.isFinite(Number(minSalary))
        ) {
            filter["salary.max"] = {
                $gte: Number(minSalary)
            };
        }

        if (
            maxSalary !== undefined &&
            maxSalary !== "" &&
            Number.isFinite(Number(maxSalary))
        ) {
            filter["salary.min"] = {
                $lte: Number(maxSalary)
            };
        }

        // Sorting
        let sortOption = { createdAt: -1 };

        if (sort === "oldest") {
            sortOption = { createdAt: 1 };
        } else if (sort === "salary-high") {
            sortOption = { "salary.max": -1 };
        } else if (sort === "salary-low") {
            sortOption = { "salary.min": 1 };
        }

        const [jobs, totalJobs] = await Promise.all([
            Job.find(filter)
                .populate("company", "name location logo")
                .populate("recruiter", "name email")
                .sort(sortOption)
                .skip(skip)
                .limit(perPage),

            Job.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            count: jobs.length,
            totalJobs,
            currentPage,
            totalPages: Math.ceil(totalJobs / perPage),
            jobs
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 3. Get Jobs Posted by Logged-in Recruiter
const getMyJobs = async (req, res) => {
    try {
        const jobs = await Job.find({
            recruiter: req.user.id
        })
            .populate("company", "name location logo")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: jobs.length,
            jobs
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 3. Get Single Approved Job
const getJobById = async (req, res) => {
    try {
        const job = await Job.findOne({
            _id: req.params.id,
            isActive: true,
            moderationStatus: "Approved"
        })
            .populate("company", "name location logo")
            .populate("recruiter", "name email");

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        res.status(200).json({
            success: true,
            job
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 4. Update Job (Recruiter)
const updateJob = async (req, res) => {
    try {
        const allowedFields = [
            "title",
            "description",
            "requirements",
            "skills",
            "location",
            "jobType",
            "salary",
            "applicationDeadline"
        ];

        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields provided for update"
            });
        }

        // Editing a job requires fresh admin approval
        updates.moderationStatus = "Pending";
        updates.rejectionReason = "";

        const job = await Job.findOneAndUpdate(
            {
                _id: req.params.id,
                recruiter: req.user.id
            },
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        );

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found or you don't own this job"
            });
        }

        res.status(200).json({
            success: true,
            message: "Job updated successfully. Waiting for admin approval.",
            job
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// 5. Delete Job (Recruiter)
const deleteJob = async (req, res) => {
    try {
        const job = await Job.findOneAndDelete({
            _id: req.params.id,
            recruiter: req.user.id
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found or you don't own this job"
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
    createJob,
    getAllJobs,
    getMyJobs,
    getJobById,
    updateJob,
    deleteJob
};

