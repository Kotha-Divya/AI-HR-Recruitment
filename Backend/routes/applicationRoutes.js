const express = require("express");

const router = express.Router();

const Application = require("../models/Application");
const Job = require("../models/Job");

const protect = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

console.log("APPLICATION ROUTES LOADED");

// ======================================================
// TEST ROUTE
// GET /api/applications/test
// ======================================================

router.get("/test", (req, res) => {
    res.status(200).json({
        message: "Application routes are working"
    });
});

// ======================================================
// CANDIDATE - APPLY FOR JOB
// POST /api/applications/apply/:jobId
// ======================================================

router.post(
    "/apply/:jobId",
    protect,
    roleMiddleware(["candidate"]),
    async (req, res) => {
        try {
            const job = await Job.findById(req.params.jobId);

            if (!job) {
                return res.status(404).json({
                    message: "Job not found"
                });
            }

            // Check duplicate application
            const existingApplication =
                await Application.findOne({
                    job: job._id,
                    candidate: req.user.id
                });

            if (existingApplication) {
                return res.status(400).json({
                    message:
                        "You have already applied for this job"
                });
            }

            const application =
                await Application.create({
                    job: job._id,
                    candidate: req.user.id,
                    status: "Applied"
                });

            console.log(
                "APPLICATION CREATED:",
                application._id
            );

            return res.status(201).json({
                message:
                    "Application submitted successfully",
                application
            });

        } catch (error) {

            console.error(
                "Apply job error:",
                error
            );

            return res.status(500).json({
                message:
                    "Unable to apply for job",
                error:
                    error.message
            });
        }
    }
);

// ======================================================
// CANDIDATE - MY APPLICATIONS
// GET /api/applications/my-applications
// ======================================================

router.get(
    "/my-applications",
    protect,
    roleMiddleware(["candidate"]),
    async (req, res) => {

        try {

            console.log("=================================");
            console.log("MY APPLICATIONS REQUEST");
            console.log("Candidate ID:", req.user.id);
            console.log("Candidate Role:", req.user.role);

            const applications =
                await Application.find({
                    candidate: req.user.id
                })
                    .populate(
                        "job",
                        "title company location salary skills description"
                    )
                    .sort({
                        createdAt: -1
                    });

            console.log(
                "Candidate Applications:",
                applications.length
            );

            return res.status(200).json({

                message:
                    "Applications fetched successfully",

                count:
                    applications.length,

                applications

            });

        } catch (error) {

            console.error(
                "My applications error:",
                error
            );

            return res.status(500).json({

                message:
                    "Unable to fetch applications",

                error:
                    error.message

            });
        }
    }
);

// ======================================================
// RECRUITER - GET APPLICATIONS
// GET /api/applications/recruiter-applications
// ======================================================

router.get(
    "/recruiter-applications",
    protect,
    roleMiddleware(["recruiter"]),
    async (req, res) => {

        try {

            console.log("=================================");
            console.log("RECRUITER APPLICATIONS REQUEST");
            console.log("Recruiter ID:", req.user.id);
            console.log("Recruiter Role:", req.user.role);

            // ==================================================
            // FIND JOBS CREATED BY THIS RECRUITER
            // ==================================================

            const recruiterJobs =
                await Job.find({
                    createdBy: req.user.id
                })
                    .select(
                        "_id title company location"
                    );

            console.log(
                "RECRUITER JOBS:",
                recruiterJobs
            );

            const jobIds =
                recruiterJobs.map(
                    job => job._id
                );

            console.log(
                "JOB IDS:",
                jobIds
            );

            // ==================================================
            // FIND APPLICATIONS FOR THESE JOBS
            // ==================================================

            const applications =
                await Application.find({
                    job: {
                        $in: jobIds
                    }
                })
                    .populate(
                        "job",
                        "title company location salary skills description createdBy"
                    )
                    .populate(
                        "candidate",
                        "name email phone skills education experience resume"
                    )
                    .sort({
                        createdAt: -1
                    });

            console.log(
                "APPLICATIONS FOUND:",
                applications.length
            );

            // ==================================================
            // FORMAT RESUME URL
            // ==================================================

            const formattedApplications =
                applications.map(
                    application => {

                        const data =
                            application.toObject();

                        if (
                            data.candidate &&
                            data.candidate.resume
                        ) {

                            let resume =
                                String(
                                    data.candidate.resume
                                ).trim();

                            console.log(
                                "ORIGINAL RESUME:",
                                resume
                            );

                            // ----------------------------------
                            // Remove localhost URL
                            // ----------------------------------

                            resume =
                                resume.replace(
                                    /^https?:\/\/localhost:5000/i,
                                    ""
                                );

                            // ----------------------------------
                            // Remove leading slashes
                            // ----------------------------------

                            resume =
                                resume.replace(
                                    /^\/+/,
                                    ""
                                );

                            // ----------------------------------
                            // Remove duplicate uploads path
                            // ----------------------------------

                            resume =
                                resume.replace(
                                    /^uploads\/uploads\//i,
                                    "uploads/"
                                );

                            // ----------------------------------
                            // If resume contains only filename
                            // ----------------------------------

                            if (
                                !resume.startsWith(
                                    "uploads/"
                                )
                            ) {

                                resume =
                                    "uploads/" +
                                    resume;
                            }

                            // ----------------------------------
                            // Final URL
                            // ----------------------------------

                            data.candidate.resume =
                                `http://localhost:5000/${resume}`;

                            console.log(
                                "FINAL RESUME URL:",
                                data.candidate.resume
                            );
                        }

                        return data;
                    }
                );

            // ==================================================
            // RESPONSE
            // ==================================================

            return res.status(200).json({

                message:
                    "Recruiter applications fetched successfully",

                count:
                    formattedApplications.length,

                applications:
                    formattedApplications

            });

        } catch (error) {

            console.error(
                "Recruiter applications error:",
                error
            );

            return res.status(500).json({

                message:
                    "Unable to fetch recruiter applications",

                error:
                    error.message

            });
        }
    }
);

