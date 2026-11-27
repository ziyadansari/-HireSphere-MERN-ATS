const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            default: ""
        },
        website: {
            type: String,
            default: ""
        },
        location: {
            type: String,
            required: true
        },
        logo: {
            type: String,
            default: ""
        },
        industry: {
            type: String,
            default: ""
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        isApproved: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

const Company = mongoose.model("Company", companySchema);

module.exports = Company;