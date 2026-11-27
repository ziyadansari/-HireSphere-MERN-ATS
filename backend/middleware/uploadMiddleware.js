
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create resume folder automatically
const uploadPath = path.join(__dirname, "../uploads/resumes");

fs.mkdirSync(uploadPath, { recursive: true });


// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
        const uniqueName = `resume-${req.user.id}-${Date.now()}.pdf`;
        cb(null, uniqueName);
    }
});

// Validate PDF
const fileFilter = (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (extension === ".pdf" && file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(new Error("Only PDF files are allowed"));
    }
};

// Configure Multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

// Handle upload errors
const uploadResume = (req, res, next) => {
    upload.single("resume")(req, res, (error) => {
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.code === "LIMIT_FILE_SIZE"
                    ? "Resume must be smaller than 5 MB"
                    : error.message
            });
        }

        next();
    });
};

module.exports = uploadResume;
