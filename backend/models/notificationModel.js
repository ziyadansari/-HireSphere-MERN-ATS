
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        title: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: [
                "Interview Scheduled",
                "Interview Rescheduled",
                "Interview Cancelled",
                "Application Update",
                "General"
            ],
            default: "General"
        },
        relatedInterview: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Interview",
            default: null
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
