
const mongoose = require("mongoose");

const evaluationSchema = new mongoose.Schema(
    {
        interview: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Interview",
            required: true,
            unique: true
        },
        application: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
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
        ratings: {
            technicalSkills: {
                type: Number,
                required: true,
                min: 1,
                max: 10
            },
            communication: {
                type: Number,
                required: true,
                min: 1,
                max: 10
            },
            problemSolving: {
                type: Number,
                required: true,
                min: 1,
                max: 10
            }
        },
        overallScore: {
            type: Number,
            default: 0
        },
        feedback: {
            type: String,
            required: true,
            trim: true
        },
        recommendation: {
            type: String,
            enum: ["Select", "Reject", "Hold"],
            required: true
        }
    },
    { timestamps: true }
);

// Calculate the average score automatically
evaluationSchema.pre("validate", function () {
    if (this.ratings) {
        const { technicalSkills, communication, problemSolving } =
            this.ratings;

        if (
            [technicalSkills, communication, problemSolving].every(
                Number.isFinite
            )
        ) {
            this.overallScore = Number(
                ((technicalSkills + communication + problemSolving) / 3).toFixed(2)
            );
        }
    }
});

module.exports = mongoose.model("Evaluation", evaluationSchema);
