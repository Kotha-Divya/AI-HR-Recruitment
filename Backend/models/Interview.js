const mongoose = require("mongoose");

// ======================================================
// INTERVIEW SCHEMA
// ======================================================

const interviewSchema = new mongoose.Schema(
    {
        // ==================================================
        // APPLICATION
        // ==================================================

        application: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
            required: true
        },

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
        // INTERVIEW STATUS
        // ==================================================

        status: {
            type: String,
            enum: [
                "Not Started",
                "In Progress",
                "Completed"
            ],
            default: "Not Started"
        },

        // ==================================================
        // QUESTIONS AND ANSWERS
        // ==================================================

        questions: [
            {
                question: {
                    type: String,
                    required: true
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
        // FINAL INTERVIEW SCORE
        // ==================================================

        totalScore: {
            type: Number,
            default: 0
        },

        // ==================================================
        // AI FINAL RESULT
        // ==================================================

        result: {
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

        strengths: {
            type: [String],
            default: []
        },

        weaknesses: {
            type: [String],
            default: []
        },

        // ==================================================
        // INTERVIEW DATES
        // ==================================================

        startedAt: {
            type: Date,
            default: null
        },

        completedAt: {
            type: Date,
            default: null
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
    "Interview",
    interviewSchema
);
