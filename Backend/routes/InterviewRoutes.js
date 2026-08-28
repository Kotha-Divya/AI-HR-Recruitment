const express = require("express");

const Interview = require("../models/Interview");
const Application = require("../models/Application");
const protect = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


// ======================================================
// CANDIDATE - START AI INTERVIEW
// POST /api/interviews/start/:applicationId
// ======================================================

router.post(
    "/start/:applicationId",
    protect,
    roleMiddleware(["candidate"]),

    async (req, res) => {

        try {

            console.log(
                "START AI INTERVIEW:",
                req.params.applicationId
            );


            // ==================================================
            // FIND APPLICATION
            // ==================================================

            const application =
                await Application.findById(
                    req.params.applicationId
                )
                .populate("job")
                .populate("candidate");


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
                        "You are not authorized to start this interview"
                });

            }


            // ==================================================
            // ONLY SHORTLISTED CANDIDATES
            // ==================================================

            if (
                application.status !==
                "Shortlisted"
            ) {

                return res.status(400).json({
                    message:
                        "You can start the AI interview only after being shortlisted."
                });

            }


            // ==================================================
            // CHECK EXISTING INTERVIEW
            // ==================================================

            let interview =
                await Interview.findOne({
                    application:
                        application._id
                });


            // ==================================================
            // QUESTIONS
            // ==================================================

            const questions = [

                {
                    question:
                        `Tell me about yourself and why you are interested in the ${application.job.title} position.`,
                    answer: "",
                    score: 0,
                    feedback: ""
                },

                {
                    question:
                        `What skills do you have that are relevant to the ${application.job.title} role?`,
                    answer: "",
                    score: 0,
                    feedback: ""
                },

                {
                    question:
                        "Describe a project you have worked on and explain your contribution.",
                    answer: "",
                    score: 0,
                    feedback: ""
                },

                {
                    question:
                        "How do you solve a difficult technical problem?",
                    answer: "",
                    score: 0,
                    feedback: ""
                },

                {
                    question:
                        "Why should we select you for this position?",
                    answer: "",
                    score: 0,
                    feedback: ""
                }

            ];


            // ==================================================
            // CREATE INTERVIEW
            // ==================================================

            if (!interview) {

                interview =
                    await Interview.create({

                        application:
                            application._id,

                        job:
                            application.job._id,

                        candidate:
                            req.user.id,

                        status:
                            "In Progress",

                        questions:
                            questions,

                        startedAt:
                            new Date()

                    });

            }
            else {

                // If interview was already completed

                if (
                    interview.status ===
                    "Completed"
                ) {

                    return res.status(400).json({
                        message:
                            "You have already completed this AI interview."
                    });

                }


                interview.status =
                    "In Progress";

                if (!interview.startedAt) {

                    interview.startedAt =
                        new Date();

                }

                await interview.save();

            }


            // ==================================================
            // RETURN INTERVIEW
            // ==================================================

            res.status(200).json({

                message:
                    "AI interview started successfully",

                interview: {

                    id:
                        interview._id,

                    jobTitle:
                        application.job.title,

                    questions:
                        interview.questions,

                    status:
                        interview.status

                }

            });

        }

        catch (error) {

            console.error(
                "Start interview error:",
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
// CANDIDATE - SUBMIT AI INTERVIEW
// POST /api/interviews/submit/:interviewId
// ======================================================

router.post(
    "/submit/:interviewId",
    protect,
    roleMiddleware(["candidate"]),

    async (req, res) => {

        try {

            console.log(
                "SUBMIT AI INTERVIEW:",
                req.params.interviewId
            );


            const interview =
                await Interview.findById(
                    req.params.interviewId
                );


            if (!interview) {

                return res.status(404).json({
                    message:
                        "Interview not found"
                });

            }


            // ==================================================
            // CHECK CANDIDATE
            // ==================================================

            if (
                interview.candidate.toString() !==
                req.user.id
            ) {

                return res.status(403).json({
                    message:
                        "You are not authorized to submit this interview"
                });

            }


            // ==================================================
            // CHECK STATUS
            // ==================================================

            if (
                interview.status ===
                "Completed"
            ) {

                return res.status(400).json({
                    message:
                        "Interview has already been completed"
                });

            }


            const answers =
                req.body.answers;


            if (
                !Array.isArray(answers)
            ) {

                return res.status(400).json({
                    message:
                        "Answers must be provided as an array"
                });

            }


            // ==================================================
            // EVALUATE ANSWERS
            // ==================================================

            let totalScore = 0;


            interview.questions =
                interview.questions.map(
                    (item, index) => {

                        const answer =
                            answers[index] || "";


                        // Simple AI-style evaluation
                        // based on answer quality

                        let score = 0;


                        if (
                            answer.trim().length >=
                            100
                        ) {

                            score = 90;

                        }
                        else if (
                            answer.trim().length >=
                            70
                        ) {

                            score = 80;

                        }
                        else if (
                            answer.trim().length >=
                            40
                        ) {

                            score = 70;

                        }
                        else if (
                            answer.trim().length >=
                            20
                        ) {

                            score = 60;

                        }
                        else if (
                            answer.trim().length > 0
                        ) {

                            score = 40;

                        }
                        else {

                            score = 0;

                        }


                        totalScore += score;


                        let feedback;


                        if (score >= 80) {

                            feedback =
                                "Strong and relevant answer.";

                        }
                        else if (score >= 60) {

                            feedback =
                                "Good answer, but it could be explained in more detail.";

                        }
                        else if (score >= 40) {

                            feedback =
                                "The answer needs more explanation and relevant details.";

                        }
                        else {

                            feedback =
                                "No sufficient answer provided.";

                        }


                        return {

                            question:
                                item.question,

                            answer:
                                answer,

                            score:
                                score,

                            feedback:
                                feedback

                        };

                    }
                );


            // ==================================================
            // FINAL SCORE
            // ==================================================

            const finalScore =
                Math.round(
                    totalScore /
                    interview.questions.length
                );


            // ==================================================
            // FINAL RESULT
            // ==================================================

            let result;
            let recommendation;
            let summary;


            if (
                finalScore >= 80
            ) {

                result =
                    "Excellent";

                recommendation =
                    "Highly Recommended";

                summary =
                    "The candidate performed very well during the AI interview and provided strong answers.";

            }
            else if (
                finalScore >= 60
            ) {

                result =
                    "Good";

                recommendation =
                    "Recommended";

                summary =
                    "The candidate demonstrated good knowledge and communication during the AI interview.";

            }
            else if (
                finalScore >= 40
            ) {

                result =
                    "Average";

                recommendation =
                    "Needs Review";

                summary =
                    "The candidate showed some relevant knowledge but needs improvement in several areas.";

            }
            else {

                result =
                    "Poor";

                recommendation =
                    "Not Recommended";

                summary =
                    "The candidate did not provide sufficiently strong answers during the AI interview.";

            }


            // ==================================================
            // SAVE INTERVIEW
            // ==================================================

            interview.status =
                "Completed";

            interview.totalScore =
                finalScore;

            interview.result =
                result;

            interview.recommendation =
                recommendation;

            interview.summary =
                summary;

            interview.completedAt =
                new Date();


            await interview.save();


            // ==================================================
            // RETURN RESULT
            // ==================================================

            res.status(200).json({

                message:
                    "AI interview completed successfully",

                interview: {

                    id:
                        interview._id,

                    totalScore:
                        finalScore,

                    result:
                        result,

                    recommendation:
                        recommendation,

                    summary:
                        summary,

                    questions:
                        interview.questions,

                    completedAt:
                        interview.completedAt

                }

            });

        }

        catch (error) {

            console.error(
                "Submit interview error:",
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
// CANDIDATE - GET MY INTERVIEW
// GET /api/interviews/my-interview/:applicationId
// ======================================================

router.get(
    "/my-interview/:applicationId",
    protect,
    roleMiddleware(["candidate"]),

    async (req, res) => {

        try {

            const interview =
                await Interview.findOne({

                    application:
                        req.params.applicationId,

                    candidate:
                        req.user.id

                })
                .populate(
                    "job",
                    "title company location"
                );


            if (!interview) {

                return res.status(404).json({
                    message:
                        "Interview not found"
                });

            }


            res.status(200).json({

                message:
                    "Interview fetched successfully",

                interview

            });

        }

        catch (error) {

            console.error(
                "Get interview error:",
                error
            );

            res.status(500).json({

                message:
                    "Unable to fetch interview",

                error:
                    error.message

            });

        }

    }
);


// ======================================================
// RECRUITER - VIEW INTERVIEW RESULT
// GET /api/interviews/recruiter/:applicationId
// ======================================================

router.get(
    "/recruiter/:applicationId",
    protect,
    roleMiddleware(["recruiter"]),

    async (req, res) => {

        try {

            const application =
                await Application.findById(
                    req.params.applicationId
                )
                .populate("job");


            if (!application) {

                return res.status(404).json({
                    message:
                        "Application not found"
                });

            }


            if (!application.job) {

                return res.status(404).json({
                    message:
                        "Job not found"
                });

            }


            // ==================================================
            // CHECK RECRUITER
            // ==================================================

            if (
                application.job.createdBy.toString() !==
                req.user.id
            ) {

                return res.status(403).json({
                    message:
                        "You are not authorized to view this interview"
                });

            }


            const interview =
                await Interview.findOne({
                    application:
                        application._id
                })
                .populate(
                    "candidate",
                    "name email"
                )
                .populate(
                    "job",
                    "title company"
                );


            if (!interview) {

                return res.status(404).json({
                    message:
                        "Candidate has not started the AI interview yet."
                });

            }


            res.status(200).json({

                message:
                    "Interview result fetched successfully",

                interview

            });

        }

        catch (error) {

            console.error(
                "Recruiter interview error:",
                error
            );

            res.status(500).json({

                message:
                    "Unable to fetch interview result",

                error:
                    error.message

            });

        }

    }
);


// ======================================================
// TEST ROUTE
// GET /api/interviews/test
// ======================================================

router.get(
    "/test",
    (req, res) => {

        res.json({

            message:
                "Interview routes are working"

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
