
const Job = require("../models/jobModel");
const Application = require("../models/applicationModel");
const Interview = require("../models/interviewModel");

const getRecruiterDashboard = async (req, res) => {
    try {
        const recruiterId = req.user.id;

        // 1. Find jobs posted by this recruiter
        const jobs = await Job.find({
            recruiter: recruiterId
        }).select("_id isActive");

        const jobIds = jobs.map(job => job._id);

        // 2. Job statistics
        const totalJobs = jobs.length;

        const activeJobs = jobs.filter(
            job => job.isActive === true
        ).length;

        const inactiveJobs = totalJobs - activeJobs;

        // 3. Application statistics
        const totalApplications = await Application.countDocuments({
            job: { $in: jobIds }
        });

        // 4. Applications grouped by status
        const applicationStats = await Application.aggregate([
            {
                $match: {
                    job: { $in: jobIds }
                }
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Convert aggregation result into a readable object
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

        // 5. Interview statistics
        const totalInterviews = await Interview.countDocuments({
            recruiter: recruiterId
        });

        const scheduledInterviews = await Interview.countDocuments({
            recruiter: recruiterId,
            status: "Scheduled"
        });

        const completedInterviews = await Interview.countDocuments({
            recruiter: recruiterId,
            status: "Completed"
        });

        const cancelledInterviews = await Interview.countDocuments({
            recruiter: recruiterId,
            status: "Cancelled"
        });

        // 6. Recent applications
        const recentApplications = await Application.find({
            job: { $in: jobIds }
        })
            .populate("candidate", "name email")
            .populate("job", "title location")
            .sort({ createdAt: -1 })
            .limit(5);

        // 7. Send dashboard response
        res.status(200).json({
            success: true,
            dashboard: {
                jobs: {
                    total: totalJobs,
                    active: activeJobs,
                    inactive: inactiveJobs
                },
                applications: {
                    total: totalApplications,
                    byStatus: applicationsByStatus
                },
                interviews: {
                    total: totalInterviews,
                    scheduled: scheduledInterviews,
                    completed: completedInterviews,
                    cancelled: cancelledInterviews
                },
                recentApplications
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { getRecruiterDashboard };
