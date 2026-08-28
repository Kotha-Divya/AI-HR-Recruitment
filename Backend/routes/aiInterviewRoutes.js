const express = require("express");

const Application = require("../models/Application");
const protect = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// ======================================================
// START AI INTERVIEW
// POST /api/ai-interview/start/:applicationId
// CANDIDATE ONLY
// ======================================================

router.post(
    "/start/:applicationId",
    protect,
    roleMiddleware(["candidate"]),

    async (req, res) => {

        try {

            console.log(
                "AI INTERVIEW START:",
                req.params.applicationId
            );

            // ==================================================
            // FIND APPLICATION
            // ==================================================

            const application =
                await Application.findById(
                    req.params.applicationId
                )
                .populate("job", "title skills")
                .populate("candidate", "name email");

            if (!application) {

                return res.status(404).json({
                    message: "Application not found"
                });

            }

            // ==================================================
            // CHECK CANDIDATE
            // ==================================================

            if (
                application.candidate._id.toString() !==
                req.user.id
            ) {

                return res.status(403).json({
                    message:
                        "You are not authorized to access this interview"
                });

            }

            // ==================================================
            // ONLY SHORTLISTED CANDIDATES
            // ==================================================

            if (
                application.status !==
                "Shortlisted"
            ) {

                return res.status(403).json({
                    message:
                        "You can take the AI interview only after being shortlisted."
                });

            }

            // ==================================================
            // CHECK IF ALREADY COMPLETED
            // ==================================================

            if (
                application.aiInterview &&
                application.aiInterview.completed
            ) {

                return res.status(400).json({
                    message:
                        "You have already completed this AI interview."
                });

            }

            // ==================================================
            // GET JOB
            // ==================================================

            const job =
                application.job;

            if (!job) {

                return res.status(404).json({
                    message: "Job not found"
                });

            }

            // ==================================================
            // JOB SKILLS
            // ==================================================

            const jobSkills =
                Array.isArray(job.skills)
                    ? job.skills
                    : [];

            // ==================================================
            // CREATE INTERVIEW QUESTIONS
            // ==================================================

            const questions = [];

            questions.push(
                `Tell me about yourself and your experience related to the ${job.title} position.`
            );

            questions.push(
                `Why are you interested in the ${job.title} role?`
            );

            questions.push(
                `Explain your experience with ${jobSkills[0] || "the required skills"}`
            );

            questions.push(
                `Describe a project where you used your technical skills to solve a problem.`
            );

            questions.push(
                `What challenges have you faced in your projects and how did you solve them?`
            );

            // ==================================================
            // SAVE INTERVIEW
            // ==================================================

            application.aiInterview.started =
                true;

            application.aiInterview.completed =
                false;

            application.aiInterview.questions =
                questions;

            application.aiInterview.answers =
                [];

            await application.save();

            // ==================================================
            // RESPONSE
            // ==================================================

            res.status(200).json({

                message:
                    "AI interview started successfully",

                interview: {

                    applicationId:
                        application._id,

                    jobTitle:
                        job.title,

                    questions:
                        questions

                }

            });

        }

        catch (error) {

            console.error(
                "AI interview start error:",
                error
            );

            res.status(500).json({

                message:
                    "Unable to start AI interview",

                error:
                    error.message

            });

        }

    }
);


// ======================================================
// SUBMIT AI INTERVIEW
// POST /api/ai-interview/submit/:applicationId
// CANDIDATE ONLY
// ======================================================

