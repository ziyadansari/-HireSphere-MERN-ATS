
const Evaluation = require("../models/evaluationModel");
const Interview = require("../models/interviewModel");

// Create evaluation
const createEvaluation = async (req, res) => {
    try {
        const {
            interviewId,
            ratings,
            feedback,
            recommendation
        } = req.body;

        if (!interviewId || !ratings || !feedback || !recommendation) {
            return res.status(400).json({
                success: false,
                message: "Please provide all evaluation details"
            });
        }

        const interview = await Interview.findById(interviewId);

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: "Interview not found"
            });
        }

        if (String(interview.recruiter) !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to evaluate this interview"
            });
        }

        if (interview.status !== "Completed") {
            return res.status(400).json({
                success: false,
                message: "Only completed interviews can be evaluated"
            });
        }

        const existingEvaluation = await Evaluation.findOne({
            interview: interviewId
        });

        if (existingEvaluation) {
            return res.status(409).json({
                success: false,
                message: "This interview has already been evaluated"
            });
        }

        const evaluation = await Evaluation.create({
            interview: interview._id,
            application: interview.application,
            candidate: interview.candidate,
            recruiter: interview.recruiter,
            ratings,
            feedback,
            recommendation
        });

        res.status(201).json({
            success: true,
            message: "Interview evaluation submitted successfully",
            evaluation
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This interview has already been evaluated"
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get evaluations for one interview
const getInterviewEvaluations = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.interviewId);

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: "Interview not found"
            });
        }

        if (String(interview.recruiter) !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized"
            });
        }

        const evaluations = await Evaluation.find({
            interview: interview._id,
            recruiter: req.user.id
        })
            .populate("candidate", "name email")
            .populate("application", "status")
            .populate("interview", "round scheduledAt status");

        res.status(200).json({
            success: true,
            count: evaluations.length,
            evaluations
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all evaluations created by this recruiter
const getRecruiterEvaluations = async (req, res) => {
    try {
        const evaluations = await Evaluation.find({
            recruiter: req.user.id
        })
            .populate("candidate", "name email")
            .populate("interview", "round scheduledAt status")
            .populate("application", "status")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: evaluations.length,
            evaluations
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update an evaluation
const updateEvaluation = async (req, res) => {
    try {
        const evaluation = await Evaluation.findOne({
            _id: req.params.id,
            recruiter: req.user.id
        });

        if (!evaluation) {
            return res.status(404).json({
                success: false,
                message: "Evaluation not found"
            });
        }

        const { ratings, feedback, recommendation } = req.body;

        if (ratings !== undefined) evaluation.ratings = ratings;
        if (feedback !== undefined) evaluation.feedback = feedback;
        if (recommendation !== undefined) {
            evaluation.recommendation = recommendation;
        }

        await evaluation.save();

        res.status(200).json({
            success: true,
            message: "Evaluation updated successfully",
            evaluation
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createEvaluation,
    getInterviewEvaluations,
    getRecruiterEvaluations,
    updateEvaluation
};
