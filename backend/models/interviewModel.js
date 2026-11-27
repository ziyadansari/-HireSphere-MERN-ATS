
const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
    {
        application: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
            required: true
        },
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
        recruiter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        scheduledAt: {
            type: Date,
            required: true
        },
        duration: {
            type: Number,
            default: 30
        },
        interviewType: {
            type: String,
            enum: ["Online", "In-person", "Phone"],
            default: "Online"
        },
        meetingLink: {
            type: String,
            default: ""
        },
        location: {
            type: String,
            default: ""
        },
        round: {
            type: Number,
            default: 1,
            min: 1
        },
        status: {
            type: String,
            enum: ["Scheduled", "Completed", "Cancelled"],
            default: "Scheduled"
        },
        notes: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

interviewSchema.index({ candidate: 1, scheduledAt: 1 });
interviewSchema.index({ recruiter: 1, scheduledAt: 1 });

module.exports = mongoose.model("Interview", interviewSchema);
