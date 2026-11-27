
const User = require("../models/userModel");
const path = require("path");
const fs = require("fs");

const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select a PDF resume"
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            fs.unlinkSync(req.file.path);

            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Delete the previous resume if one exists
        if (user.resume) {
            const oldResumePath = path.join(
                process.cwd(),
                "uploads",
                "resumes",
                path.basename(user.resume)
            );

            if (fs.existsSync(oldResumePath)) {
                fs.unlinkSync(oldResumePath);
            }
        }

        // Save new resume filename in MongoDB
        user.resume = req.file.filename;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Resume uploaded successfully",
            resume: user.resume
        });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Download candidate's own resume
const getResume = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user || !user.resume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found"
            });
        }

        const resumePath = path.join(
            process.cwd(),
            "uploads",
            "resumes",
            path.basename(user.resume)
        );

        if (!fs.existsSync(resumePath)) {
            return res.status(404).json({
                success: false,
                message: "Resume file does not exist"
            });
        }

        res.download(resumePath);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    uploadResume,
    getResume
};
