const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
    {
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true
        },
        candidate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        resume: {
            type: String,
            default: ""
        },
        coverLetter: {
            type: String,
            default: ""
        },
        status: {
            type: String,
            enum: [
                "Applied",
                "Under Review",
                "Shortlisted",
                "Interview Scheduled",
                "Selected",
                "Rejected"
            ],
            default: "Applied"
        }
    },
    { timestamps: true }
);

// Prevent duplicate applications for the same job
applicationSchema.index(
    { job: 1, candidate: 1 },
    { unique: true }
);

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;