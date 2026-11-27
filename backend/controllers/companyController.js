const Company = require("../models/companyModel");

// Create company
const createCompany = async (req, res) => {
    try {
        const { name, description, website, location, logo, industry } = req.body;

        if (!name || !location) {
            return res.status(400).json({
                success: false,
                message: "Company name and location are required"
            });
        }

        const company = await Company.create({
            name,
            description,
            website,
            location,
            logo,
            industry,
            owner: req.user.id
        });

        res.status(201).json({
            success: true,
            message: "Company created successfully. Waiting for admin approval.",
            company
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// Get companies created by logged-in recruiter
const getMyCompanies = async (req, res) => {
    try {
        const companies = await Company.find({
            owner: req.user.id
        });

        res.status(200).json({
            success: true,
            count: companies.length,
            companies
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// Get all companies waiting for approval
const getPendingCompanies = async (req, res) => {
    try {
        const companies = await Company.find({
            isApproved: false
        }).populate("owner", "name email");

        res.status(200).json({
            success: true,
            count: companies.length,
            companies
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const approveCompany = async (req, res) => {
    try {

        const company = await Company.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true, runValidators: true }
        );

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Company approved successfully",
            company
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    createCompany,
    getMyCompanies,
    getPendingCompanies,
    approveCompany
};