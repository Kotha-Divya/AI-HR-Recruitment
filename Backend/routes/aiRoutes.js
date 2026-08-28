const express = require("express");

const Application = require("../models/Application");
const protect = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


// ======================================================
// AI RESUME SCREENING
// POST /api/ai/screen-resume/:applicationId
// RECRUITER ONLY
// ======================================================

router.post(
    "/screen-resume/:applicationId",
    protect,
    roleMiddleware(["recruiter"]),
    async (req, res) => {

        try {

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


            if (!application.job) {

                return res.status(404).json({
                    message: "Job not found"
                });

            }


            if (!application.candidate) {

                return res.status(404).json({
                    message: "Candidate not found"
                });

            }


            const job = application.job;
            const candidate = application.candidate;


            // ==================================================
            // CHECK RECRUITER
            // ==================================================

            if (
                job.createdBy.toString() !==
                req.user.id
            ) {

                return res.status(403).json({
                    message:
                        "You are not authorized to screen this application"
                });

            }


            // ==================================================
            // CHECK RESUME
            // ==================================================

            if (!candidate.resume) {

                return res.status(400).json({
                    message:
                        "Candidate has not uploaded a resume"
                });

            }


            // ==================================================
            // CANDIDATE SKILLS
            // ==================================================

            const candidateSkills =
                Array.isArray(candidate.skills)
                    ? candidate.skills
                    : [];


            // ==================================================
            // JOB SKILLS
            // ==================================================

            const jobSkills =
                Array.isArray(job.skills)
                    ? job.skills
                    : [];


            // ==================================================
            // NORMALIZE SKILLS
            // ==================================================

            const normalizedCandidateSkills =
                candidateSkills.map(
                    skill =>
                        String(skill)
                            .toLowerCase()
                            .trim()
                );


            // ==================================================
            // MATCHED SKILLS
            // ==================================================

            const matchedSkills =
                jobSkills.filter(
                    jobSkill => {

                        const normalizedJobSkill =
                            String(jobSkill)
                                .toLowerCase()
                                .trim();

                        return normalizedCandidateSkills.some(
                            candidateSkill =>
                                candidateSkill ===
                                normalizedJobSkill
                        );

                    }
                );


            // ==================================================
            // MISSING SKILLS
            // ==================================================

            const missingSkills =
                jobSkills.filter(
                    jobSkill => {

                        const normalizedJobSkill =
                            String(jobSkill)
                                .toLowerCase()
                                .trim();

                        return !normalizedCandidateSkills.some(
                            candidateSkill =>
                                candidateSkill ===
                                normalizedJobSkill
                        );

                    }
                );


            // ==================================================
            // MATCH SCORE
            // ==================================================

            let matchScore = 50;


            if (jobSkills.length > 0) {

                matchScore =
                    Math.round(
                        (
                            matchedSkills.length /
                            jobSkills.length
                        ) * 100
                    );

            }


            // ==================================================
            // SCREENING RESULT
            // ==================================================

            let screeningResult;


            if (matchScore >= 80) {

                screeningResult =
                    "Strong Match";

            }
            else if (matchScore >= 60) {

                screeningResult =
                    "Good Match";

            }
            else if (matchScore >= 40) {

                screeningResult =
                    "Partial Match";

            }
            else {

                screeningResult =
                    "Low Match";

            }


            // ==================================================
            // RECOMMENDATION
            // ==================================================

            let recommendation;


            if (matchScore >= 80) {

                recommendation =
                    "Shortlist Candidate";

            }
            else if (matchScore >= 60) {

                recommendation =
                    "Review Candidate";

            }
            else {

                recommendation =
                    "Do Not Shortlist";

            }


            // ==================================================
            // SUMMARY
            // ==================================================

            let summary;


            if (matchScore >= 80) {

                summary =
                    `The candidate is a strong match for the ${job.title} position. Most required skills are present.`;

            }
            else if (matchScore >= 60) {

                summary =
                    `The candidate is a good match for the ${job.title} position, but some required skills are missing.`;

            }
            else if (matchScore >= 40) {

                summary =
                    `The candidate has some relevant skills for the ${job.title} position, but several required skills are missing.`;

            }
            else {

                summary =
                    `The candidate has a low skill match for the ${job.title} position.`;

            }


            // ==================================================
            // SAVE SCREENING
            // ==================================================

            application.aiScreening = {

                screened: true,

                matchScore,

                screeningResult,

                recommendation,

                matchedSkills,

                missingSkills,

                summary,

                screenedAt: new Date()

            };


            await application.save();


            // ==================================================
            // RESPONSE
            // ==================================================

            res.status(200).json({

                message:
                    "AI resume screening completed successfully",

                screening: {

                    applicationId:
                        application._id,

                    candidateName:
                        candidate.name,

                    candidateEmail:
                        candidate.email,

                    resume:
                        candidate.resume,

                    jobTitle:
                        job.title,

                    matchScore,

                    screeningResult,

                    recommendation,

                    matchedSkills,

                    missingSkills,

                    summary,

                    screenedAt:
                        application
                            .aiScreening
                            .screenedAt

                }

            });

        }
        catch (error) {

            console.error(
                "AI resume screening error:",
                error
            );

            res.status(500).json({

                message:
                    "AI resume screening failed",

                error:
                    error.message

            });

        }

    }
);



