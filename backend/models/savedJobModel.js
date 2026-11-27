
const mongoose = require("mongoose");

const savedJobSchema = new mongoose.Schema(
    {
        candidate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true
        }
    },
    { timestamps: true }
);

// Prevent saving the same job more than once
savedJobSchema.index(
    { candidate: 1, job: 1 },
    { unique: true }
);

const SavedJob = mongoose.model("SavedJob", savedJobSchema);

module.exports = SavedJob;
