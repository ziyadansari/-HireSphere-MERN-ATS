
const Interview = require("../models/interviewModel");
const Application = require("../models/applicationModel");
const Notification = require("../models/notificationModel");

// Schedule interview
const scheduleInterview = async (req, res) => {
    try {
        const {
            applicationId,
            scheduledAt,
            duration,
            interviewType,
            meetingLink,
            location,
            round,
            notes
        } = req.body;

        if (!applicationId || !scheduledAt) {
            return res.status(400).json({
                success: false,
                message: "Application ID and interview date are required"
            });
        }

        const interviewDate = new Date(scheduledAt);

        if (Number.isNaN(interviewDate.getTime()) || interviewDate <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid future interview date"
            });
        }

        const application = await Application.findById(applicationId)
            .populate("job", "title recruiter");

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }

        if (String(application.job.recruiter) !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You cannot schedule an interview for this application"
            });
        }

        if (application.status === "Rejected") {
            return res.status(400).json({
                success: false,
                message: "Cannot schedule an interview for a rejected application"
            });
        }

        const existingInterview = await Interview.findOne({
            application: applicationId,
            status: "Scheduled"
        });

        if (existingInterview) {
            return res.status(409).json({
                success: false,
                message: "This application already has a scheduled interview. Reschedule it instead."
            });
        }

        const interview = await Interview.create({
            application: application._id,
            job: application.job._id,
            candidate: application.candidate,
            recruiter: req.user.id,
            scheduledAt: interviewDate,
            duration,
            interviewType,
            meetingLink,
            location,
            round,
            notes
        });

        application.status = "Interview Scheduled";
        await application.save();

        await Notification.create({
            recipient: application.candidate,
            title: "Interview Scheduled",
            message: `An interview has been scheduled for ${application.job.title}.`,
            type: "Interview Scheduled",
            relatedInterview: interview._id
        });

        res.status(201).json({
            success: true,
            message: "Interview scheduled successfully",
            interview
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Reschedule interview
const rescheduleInterview = async (req, res) => {
    try {
        const { scheduledAt } = req.body;

        const interviewDate = new Date(scheduledAt);

        if (!scheduledAt || Number.isNaN(interviewDate.getTime()) ||
            interviewDate <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid future interview date"
            });
        }

        const interview = await Interview.findOne({
            _id: req.params.id,
            recruiter: req.user.id,
            status: "Scheduled"
        });

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: "Scheduled interview not found"
            });
        }

        interview.scheduledAt = interviewDate;

        if (req.body.duration !== undefined) {
            interview.duration = req.body.duration;
        }

        if (req.body.meetingLink !== undefined) {
            interview.meetingLink = req.body.meetingLink;
        }

        if (req.body.location !== undefined) {
            interview.location = req.body.location;
        }

        if (req.body.notes !== undefined) {
            interview.notes = req.body.notes;
        }

        await interview.save();

        await Notification.create({
            recipient: interview.candidate,
            title: "Interview Rescheduled",
            message: "Your interview schedule has been changed.",
            type: "Interview Rescheduled",
            relatedInterview: interview._id
        });

        res.status(200).json({
            success: true,
            message: "Interview rescheduled successfully",
            interview
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Cancel interview
const cancelInterview = async (req, res) => {
    try {
        const interview = await Interview.findOne({
            _id: req.params.id,
            recruiter: req.user.id,
            status: "Scheduled"
        });

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: "Scheduled interview not found"
            });
        }

        interview.status = "Cancelled";
        await interview.save();

        // Return application to Under Review
        await Application.findByIdAndUpdate(interview.application, {
            status: "Under Review"
        });

        await Notification.create({
            recipient: interview.candidate,
            title: "Interview Cancelled",
            message: "Your scheduled interview has been cancelled.",
            type: "Interview Cancelled",
            relatedInterview: interview._id
        });

        res.status(200).json({
            success: true,
            message: "Interview cancelled successfully",
            interview
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Candidate: view own interviews
const getMyInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({
            candidate: req.user.id
        })
            .populate("job", "title location")
            .populate("recruiter", "name email")
            .sort({ scheduledAt: 1 });

        res.status(200).json({
            success: true,
            count: interviews.length,
            interviews
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Recruiter: view interviews they scheduled
const getRecruiterInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({
            recruiter: req.user.id
        })
            .populate("job", "title location")
            .populate("candidate", "name email")
            .sort({ scheduledAt: 1 });

        res.status(200).json({
            success: true,
            count: interviews.length,
            interviews
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const completeInterview = async (req, res) => {
    try {
        const interview = await Interview.findOne({
            _id: req.params.id,
            recruiter: req.user.id
        });

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: "Interview not found"
            });
        }

        if (interview.status !== "Scheduled") {
            return res.status(400).json({
                success: false,
                message: "Only scheduled interviews can be completed"
            });
        }

        interview.status = "Completed";
        await interview.save();

        res.status(200).json({
            success: true,
            message: "Interview marked as completed",
            interview
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};




module.exports = {
    scheduleInterview,
    rescheduleInterview,
    cancelInterview,
    getMyInterviews,
    getRecruiterInterviews,
    completeInterview
};