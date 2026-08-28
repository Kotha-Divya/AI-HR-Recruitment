const express = require("express");
const Job = require("../models/Job");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================================
// GET JOB RECOMMENDATIONS
// GET /api/recommendations
// ======================================================

router.get(
    "/",
    protect,
    async (req, res) => {
        try {
            // Get logged-in candidate
            const user = await User.findById(req.user.id);

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            // Get candidate profile
            const profile = user.profile || {};

            let candidateSkills = profile.skills || [];

            // Convert skills to lowercase
            candidateSkills = candidateSkills.map(
                (skill) =>
                    skill.trim().toLowerCase()
            );

            // Remove empty skills
            candidateSkills =
                candidateSkills.filter(
                    (skill) => skill !== ""
                );

            // Get all jobs
            const jobs = await Job.find()
                .populate(
                    "createdBy",
                    "name email"
                );

            // Calculate recommendation score
            const recommendations =
                jobs.map((job) => {
                    const jobSkills =
                        (job.skills || []).map(
                            (skill) =>
                                skill
                                    .trim()
                                    .toLowerCase()
                        );

                    let matchingSkills = [];

                    jobSkills.forEach(
                        (jobSkill) => {
                            if (
                                candidateSkills.includes(
                                    jobSkill
                                )
                            ) {
                                matchingSkills.push(
                                    jobSkill
                                );
                            }
                        }
                    );

                    let matchPercentage = 0;

                    if (jobSkills.length > 0) {
                        matchPercentage =
                            Math.round(
                                (matchingSkills.length /
                                    jobSkills.length) *
                                    100
                            );
                    }

                    return {
                        job,
                        matchPercentage,
                        matchingSkills
                    };
                });

            // Highest matching jobs first
            recommendations.sort(
                (a, b) =>
                    b.matchPercentage -
                    a.matchPercentage
            );

            res.json({
                message:
                    "Job recommendations fetched successfully",
                recommendations
            });

        } catch (error) {
            console.error(
                "Recommendation error:",
                error
            );

            res.status(500).json({
                message: error.message
            });
        }
    }
);

module.exports = router;