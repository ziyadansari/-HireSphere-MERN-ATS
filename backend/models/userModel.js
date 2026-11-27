
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["admin", "recruiter", "candidate"],
            default: "candidate"
        },

        isActive: {
            type: Boolean,
            default: true
        },
        resetPasswordToken: {
    type: String,
    default: null
},

resetPasswordExpires: {
    type: Date,
    default: null
},
isEmailVerified: {
    type: Boolean,
    default: false
},

emailVerificationToken: {
    type: String,
    default: null
},

emailVerificationExpires: {
    type: Date,
    default: null
},

        // Candidate profile
        phone: {
            type: String,
            default: ""
        },

        headline: {
            type: String,
            default: ""
        },

        location: {
            type: String,
            default: ""
        },

        bio: {
            type: String,
            default: ""
        },

        skills: {
            type: [String],
            default: []
        },

        education: [
            {
                degree: String,
                institution: String,
                field: String,
                startYear: Number,
                endYear: Number,
                grade: String
            }
        ],

        experience: [
            {
                company: String,
                position: String,
                description: String,
                startDate: Date,
                endDate: Date,
                currentlyWorking: {
                    type: Boolean,
                    default: false
                }
            }
        ],

        projects: [
            {
                title: String,
                description: String,
                technologies: [String],
                projectLink: String
            }
        ],

        certifications: [
            {
                name: String,
                organization: String,
                issueDate: Date,
                certificateLink: String
            }
        ],

        resume: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
