const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["candidate", "recruiter"],
            default: "candidate"
        },

        // Candidate profile
        phone: {
            type: String,
            default: ""
        },

        location: {
            type: String,
            default: ""
        },

        skills: {
            type: [String],
            default: []
        },

        education: {
            type: String,
            default: ""
        },

        experience: {
            type: String,
            default: ""
        },

        resume: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model("User", userSchema);