// ======================================================
// GET SINGLE APPLICATION
// GET /api/applications/:id
// ======================================================

router.get(
    "/:id",
    protect,
    async (req, res) => {

        try {

            const application =
                await Application.findById(
                    req.params.id
                )
                    .populate("job")
                    .populate(
                        "candidate",
                        "name email phone skills education experience resume"
                    );

            if (!application) {

                return res.status(404).json({
                    message:
                        "Application not found"
                });
            }

            // ==================================================
            // CANDIDATE OWNERSHIP
            // ==================================================

            if (
                req.user.role === "candidate"
            ) {

                if (
                    !application.candidate ||
                    application.candidate._id.toString() !==
                    req.user.id
                ) {

                    return res.status(403).json({

                        message:
                            "You are not authorized to view this application"

                    });
                }
            }

            // ==================================================
            // RECRUITER OWNERSHIP
            // ==================================================

            if (
                req.user.role === "recruiter"
            ) {

                if (
                    !application.job ||
                    !application.job.createdBy ||
                    application.job.createdBy.toString() !==
                    req.user.id
                ) {

                    return res.status(403).json({

                        message:
                            "You are not authorized to view this application"

                    });
                }
            }

            return res.status(200).json({

                message:
                    "Application fetched successfully",

                application

            });

        } catch (error) {

            console.error(
                "Get application error:",
                error
            );

            return res.status(500).json({

                message:
                    "Unable to fetch application",

                error:
                    error.message

            });
        }
    }
);

// ======================================================
// RECRUITER - UPDATE APPLICATION STATUS
// PUT /api/applications/:id/status
// ======================================================

router.put(
    "/:id/status",
    protect,
    roleMiddleware(["recruiter"]),
    async (req, res) => {

        try {

            const {
                status
            } = req.body;

            // ==================================================
            // ALLOWED STATUSES
            // ==================================================

            const allowedStatuses = [
                "Applied",
                "Shortlisted",
                "Rejected",
                "Selected"
            ];

            if (
                !allowedStatuses.includes(status)
            ) {

                return res.status(400).json({

                    message:
                        "Invalid application status"

                });
            }

            // ==================================================
            // FIND APPLICATION
            // ==================================================

            const application =
                await Application.findById(
                    req.params.id
                )
                    .populate("job");

            if (!application) {

                return res.status(404).json({

                    message:
                        "Application not found"

                });
            }

            // ==================================================
            // CHECK JOB
            // ==================================================

            if (!application.job) {

                return res.status(404).json({

                    message:
                        "Job not found"

                });
            }

            // ==================================================
            // CHECK RECRUITER OWNERSHIP
            // ==================================================

            if (
                !application.job.createdBy ||
                application.job.createdBy.toString() !==
                req.user.id
            ) {

                return res.status(403).json({

                    message:
                        "You are not authorized to update this application"

                });
            }

            // ==================================================
            // UPDATE STATUS
            // ==================================================

            application.status =
                status;

            await application.save();

            console.log(
                "APPLICATION STATUS UPDATED:",
                application._id,
                status
            );

            return res.status(200).json({

                message:
                    `Application ${status.toLowerCase()} successfully`,

                application

            });

        } catch (error) {

            console.error(
                "Update application status error:",
                error
            );

            return res.status(500).json({

                message:
                    "Unable to update application status",

                error:
                    error.message

            });
        }
    }
);

// ======================================================
// DELETE APPLICATION
// DELETE /api/applications/:id
// CANDIDATE ONLY
// ======================================================

router.delete(
    "/:id",
    protect,
    roleMiddleware(["candidate"]),
    async (req, res) => {

        try {

            const application =
                await Application.findById(
                    req.params.id
                );

            if (!application) {

                return res.status(404).json({

                    message:
                        "Application not found"

                });
            }

            // ==================================================
            // CHECK CANDIDATE OWNERSHIP
            // ==================================================

            if (
                !application.candidate ||
                application.candidate.toString() !==
                req.user.id
            ) {

                return res.status(403).json({

                    message:
                        "You are not authorized to delete this application"

                });
            }

            await Application.findByIdAndDelete(
                req.params.id
            );

            console.log(
                "APPLICATION DELETED:",
                req.params.id
            );

            return res.status(200).json({

                message:
                    "Application deleted successfully"

            });

        } catch (error) {

            console.error(
                "Delete application error:",
                error
            );

            return res.status(500).json({

                message:
                    "Unable to delete application",

                error:
                    error.message

            });
        }
    }
);

// ======================================================
// EXPORT
// ======================================================

module.exports = router;