// ======================================================
// AI INTERVIEW - START
// POST /api/ai/start-interview/:applicationId
// CANDIDATE ONLY
// ======================================================

router.post(
    "/start-interview/:applicationId",
    protect,
    roleMiddleware(["candidate"]),
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


            // ==================================================
            // CHECK CANDIDATE
            // ==================================================

            if (
                application.candidate.toString() !==
                req.user.id
            ) {

                return res.status(403).json({
                    message:
                        "You are not authorized to start this interview"
                });

            }


            if (!application.job) {

                return res.status(404).json({
                    message:
                        "Job not found"
                });

            }


            // ==================================================
            // CHECK SHORTLISTED
            // ==================================================

            if (
                application.status !==
                "Shortlisted"
            ) {

                return res.status(400).json({
                    message:
                        "You can start the AI interview only after your application is shortlisted"
                });

            }


            // ==================================================
            // REQUIRE RESUME SCREENING
            // ==================================================

            if (
                !application.aiScreening ||
                !application.aiScreening.screened
            ) {

                return res.status(400).json({
                    message:
                        "AI resume screening must be completed before starting the interview"
                });

            }


            // ==================================================
            // ALREADY COMPLETED
            // ==================================================

            if (
                application.aiInterview &&
                application.aiInterview.completed
            ) {

                return res.status(400).json({
                    message:
                        "Interview has already been completed"
                });

            }


            const job =
                application.job;


            const jobSkills =
                Array.isArray(job.skills)
                    ? job.skills
                    : [];


            let questions = [];


            // ==================================================
            // QUESTION 1
            // ==================================================

            questions.push({

                question:
                    `Tell me about yourself and why you are interested in the ${job.title} position.`,

                answer: "",

                score: 0,

                feedback: ""

            });


            // ==================================================
            // SKILL QUESTIONS
            // ==================================================

            jobSkills
                .slice(0, 4)
                .forEach(skill => {

                    questions.push({

                        question:
                            `What is your experience with ${skill}? Explain a project or task where you used ${skill}.`,

                        answer: "",

                        score: 0,

                        feedback: ""

                    });

                });


            // ==================================================
            // FINAL QUESTION
            // ==================================================

            questions.push({

                question:
                    `Why should we select you for the ${job.title} position?`,

                answer: "",

                score: 0,

                feedback: ""

            });


            // ==================================================
            // SAVE INTERVIEW
            // ==================================================

            application.aiInterview = {

                started: true,

                completed: false,

                questions,

                interviewScore: 0,

                interviewResult: "",

                recommendation: "",

                summary: "",

                candidateDecision: "Pending",

                candidateFeedback: "",

                startedAt: new Date(),

                completedAt: null

            };


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

                    totalQuestions:
                        questions.length,

                    currentQuestion:
                        0,

                    question:
                        questions[0].question

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
// AI INTERVIEW - SUBMIT ANSWER
// POST /api/ai/submit-answer/:applicationId
// CANDIDATE ONLY
// ======================================================

router.post(
    "/submit-answer/:applicationId",
    protect,
    roleMiddleware(["candidate"]),
    async (req, res) => {

        try {

            const {
                questionIndex,
                answer
            } = req.body;


            // ==================================================
            // VALIDATE
            // ==================================================

            if (
                questionIndex === undefined ||
                answer === undefined
            ) {

                return res.status(400).json({

                    message:
                        "Question index and answer are required"

                });

            }


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


            // ==================================================
            // CHECK CANDIDATE
            // ==================================================

            if (
                application.candidate.toString() !==
                req.user.id
            ) {

                return res.status(403).json({

                    message:
                        "You are not authorized to answer this interview"

                });

            }


            // ==================================================
            // CHECK INTERVIEW
            // ==================================================

            if (
                !application.aiInterview ||
                !application.aiInterview.started
            ) {

                return res.status(400).json({

                    message:
                        "Interview has not been started"

                });

            }


            if (
                application.aiInterview.completed
            ) {

                return res.status(400).json({

                    message:
                        "Interview has already been completed"

                });

            }


            const index =
                Number(questionIndex);


            if (
                !Number.isInteger(index) ||
                index < 0 ||
                index >=
                application.aiInterview.questions.length
            ) {

                return res.status(400).json({

                    message:
                        "Invalid question index"

                });

            }


            // ==================================================
            // CLEAN ANSWER
            // ==================================================

            const cleanAnswer =
                String(answer).trim();


            if (!cleanAnswer) {

                return res.status(400).json({

                    message:
                        "Please provide an answer"

                });

            }


            const question =
                application
                    .aiInterview
                    .questions[index];


            // ==================================================
            // SAVE ANSWER
            // ==================================================

            question.answer =
                cleanAnswer;


            // ==================================================
            // SIMPLE AI EVALUATION
            // ==================================================

            const answerWords =
                cleanAnswer
                    .toLowerCase()
                    .split(/\s+/);


            let score = 0;


            // ==================================================
            // ANSWER LENGTH
            // ==================================================

            if (
                answerWords.length >= 40
            ) {

                score += 30;

            }
            else if (
                answerWords.length >= 20
            ) {

                score += 20;

            }
            else if (
                answerWords.length >= 10
            ) {

                score += 10;

            }


            // ==================================================
            // SKILL RELEVANCE
            // ==================================================

            const jobSkills =
                Array.isArray(
                    application.job.skills
                )
                    ? application.job.skills
                    : [];


            let skillMatches = 0;


            jobSkills.forEach(skill => {

                const normalizedSkill =
                    String(skill)
                        .toLowerCase()
                        .trim();


                // Handle multi-word skills

                const skillWords =
                    normalizedSkill
                        .split(/\s+/);


                const answerText =
                    cleanAnswer
                        .toLowerCase();


                if (
                    answerText.includes(
                        normalizedSkill
                    )
                ) {

                    skillMatches++;

                }
                else if (
                    skillWords.length === 1 &&
                    answerWords.includes(
                        normalizedSkill
                    )
                ) {

                    skillMatches++;

                }

            });


            if (skillMatches >= 3) {

                score += 50;

            }
            else if (skillMatches >= 2) {

                score += 35;

            }
            else if (skillMatches >= 1) {

                score += 20;

            }


            // ==================================================
            // GENERAL QUALITY
            // ==================================================

            if (
                cleanAnswer.includes(".")
            ) {

                score += 10;

            }


            if (
                cleanAnswer.length >= 100
            ) {

                score += 10;

            }


            // ==================================================
            // MAXIMUM 100
            // ==================================================

            score =
                Math.min(
                    score,
                    100
                );


            // ==================================================
            // FEEDBACK
            // ==================================================

            let feedback;


            if (score >= 80) {

                feedback =
                    "Excellent answer with good relevance and detail.";

            }
            else if (score >= 60) {

                feedback =
                    "Good answer. More technical detail could improve it.";

            }
            else if (score >= 40) {

                feedback =
                    "Average answer. Try to provide more relevant examples and details.";

            }
            else {

                feedback =
                    "The answer needs more detail and relevance to the question.";

            }


            question.score =
                score;


            question.feedback =
                feedback;


            await application.save();


            // ==================================================
            // NEXT QUESTION
            // ==================================================

            const nextIndex =
                index + 1;


            if (
                nextIndex <
                application.aiInterview.questions.length
            ) {

                return res.status(200).json({

                    message:
                        "Answer submitted successfully",

                    completed: false,

                    score,

                    feedback,

                    nextQuestionIndex:
                        nextIndex,

                    nextQuestion:
                        application
                            .aiInterview
                            .questions[nextIndex]
                            .question

                });

            }


            // ==================================================
            // ALL QUESTIONS ANSWERED
            // ==================================================

            return res.status(200).json({

                message:
                    "All interview questions answered",

                completed: true,

                score,

                feedback,

                nextQuestionIndex:
                    null,

                nextQuestion:
                    null

            });

        }
        catch (error) {

            console.error(
                "Submit answer error:",
                error
            );

            res.status(500).json({

                message:
                    "Unable to submit interview answer",

                error:
                    error.message

            });

        }

    }
);



// ======================================================
// AI INTERVIEW - COMPLETE
// POST /api/ai/complete-interview/:applicationId
// CANDIDATE ONLY
// ======================================================

router.post(
    "/complete-interview/:applicationId",
    protect,
    roleMiddleware(["candidate"]),
    async (req, res) => {

        try {

            const application =
                await Application.findById(
                    req.params.applicationId
                )
                    .populate("job")
                    .populate(
                        "candidate",
                        "name email"
                    );


            if (!application) {

                return res.status(404).json({

                    message:
                        "Application not found"

                });

            }


            // ==================================================
            // CHECK CANDIDATE
            // ==================================================

            const candidateId =
                application.candidate?._id
                    ? application.candidate._id.toString()
                    : application.candidate.toString();


            if (
                candidateId !==
                req.user.id
            ) {

                return res.status(403).json({

                    message:
                        "You are not authorized to complete this interview"

                });

            }


            // ==================================================
            // CHECK INTERVIEW
            // ==================================================

            if (
                !application.aiInterview ||
                !application.aiInterview.started
            ) {

                return res.status(400).json({

                    message:
                        "Interview has not been started"

                });

            }


            if (
                application.aiInterview.completed
            ) {

                return res.status(400).json({

                    message:
                        "Interview has already been completed"

                });

            }


            const questions =
                application.aiInterview.questions;


            // ==================================================
            // CHECK ALL ANSWERS
            // ==================================================

            const unanswered =
                questions.filter(
                    question =>
                        !question.answer ||
                        question.answer.trim() === ""
                );


            if (
                unanswered.length > 0
            ) {

                return res.status(400).json({

                    message:
                        "Please answer all interview questions before completing the interview"

                });

            }


            // ==================================================
            // CALCULATE FINAL SCORE
            // ==================================================

            const totalScore =
                questions.reduce(
                    (total, question) =>
                        total +
                        Number(
                            question.score || 0
                        ),
                    0
                );


            const interviewScore =
                questions.length > 0
                    ? Math.round(
                        totalScore /
                        questions.length
                    )
                    : 0;


            // ==================================================
            // INTERVIEW RESULT
            // ==================================================

            let interviewResult;


            if (
                interviewScore >= 80
            ) {

                interviewResult =
                    "Excellent Candidate";

            }
            else if (
                interviewScore >= 65
            ) {

                interviewResult =
                    "Good Candidate";

            }
            else if (
                interviewScore >= 50
            ) {

                interviewResult =
                    "Average Candidate";

            }
            else {

                interviewResult =
                    "Needs Improvement";

            }


            // ==================================================
            // RECOMMENDATION
            // ==================================================

            let recommendation;


            if (
                interviewScore >= 80
            ) {

                recommendation =
                    "Recommend for Selection";

            }
            else if (
                interviewScore >= 65
            ) {

                recommendation =
                    "Recommend for Further Review";

            }
            else {

                recommendation =
                    "Not Recommended";

            }


            // ==================================================
            // SUMMARY
            // ==================================================

            let summary;


            if (
                interviewScore >= 80
            ) {

                summary =
                    "The candidate demonstrated strong communication, relevant knowledge, and good understanding of the job requirements.";

            }
            else if (
                interviewScore >= 65
            ) {

                summary =
                    "The candidate demonstrated good knowledge and communication skills but may require further evaluation.";

            }
            else if (
                interviewScore >= 50
            ) {

                summary =
                    "The candidate demonstrated some relevant knowledge but needs improvement in several areas.";

            }
            else {

                summary =
                    "The candidate's interview performance was below the expected level for this position.";

            }


            // ==================================================
            // SAVE RESULT
            // ==================================================

            application.aiInterview.completed =
                true;


            application.aiInterview.interviewScore =
                interviewScore;


            application.aiInterview.interviewResult =
                interviewResult;


            application.aiInterview.recommendation =
                recommendation;


            application.aiInterview.summary =
                summary;


            application.aiInterview.completedAt =
                new Date();


            // Keep candidate decision Pending
            // Recruiter will decide Selected / Rejected

            application.aiInterview.candidateDecision =
                "Pending";


            application.aiInterview.candidateFeedback =
                "";


            await application.save();


            // ==================================================
            // RESPONSE
            // ==================================================

            return res.status(200).json({

                message:
                    "AI interview completed successfully",

                interview: {

                    applicationId:
                        application._id,

                    candidateName:
                        application.candidate.name,

                    jobTitle:
                        application.job.title,

                    interviewScore,

                    interviewResult,

                    recommendation,

                    summary,

                    completedAt:
                        application
                            .aiInterview
                            .completedAt

                }

            });

        }
        catch (error) {

            console.error(
                "Complete interview error:",
                error
            );

            res.status(500).json({

                message:
                    "Unable to complete AI interview",

                error:
                    error.message

            });

        }

    }
);



// ======================================================
// RECRUITER - GET FULL AI INTERVIEW RESULT
// GET /api/ai/interview-result/:applicationId
// RECRUITER ONLY
// ======================================================

router.get(
    "/interview-result/:applicationId",
    protect,
    roleMiddleware(["recruiter"]),
    async (req, res) => {

        try {

            const application =
                await Application.findById(
                    req.params.applicationId
                )
                    .populate("job")
                    .populate(
                        "candidate",
                        "name email"
                    );


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
            // CHECK RECRUITER OWNERSHIP
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


            if (
                !application.aiInterview ||
                !application.aiInterview.completed
            ) {

                return res.status(400).json({

                    message:
                        "AI interview has not been completed yet"

                });

            }


            // ==================================================
            // FULL RECRUITER RESPONSE
            // ==================================================

            return res.status(200).json({

                message:
                    "AI interview result fetched successfully",

                interview: {

                    applicationId:
                        application._id,

                    candidateName:
                        application
                            .candidate
                            .name,

                    candidateEmail:
                        application
                            .candidate
                            .email,

                    jobTitle:
                        application
                            .job
                            .title,

                    interviewScore:
                        application
                            .aiInterview
                            .interviewScore,

                    interviewResult:
                        application
                            .aiInterview
                            .interviewResult,

                    recommendation:
                        application
                            .aiInterview
                            .recommendation,

                    summary:
                        application
                            .aiInterview
                            .summary,

                    candidateDecision:
                        application
                            .aiInterview
                            .candidateDecision,

                    candidateFeedback:
                        application
                            .aiInterview
                            .candidateFeedback,

                    questions:
                        application
                            .aiInterview
                            .questions,

                    startedAt:
                        application
                            .aiInterview
                            .startedAt,

                    completedAt:
                        application
                            .aiInterview
                            .completedAt

                }

            });

        }
        catch (error) {

            console.error(
                "Interview result error:",
                error
            );

            return res.status(500).json({

                message:
                    "Unable to get interview result",

                error:
                    error.message

            });

        }

    }
);



// ======================================================
// RECRUITER - SELECT / REJECT CANDIDATE
// PUT /api/ai/interview-decision/:applicationId
// RECRUITER ONLY
// ======================================================

router.put(
    "/interview-decision/:applicationId",
    protect,
    roleMiddleware(["recruiter"]),
    async (req, res) => {

        try {

            const {
                decision,
                feedback
            } = req.body;


            // ==================================================
            // VALIDATE
            // ==================================================

            if (
                !decision ||
                !["Selected", "Rejected"].includes(
                    decision
                )
            ) {

                return res.status(400).json({

                    message:
                        "Decision must be Selected or Rejected"

                });

            }


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
            // CHECK RECRUITER OWNERSHIP
            // ==================================================

            if (
                application.job.createdBy.toString() !==
                req.user.id
            ) {

                return res.status(403).json({

                    message:
                        "You are not authorized to update this application"

                });

            }


            // ==================================================
            // CHECK INTERVIEW
            // ==================================================

            if (
                !application.aiInterview ||
                !application.aiInterview.completed
            ) {

                return res.status(400).json({

                    message:
                        "AI interview must be completed first"

                });

            }


            // ==================================================
            // SAVE DECISION
            // ==================================================

            application.aiInterview
                .candidateDecision =
                decision;


            application.aiInterview
                .candidateFeedback =
                feedback
                    ? String(feedback).trim()
                    : "";


            // Update main application status

            application.status =
                decision;


            await application.save();


            // ==================================================
            // RESPONSE
            // ==================================================

            return res.status(200).json({

                message:
                    `Candidate ${decision.toLowerCase()} successfully`,

                decision: {

                    applicationId:
                        application._id,

                    decision,

                    feedback:
                        application
                            .aiInterview
                            .candidateFeedback,

                    applicationStatus:
                        application.status

                }

            });

        }
        catch (error) {

            console.error(
                "Interview decision error:",
                error
            );

            return res.status(500).json({

                message:
                    "Unable to update interview decision",

                error:
                    error.message

            });

        }

    }
);



// ======================================================
// CANDIDATE - GET OWN INTERVIEW RESULT
// GET /api/ai/my-interview-result/:applicationId
// CANDIDATE ONLY
// ======================================================

router.get(
    "/my-interview-result/:applicationId",
    protect,
    roleMiddleware(["candidate"]),
    async (req, res) => {

        try {

            const application =
                await Application.findById(
                    req.params.applicationId
                )
                    .populate(
                        "job",
                        "title company"
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
                application.candidate.toString() !==
                req.user.id
            ) {

                return res.status(403).json({

                    message:
                        "You are not authorized to view this interview result"

                });

            }


            // ==================================================
            // CHECK INTERVIEW
            // ==================================================

            if (
                !application.aiInterview ||
                !application.aiInterview.completed
            ) {

                return res.status(400).json({

                    message:
                        "AI interview has not been completed yet"

                });

            }


            // ==================================================
            // CANDIDATE ONLY GETS:
            // STATUS + FEEDBACK
            //
            // NO SCORE
            // NO RECOMMENDATION
            // NO QUESTIONS
            // NO INDIVIDUAL SCORES
            // ==================================================

            return res.status(200).json({

                message:
                    "Interview result fetched successfully",

                result: {

                    applicationId:
                        application._id,

                    jobTitle:
                        application
                            .job
                            ?.title ||
                        "",

                    status:
                        application
                            .aiInterview
                            .candidateDecision ||
                        "Pending",

                    feedback:
                        application
                            .aiInterview
                            .candidateFeedback ||
                        ""

                }

            });

        }
        catch (error) {

            console.error(
                "Candidate interview result error:",
                error
            );

            return res.status(500).json({

                message:
                    "Unable to get interview result",

                error:
                    error.message

            });

        }

    }
);



// ======================================================
// TEST ROUTE
// GET /api/ai/test
// ======================================================

router.get(
    "/test",
    (req, res) => {

        res.json({

            message:
                "AI Resume Screening and Interview routes are working"

        });

    }
);



// ======================================================
// ROUTE LOADED
// ======================================================

console.log(
    "AI RESUME SCREENING + AI INTERVIEW ROUTES LOADED"
);



// ======================================================
// EXPORT
// ======================================================

module.exports = router;
