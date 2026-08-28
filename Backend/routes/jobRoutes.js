const express = require("express");
const Job = require("../models/Job");

const protect = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// ======================================================
// RECRUITER - CREATE JOB
// POST /api/jobs
// ======================================================

router.post(
    "/",
    protect,
    roleMiddleware(["recruiter"]),
    async (req, res) => {
        try {
            const {
                title,
                description,
                company,
                location,
                skills,
                salary
            } = req.body;

            // Validate required fields
            if (
                !title ||
                !description ||
                !company ||
                !location ||
                !skills
            ) {
                return res.status(400).json({
                    message:
                        "Title, description, company, location and skills are required"
                });
            }

            const job = await Job.create({
                title,
                description,
                company,
                location,
                skills: Array.isArray(skills)
                    ? skills
                    : skills
                          .split(",")
                          .map((skill) => skill.trim())
                          .filter(
                              (skill) => skill !== ""
                          ),
                salary: salary || "",
                createdBy: req.user.id
            });

            res.status(201).json({
                message:
                    "Job created successfully",
                job
            });
        } catch (error) {
            console.error(
                "Create job error:",
                error
            );

            res.status(500).json({
                message: error.message
            });
        }
    }
);

// ======================================================
// ALL USERS - GET ALL JOBS
// GET /api/jobs
// ======================================================

router.get("/", async (req, res) => {
    try {
        const jobs = await Job.find()
            .populate(
                "createdBy",
                "name email"
            )
            .sort({
                createdAt: -1
            });

        res.json({
            message:
                "Jobs fetched successfully",
            jobs
        });
    } catch (error) {
        console.error(
            "Get jobs error:",
            error
        );

        res.status(500).json({
            message: error.message
        });
    }
});

// ======================================================
// RECRUITER - GET MY JOBS
// GET /api/jobs/my-jobs
// ======================================================

router.get(
    "/my-jobs",
    protect,
    roleMiddleware(["recruiter"]),
    async (req, res) => {
        try {
            const jobs = await Job.find({
                createdBy: req.user.id
            }).sort({
                createdAt: -1
            });

            res.json({
                message:
                    "Your jobs fetched successfully",
                jobs
            });
        } catch (error) {
            console.error(
                "My jobs error:",
                error
            );

            res.status(500).json({
                message: error.message
            });
        }
    }
);

// ======================================================
// SEARCH JOBS
// GET /api/jobs/search
// ======================================================

router.get(
    "/search",
    async (req, res) => {
        try {
            const {
                title,
                location,
                skill
            } = req.query;

            const query = {};

            if (title) {
                query.title = {
                    $regex: title,
                    $options: "i"
                };
            }

            if (location) {
                query.location = {
                    $regex: location,
                    $options: "i"
                };
            }

            if (skill) {
                query.skills = {
                    $regex: skill,
                    $options: "i"
                };
            }

            const jobs = await Job.find(query)
                .populate(
                    "createdBy",
                    "name email"
                )
                .sort({
                    createdAt: -1
                });

            res.json({
                message:
                    "Jobs searched successfully",
                jobs
            });
        } catch (error) {
            console.error(
                "Search jobs error:",
                error
            );

            res.status(500).json({
                message: error.message
            });
        }
    }
);

// ======================================================
// GET SINGLE JOB
// GET /api/jobs/:id
// ======================================================

router.get(
    "/:id",
    async (req, res) => {
        try {
            const job =
                await Job.findById(
                    req.params.id
                ).populate(
                    "createdBy",
                    "name email"
                );

            if (!job) {
                return res.status(404).json({
                    message:
                        "Job not found"
                });
            }

            res.json({
                message:
                    "Job fetched successfully",
                job
            });
        } catch (error) {
            console.error(
                "Get single job error:",
                error
            );

            res.status(500).json({
                message: error.message
            });
        }
    }
);

// ======================================================
// RECRUITER - DELETE JOB
// DELETE /api/jobs/:id
// ======================================================

router.delete(
    "/:id",
    protect,
    roleMiddleware(["recruiter"]),
    async (req, res) => {
        try {
            const job =
                await Job.findById(
                    req.params.id
                );

            if (!job) {
                return res.status(404).json({
                    message:
                        "Job not found"
                });
            }

            // Check job ownership
            if (
                job.createdBy.toString() !==
                req.user.id
            ) {
                return res.status(403).json({
                    message:
                        "You are not authorized to delete this job"
                });
            }

            await Job.findByIdAndDelete(
                req.params.id
            );

            res.json({
                message:
                    "Job deleted successfully"
            });
        } catch (error) {
            console.error(
                "Delete job error:",
                error
            );

            res.status(500).json({
                message: error.message
            });
        }
    }
);

module.exports = router;