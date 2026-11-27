
const User = require("../models/userModel");
const Company = require("../models/companyModel");
const Job = require("../models/jobModel");
const Application = require("../models/applicationModel");

const getAdminDashboard = async (req, res) => {
    try {
        // 1. User statistics
        const totalUsers = await User.countDocuments();

        const totalCandidates = await User.countDocuments({
            role: "candidate"
        });

        const totalRecruiters = await User.countDocuments({
            role: "recruiter"
        });

        const totalAdmins = await User.countDocuments({
            role: "admin"
        });

        // 2. Company statistics
        const totalCompanies = await Company.countDocuments();

        const approvedCompanies = await Company.countDocuments({
            isApproved: true
        });

        const pendingCompanies = await Company.countDocuments({
            isApproved: false
        });

        // 3. Job statistics
        const totalJobs = await Job.countDocuments();

        const activeJobs = await Job.countDocuments({
            isActive: true
        });

        const inactiveJobs = await Job.countDocuments({
            isActive: false
        });

        // 4. Application statistics
        const totalApplications = await Application.countDocuments();

        // 5. Applications grouped by status
        const applicationStats = await Application.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const applicationsByStatus = {
            Applied: 0,
            "Under Review": 0,
            Shortlisted: 0,
            "Interview Scheduled": 0,
            Selected: 0,
            Rejected: 0
        };

        applicationStats.forEach(item => {
            applicationsByStatus[item._id] = item.count;
        });

        // 6. Recent registered users
        const recentUsers = await User.find()
            .select("name email role createdAt")
            .sort({ createdAt: -1 })
            .limit(5);

        // 7. Recent pending companies
        const recentPendingCompanies = await Company.find({
            isApproved: false
        })
            .populate("owner", "name email")
            .sort({ createdAt: -1 })
            .limit(5);

        // 8. Send dashboard response
        res.status(200).json({
            success: true,
            dashboard: {
                users: {
                    total: totalUsers,
                    candidates: totalCandidates,
                    recruiters: totalRecruiters,
                    admins: totalAdmins
                },
                companies: {
                    total: totalCompanies,
                    approved: approvedCompanies,
                    pending: pendingCompanies
                },
                jobs: {
                    total: totalJobs,
                    active: activeJobs,
                    inactive: inactiveJobs
                },
                applications: {
                    total: totalApplications,
                    byStatus: applicationsByStatus
                },
                recentUsers,
                recentPendingCompanies
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { getAdminDashboard };
