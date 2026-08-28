import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AISkillAnalysis() {

    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    // ======================================================
    // LOAD PROFILE
    // ======================================================

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {

        try {

            const token =
                localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await fetch(
                "http://localhost:5000/api/profile",
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const data =
                await response.json();

            console.log(
                "AI SKILL PROFILE:",
                data
            );

            if (!response.ok) {

                setMessage(
                    data.message ||
                    "Unable to load profile."
                );

                return;
            }

            setProfile(data.user);

        }
        catch (error) {

            console.error(
                "AI Skill Analysis error:",
                error
            );

            setMessage(
                "Unable to connect to server."
            );

        }
        finally {

            setLoading(false);

        }

    };


    // ======================================================
    // ANALYZE SKILLS
    // ======================================================

    const getSkills = () => {

        if (
            !profile ||
            !Array.isArray(profile.skills)
        ) {
            return [];
        }

        return profile.skills;

    };


    // ======================================================
    // SKILL STRENGTH
    // ======================================================

    const getSkillStrength = (
        skill,
        index
    ) => {

        const experience =
            String(
                profile?.experience || ""
            ).toLowerCase();

        const skillLower =
            String(skill).toLowerCase();

        let score = 60;

        if (
            experience.includes(
                skillLower
            )
        ) {
            score += 15;
        }

        if (index === 0) {
            score += 10;
        }

        if (score > 95) {
            score = 95;
        }

        return score;

    };


    // ======================================================
    // RECOMMENDED SKILLS
    // ======================================================

    const getRecommendedSkills = () => {

        const skills =
            getSkills().map(
                skill =>
                    String(skill).toLowerCase()
            );

        const recommendations = [

            "Machine Learning",
            "Data Analytics",
            "Artificial Intelligence",
            "Deep Learning",
            "MongoDB",
            "React",
            "Node.js",
            "Cloud Computing"

        ];

        return recommendations.filter(
            skill =>
                !skills.includes(
                    skill.toLowerCase()
                )
        ).slice(0, 5);

    };


    // ======================================================
    // SKILL GAP
    // ======================================================

    const getSkillGaps = () => {

        const skills =
            getSkills().map(
                skill =>
                    String(skill).toLowerCase()
            );

        const importantSkills = [

            "Python",
            "SQL",
            "Machine Learning",
            "Data Analytics",
            "Artificial Intelligence",
            "Java",
            "React",
            "MongoDB"

        ];

        return importantSkills.filter(
            skill =>
                !skills.includes(
                    skill.toLowerCase()
                )
        ).slice(0, 5);

    };


    // ======================================================
    // LOGOUT
    // ======================================================

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");

        navigate("/login");

    };


    // ======================================================
    // LOADING
    // ======================================================

    if (loading) {

        return (

            <div
                style={{
                    padding: "40px",
                    textAlign: "center"
                }}
            >

                <h2>
                    Loading AI Skill Analysis...
                </h2>

            </div>

        );

    }


    // ======================================================
    // ERROR
    // ======================================================

    if (!profile) {

        return (

            <div
                style={{
                    padding: "40px",
                    textAlign: "center"
                }}
            >

                <h2>
                    AI Skill Analysis
                </h2>

                <p>
                    {message ||
                        "Profile information not available."}
                </p>

                <button
                    onClick={() =>
                        navigate("/profile")
                    }
                >
                    Complete Profile
                </button>

            </div>

        );

    }


    const skills =
        getSkills();

    const skillGaps =
        getSkillGaps();

    const recommendedSkills =
        getRecommendedSkills();


    // ======================================================
    // PAGE
    // ======================================================

    return (

        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f5f7fb",
                padding: "30px"
            }}
        >

            {/* ==================================================
                HEADER
            ================================================== */}

            <div
                style={{
                    display: "flex",
                    justifyContent:
                        "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                    marginBottom: "30px"
                }}
            >

                <div>

                    <h1>
                        🤖 AI Skill Analysis
                    </h1>

                    <p>
                        Analyze your skills and identify
                        areas for improvement.
                    </p>

                </div>


                <div>

                    <button
                        onClick={() =>
                            navigate(
                                "/candidate-dashboard"
                            )
                        }

                        style={{
                            padding: "10px 16px",
                            marginRight: "10px",
                            cursor: "pointer"
                        }}
                    >
                        Back to Dashboard
                    </button>


                    <button
                        onClick={handleLogout}

                        style={{
                            padding: "10px 16px",
                            cursor: "pointer"
                        }}
                    >
                        Logout
                    </button>

                </div>

            </div>


            {/* ==================================================
                CANDIDATE SUMMARY
            ================================================== */}

            <div
                style={{
                    maxWidth: "900px",
                    margin: "0 auto"
                }}
            >

                <div
                    style={{
                        backgroundColor: "white",
                        padding: "25px",
                        borderRadius: "12px",
                        marginBottom: "20px",
                        boxShadow:
                            "0 2px 8px rgba(0,0,0,0.08)"
                    }}
                >

                    <h2>
                        👤 Candidate Profile
                    </h2>

                    <p>
                        <strong>
                            Name:
                        </strong>{" "}
                        {profile.name || "Not available"}
                    </p>

                    <p>
                        <strong>
                            Education:
                        </strong>{" "}
                        {profile.education ||
                            "Not specified"}
                    </p>

                    <p>
                        <strong>
                            Experience:
                        </strong>{" "}
                        {profile.experience ||
                            "Fresher / Not specified"}
                    </p>

                </div>


                {/* ==================================================
                    YOUR SKILLS
                ================================================== */}

                <div
                    style={{
                        backgroundColor: "white",
                        padding: "25px",
                        borderRadius: "12px",
                        marginBottom: "20px",
                        boxShadow:
                            "0 2px 8px rgba(0,0,0,0.08)"
                    }}
                >

                    <h2>
                        💡 Your Skills
                    </h2>

                    {skills.length === 0 ? (

                        <p>
                            No skills added yet.
                            Please update your profile.
                        </p>

                    ) : (

                        <div>

                            {skills.map(
                                (skill, index) => {

                                    const strength =
                                        getSkillStrength(
                                            skill,
                                            index
                                        );

                                    return (

                                        <div
                                            key={index}
                                            style={{
                                                marginBottom:
                                                    "18px"
                                            }}
                                        >

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    justifyContent:
                                                        "space-between"
                                                }}
                                            >

                                                <strong>
                                                    {skill}
                                                </strong>

                                                <span>
                                                    {strength}%
                                                </span>

                                            </div>


                                            <div
                                                style={{
                                                    height:
                                                        "10px",
                                                    backgroundColor:
                                                        "#e9ecef",
                                                    borderRadius:
                                                        "10px",
                                                    marginTop:
                                                        "6px"
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        width:
                                                            `${strength}%`,
                                                        height:
                                                            "100%",
                                                        backgroundColor:
                                                            "#0d6efd",
                                                        borderRadius:
                                                            "10px"
                                                    }}
                                                />

                                            </div>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    )}

                </div>


                {/* ==================================================
                    SKILL GAPS
                ================================================== */}

                <div
                    style={{
                        backgroundColor: "white",
                        padding: "25px",
                        borderRadius: "12px",
                        marginBottom: "20px",
                        boxShadow:
                            "0 2px 8px rgba(0,0,0,0.08)"
                    }}
                >

                    <h2>
                        📊 Skill Gaps
                    </h2>

                    <p>
                        These skills could improve your
                        career opportunities.
                    </p>


                    {skillGaps.length === 0 ? (

                        <p>
                            🎉 No major skill gaps detected.
                        </p>

                    ) : (

                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "10px"
                            }}
                        >

                            {skillGaps.map(
                                (skill, index) => (

                                    <span
                                        key={index}
                                        style={{
                                            padding:
                                                "8px 14px",
                                            backgroundColor:
                                                "#fff3cd",
                                            color:
                                                "#856404",
                                            borderRadius:
                                                "20px",
                                            fontWeight:
                                                "bold"
                                        }}
                                    >
                                        {skill}
                                    </span>

                                )
                            )}

                        </div>

                    )}

                </div>


                {/* ==================================================
                    RECOMMENDED SKILLS
                ================================================== */}

                <div
                    style={{
                        backgroundColor: "white",
                        padding: "25px",
                        borderRadius: "12px",
                        marginBottom: "20px",
                        boxShadow:
                            "0 2px 8px rgba(0,0,0,0.08)"
                    }}
                >

                    <h2>
                        🚀 Recommended Skills
                    </h2>

                    <p>
                        Consider learning these skills
                        to improve your profile.
                    </p>


                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "10px"
                        }}
                    >

                        {recommendedSkills.map(
                            (skill, index) => (

                                <span
                                    key={index}
                                    style={{
                                        padding:
                                            "8px 14px",
                                        backgroundColor:
                                            "#d1e7dd",
                                        color:
                                            "#0f5132",
                                        borderRadius:
                                            "20px",
                                        fontWeight:
                                            "bold"
                                    }}
                                >
                                    {skill}
                                </span>

                            )
                        )}

                    </div>

                </div>


                {/* ==================================================
                    AI CAREER SUGGESTION
                ================================================== */}

                <div
                    style={{
                        backgroundColor: "white",
                        padding: "25px",
                        borderRadius: "12px",
                        marginBottom: "20px",
                        boxShadow:
                            "0 2px 8px rgba(0,0,0,0.08)"
                    }}
                >

                    <h2>
                        🎯 AI Career Suggestion
                    </h2>

                    <p>
                        Based on your current skills,
                        you can explore roles such as:
                    </p>

                    <ul>

                        <li>
                            Python Developer
                        </li>

                        <li>
                            Data Analyst
                        </li>

                        <li>
                            Machine Learning Engineer
                        </li>

                        <li>
                            AI Engineer
                        </li>

                    </ul>

                </div>


                {/* ==================================================
                    ACTIONS
                ================================================== */}

                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap"
                    }}
                >

                    <button
                        onClick={() =>
                            navigate("/skill-assessment")
                        }

                        style={{
                            padding: "12px 20px",
                            cursor: "pointer"
                        }}
                    >
                        📝 Take Skill Assessment
                    </button>


                    <button
                        onClick={() =>
                            navigate("/ai-mock-interview")
                        }

                        style={{
                            padding: "12px 20px",
                            cursor: "pointer"
                        }}
                    >
                        🎤 Practice Mock Interview
                    </button>


                    <button
                        onClick={() =>
                            navigate("/profile")
                        }

                        style={{
                            padding: "12px 20px",
                            cursor: "pointer"
                        }}
                    >
                        ✏️ Update Profile
                    </button>

                </div>

            </div>

        </div>

    );

}

export default AISkillAnalysis;