router.post(
    "/submit/:applicationId",
    protect,
    roleMiddleware(["candidate"]),

    async (req, res) => {

        try {

            const {
                answers
            } = req.body;

            // ==================================================
            // CHECK ANSWERS
            // ==================================================

            if (
                !Array.isArray(answers)
            ) {

                return res.status(400).json({
                    message:
                        "Answers must be provided as an array"
                });

            }

            // ==================================================
            // FIND APPLICATION
            // ==================================================

            const application =
                await Application.findById(
                    req.params.applicationId
                )
                .populate("job", "title")
                .populate("candidate", "name email");

            if (!application) {

                return res.status(404).json({
                    message:
                        "Application not found"
                });

            }

            // ==================================================
            // CHECK CANDIDATE
            // ==================================================

            if (
                application.candidate._id.toString() !==
                req.user.id
            ) {

                return res.status(403).json({
                    message:
                        "You are not authorized to submit this interview"
                });

            }

            // ==================================================
            // CHECK SHORTLISTED
            // ==================================================

            if (
                application.status !==
                "Shortlisted"
            ) {

                return res.status(403).json({
                    message:
                        "Only shortlisted candidates can submit the AI interview."
                });

            }

            // ==================================================
            // CHECK INTERVIEW STARTED
            // ==================================================

            if (
                !application.aiInterview.started
            ) {

                return res.status(400).json({
                    message:
                        "Please start the AI interview first."
                });

            }

            // ==================================================
            // CHECK ALREADY COMPLETED
            // ==================================================

            if (
                application.aiInterview.completed
            ) {

                return res.status(400).json({
                    message:
                        "Interview has already been completed."
                });

            }

            // ==================================================
            // CHECK ANSWER COUNT
            // ==================================================

            if (
                answers.length !==
                application.aiInterview.questions.length
            ) {

                return res.status(400).json({
                    message:
                        "Please answer all interview questions."
                });

            }

            // ==================================================
            // SIMPLE AI-LIKE EVALUATION
            // ==================================================

            let answeredCount = 0;

            answers.forEach(answer => {

                if (
                    answer &&
                    String(answer).trim().length >= 20
                ) {

                    answeredCount++;

                }

            });

            const totalQuestions =
                application.aiInterview.questions.length;

            let interviewScore = 0;

            if (totalQuestions > 0) {

                interviewScore =
                    Math.round(
                        (
                            answeredCount /
                            totalQuestions
                        ) * 100
                    );

            }

            // ==================================================
            // INTERVIEW RESULT
            // ==================================================

            let interviewResult;

            if (
                interviewScore >= 80
            ) {

                interviewResult =
                    "Excellent";

            }
            else if (
                interviewScore >= 60
            ) {

                interviewResult =
                    "Good";

            }
            else if (
                interviewScore >= 40
            ) {

                interviewResult =
                    "Average";

            }
            else {

                interviewResult =
                    "Needs Improvement";

            }

            // ==================================================
            // AI FEEDBACK
            // ==================================================

            let feedback;

            if (
                interviewScore >= 80
            ) {

                feedback =
                    "The candidate provided detailed answers and demonstrated good communication and understanding of the role.";

            }
            else if (
                interviewScore >= 60
            ) {

                feedback =
                    "The candidate provided reasonable answers but could improve the depth and clarity of responses.";

            }
            else if (
                interviewScore >= 40
            ) {

                feedback =
                    "The candidate answered some questions adequately but needs improvement in technical explanation and communication.";

            }
            else {

                feedback =
                    "The candidate's answers were too brief. More detailed and relevant responses are recommended.";

            }

            // ==================================================
            // SAVE RESULT
            // ==================================================

            application.aiInterview.answers =
                answers;

            application.aiInterview.interviewScore =
                interviewScore;

            application.aiInterview.interviewResult =
                interviewResult;

            application.aiInterview.feedback =
                feedback;

            application.aiInterview.completed =
                true;

            application.aiInterview.completedAt =
                new Date();

            await application.save();

            // ==================================================
            // RESPONSE
            // ==================================================

            res.status(200).json({

                message:
                    "AI interview completed successfully",

                result: {

                    applicationId:
                        application._id,

                    candidateName:
                        application.candidate.name,

                    jobTitle:
                        application.job.title,

                    interviewScore:
                        interviewScore,

                    interviewResult:
                        interviewResult,

                    feedback:
                        feedback

                }

            });

        }

        catch (error) {

            console.error(
                "AI interview submit error:",
                error
            );

            res.status(500).json({

                message:
                    "Unable to submit AI interview",

                error:
                    error.message

            });

        }

    }
);


// ======================================================
// TEST ROUTE
// GET /api/ai-interview/test
// ======================================================

router.get(
    "/test",
    (req, res) => {

        res.json({

            message:
                "AI Interview routes are working"

        });

    }
);


// ======================================================
// ROUTE LOADED
// ======================================================

console.log(
    "AI INTERVIEW ROUTES LOADED"
);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;
