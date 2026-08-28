const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================================
// CREATE UPLOADS FOLDER
// ======================================================

const uploadDirectory = path.join(
    __dirname,
    "../uploads"
);

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true
    });
}

// ======================================================
// MULTER STORAGE
// ======================================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, uploadDirectory);

    },

    filename: (req, file, cb) => {

        const extension =
            path.extname(file.originalname);

        const fileName =
            `resume-${req.user.id}-${Date.now()}${extension}`;

        cb(null, fileName);

    }

});

// ======================================================
// FILE FILTER
// ======================================================

const fileFilter = (req, file, cb) => {

    const allowedExtensions = [
        ".pdf",
        ".doc",
        ".docx"
    ];

    const extension =
        path.extname(
            file.originalname
        ).toLowerCase();

    if (
        allowedExtensions.includes(
            extension
        )
    ) {

        cb(null, true);

    } else {

        cb(
            new Error(
                "Only PDF, DOC and DOCX files are allowed."
            )
        );

    }

};

// ======================================================
// MULTER UPLOAD
// ======================================================

const upload = multer({

    storage: storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: fileFilter

});

// ======================================================
// GET LOGGED-IN USER PROFILE
// GET /api/profile
// ======================================================

router.get(
    "/",
    protect,
    async (req, res) => {

        try {

            console.log(
                "PROFILE REQUEST USER:",
                req.user
            );

            const user =
                await User.findById(
                    req.user.id
                ).select("-password");

            if (!user) {

                return res.status(404).json({
                    message:
                        "User not found"
                });

            }

            res.status(200).json({

                message:
                    "Profile fetched successfully",

                user

            });

        } catch (error) {

            console.error(
                "Profile fetch error:",
                error
            );

            res.status(500).json({
                message:
                    error.message
            });

        }

    }
);

// ======================================================
// UPDATE PROFILE
// PUT /api/profile
// ======================================================

router.put(
    "/",
    protect,
    async (req, res) => {

        try {

            console.log(
                "PROFILE UPDATE USER:",
                req.user
            );

            console.log(
                "PROFILE UPDATE BODY:",
                req.body
            );

            const user =
                await User.findById(
                    req.user.id
                );

            if (!user) {

                return res.status(404).json({
                    message:
                        "User not found"
                });

            }

            // PHONE

            if (
                req.body.phone !== undefined
            ) {

                user.phone =
                    req.body.phone;

            }

            // LOCATION

            if (
                req.body.location !== undefined
            ) {

                user.location =
                    req.body.location;

            }

            // SKILLS

            if (
                req.body.skills !== undefined
            ) {

                user.skills =
                    Array.isArray(
                        req.body.skills
                    )
                        ? req.body.skills
                        : [];

            }

            // EDUCATION

            if (
                req.body.education !== undefined
            ) {

                user.education =
                    req.body.education;

            }

            // EXPERIENCE

            if (
                req.body.experience !== undefined
            ) {

                user.experience =
                    req.body.experience;

            }

            // RESUME

            if (
                req.body.resume !== undefined
            ) {

                user.resume =
                    req.body.resume;

            }

            await user.save();

            const updatedUser =
                await User.findById(
                    req.user.id
                ).select("-password");

            res.status(200).json({

                message:
                    "Profile updated successfully",

                user:
                    updatedUser

            });

        } catch (error) {

            console.error(
                "Profile update error:",
                error
            );

            res.status(500).json({
                message:
                    error.message
            });

        }

    }
);

// ======================================================
// UPLOAD RESUME
// POST /api/profile/upload-resume
// ======================================================

router.post(
    "/upload-resume",
    protect,
    upload.single("resume"),

    async (req, res) => {

        try {

            console.log(
                "RESUME UPLOAD USER:",
                req.user
            );

            console.log(
                "UPLOADED FILE:",
                req.file
            );

            // Check file

            if (!req.file) {

                return res.status(400).json({
                    message:
                        "Please select a resume file."
                });

            }

            // Find user

            const user =
                await User.findById(
                    req.user.id
                );

            if (!user) {

                // Delete uploaded file
                // if user does not exist

                if (
                    fs.existsSync(
                        req.file.path
                    )
                ) {

                    fs.unlinkSync(
                        req.file.path
                    );

                }

                return res.status(404).json({
                    message:
                        "User not found"
                });

            }

            // Resume URL

            const resumeUrl =
                `/uploads/${req.file.filename}`;

            // Save resume path in MongoDB

            user.resume =
                resumeUrl;

            await user.save();

            console.log(
                "RESUME SAVED:",
                resumeUrl
            );

            res.status(200).json({

                message:
                    "Resume uploaded successfully",

                resumeUrl:

                    resumeUrl

            });

        } catch (error) {

            console.error(
                "Resume upload error:",
                error
            );

            res.status(500).json({

                message:
                    error.message

            });

        }

    }
);

// ======================================================
// TEST ROUTE
// GET /api/profile/test
// ======================================================

router.get(
    "/test",
    (req, res) => {

        res.json({

            message:
                "Profile routes are working"

        });

    }
);

// ======================================================
// ROUTE LOADED
// ======================================================

console.log(
    "PROFILE ROUTES LOADED - RESUME UPLOAD ACTIVE"
);

// ======================================================
// EXPORT
// ======================================================

module.exports = router;
