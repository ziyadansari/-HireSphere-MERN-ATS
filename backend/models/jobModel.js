const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true
        },
        requirements: {
            type: [String],
            default: []
        },
        skills: {
            type: [String],
            default: []
        },
        location: {
            type: String,
            required: true
        },
        jobType: {
            type: String,
            enum: ["Full-time", "Part-time", "Internship", "Contract"],
            required: true
        },
        salary: {
            min: { type: Number, default: 0 },
            max: { type: Number, default: 0 }
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true
        },
        recruiter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        moderationStatus: {
          type: String,
            enum: ["Pending", "Approved", "Rejected"],
           default: "Pending"
         },
        rejectionReason: {
           type: String,
            default: ""
         },
        applicationDeadline: {
            type: Date
        }
    },
    { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;