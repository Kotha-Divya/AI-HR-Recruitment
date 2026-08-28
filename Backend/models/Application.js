const mongoose = require("mongoose");

// ======================================================
// APPLICATION SCHEMA
// ======================================================

const applicationSchema = new mongoose.Schema(
    {
        // ==================================================
        // JOB
        // ==================================================

        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true
        },

        // ==================================================
        // CANDIDATE
        // ==================================================

        candidate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // ==================================================
        // APPLICATION STATUS
        // ==================================================

        status: {
            type: String,
            enum: [
                "Applied",
                "Shortlisted",
                "Rejected",
                "Selected"
            ],
            default: "Applied"
        },

        // ==================================================
        // AI RESUME SCREENING
        // ==================================================

        aiScreening: {

            screened: {
                type: Boolean,
                default: false
            },

            matchScore: {
                type: Number,
                default: 0
            },

            screeningResult: {
                type: String,
                default: ""
            },

            recommendation: {
                type: String,
                default: ""
            },

            matchedSkills: {
                type: [String],
                default: []
            },

            missingSkills: {
                type: [String],
                default: []
            },

            summary: {
                type: String,
                default: ""
            },

            screenedAt: {
                type: Date,
                default: null
            }
        },

        // ==================================================
        // AI INTERVIEW
        // ==================================================

        aiInterview: {

            started: {
                type: Boolean,
                default: false
            },

            completed: {
                type: Boolean,
                default: false
            },

            startedAt: {
                type: Date,
                default: null
            },

            completedAt: {
                type: Date,
                default: null
            },

            // ==================================================
            // QUESTIONS
            // ==================================================

            questions: [
                {
                    question: {
                        type: String,
                        default: ""
                    },

                    answer: {
                        type: String,
                        default: ""
                    },

                    score: {
                        type: Number,
                        default: 0
                    },

                    feedback: {
                        type: String,
                        default: ""
                    }
                }
            ],

            // ==================================================
            // FINAL AI INTERVIEW EVALUATION
            // ==================================================

            interviewScore: {
                type: Number,
                default: 0
            },

            interviewResult: {
                type: String,
                default: ""
            },

            recommendation: {
                type: String,
                default: ""
            },

            summary: {
                type: String,
                default: ""
            },

            // ==================================================
            // CANDIDATE-FACING RESULT
            // ==================================================

            candidateDecision: {
                type: String,
                enum: [
                    "Pending",
                    "Selected",
                    "Rejected"
                ],
                default: "Pending"
            },

            candidateFeedback: {
                type: String,
                default: ""
            }
        }
    },

    {
        timestamps: true
    }
);


// ======================================================
// EXPORT
// ======================================================

module.exports = mongoose.model(
    "Application",
    applicationSchema
);
