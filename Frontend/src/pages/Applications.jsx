import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Applications() {

    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const [screeningLoading, setScreeningLoading] = useState({});
    const [screeningResults, setScreeningResults] = useState({});

    // ======================================================
    // LOAD RECRUITER APPLICATIONS
    // ======================================================

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {

        try {

            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await fetch(
                "http://localhost:5000/api/applications/recruiter-applications",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const text = await response.text();

            let data;

            try {
                data = JSON.parse(text);
            } catch {
                setMessage("Invalid response from server.");
                return;
            }

            console.log("RECRUITER APPLICATIONS:", data);

            if (!response.ok) {

                setMessage(
                    data.message ||
                    "Failed to load applications."
                );

                return;
            }

            setApplications(
                data.applications || []
            );

        } catch (error) {

            console.error(
                "Applications error:",
                error
            );

            setMessage(
                "Unable to connect to server."
            );

        } finally {

            setLoading(false);

        }
    };

    // ======================================================
    // AI RESUME SCREENING
    // ======================================================

    const handleAIScreening = async (applicationId) => {

        try {

            const token =
                localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            setScreeningLoading(prev => ({
                ...prev,
                [applicationId]: true
            }));

            setMessage("");

            const response = await fetch(
                `http://localhost:5000/api/ai/screen-resume/${applicationId}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const text = await response.text();

            let data;

            try {
                data = JSON.parse(text);
            } catch {
                setMessage(
                    "Invalid response from AI screening server."
                );
                return;
            }

            console.log(
                "AI SCREENING RESPONSE:",
                data
            );

            if (!response.ok) {

                setMessage(
                    data.message ||
                    "AI resume screening failed."
                );

                return;
            }

            // Save screening result for this application
            setScreeningResults(prev => ({
                ...prev,
                [applicationId]: data.screening
            }));

        } catch (error) {

            console.error(
                "AI screening error:",
                error
            );

            setMessage(
                "Unable to connect to AI screening server."
            );

        } finally {

            setScreeningLoading(prev => ({
                ...prev,
                [applicationId]: false
            }));

        }
    };

    // ======================================================
    // UPDATE APPLICATION STATUS
    // ======================================================

    const updateStatus = async (
        applicationId,
        status
    ) => {

        try {

            const token =
                localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await fetch(
                `http://localhost:5000/api/applications/${applicationId}/status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        status
                    })
                }
            );

            const text = await response.text();

            let data;

            try {
                data = JSON.parse(text);
            } catch {
                setMessage(
                    "Invalid response from server."
                );
                return;
            }

            if (!response.ok) {

                setMessage(
                    data.message ||
                    "Failed to update application."
                );

                return;
            }

            // Update application in screen
            setApplications(prev =>
                prev.map(application =>
                    application._id === applicationId
                        ? {
                            ...application,
                            status
                        }
                        : application
                )
            );

            setMessage(
                `Candidate ${status.toLowerCase()} successfully.`
            );

        } catch (error) {

            console.error(
                "Status update error:",
                error
            );

            setMessage(
                "Unable to update application."
            );

        }
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
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <h2>
                    Loading Applications...
                </h2>
            </div>
        );
    }

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
                    maxWidth: "1000px",
                    margin: "0 auto 30px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px"
                }}
            >

                <div>

                    <h1>
                        Candidate Applications
                    </h1>

                    <p>
                        Review candidates and AI resume screening results.
                    </p>

                </div>

                <div>

                    <button
                        onClick={() =>
                            navigate(
                                "/recruiter-dashboard"
                            )
                        }
                        style={{
                            padding: "10px 16px",
                            marginRight: "10px",
                            cursor: "pointer"
                        }}
                    >
                        Back to Recruiter Dashboard
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
                MESSAGE
            ================================================== */}

            {message && (

                <div
                    style={{
                        maxWidth: "1000px",
                        margin: "0 auto 20px",
                        padding: "12px",
                        backgroundColor: "#f8d7da",
                        color: "#842029",
                        borderRadius: "8px"
                    }}
                >
                    {message}
                </div>

            )}

            {/* ==================================================
                NO APPLICATIONS
            ================================================== */}

            {applications.length === 0 && !message && (

                <div
                    style={{
                        maxWidth: "800px",
                        margin: "0 auto",
                        backgroundColor: "white",
                        padding: "30px",
                        borderRadius: "12px",
                        textAlign: "center"
                    }}
                >

                    <h2>
                        No Applications Found
                    </h2>

                    <p>
                        No candidates have applied to your jobs yet.
                    </p>

                </div>

            )}

            {/* ==================================================
                APPLICATIONS
            ================================================== */}

            <div
                style={{
                    maxWidth: "1000px",
                    margin: "0 auto"
                }}
            >

                {applications.map(application => {

                    const candidate =
                        application.candidate || {};

                    const job =
                        application.job || {};

                    const screening =
                        screeningResults[
                            application._id
                        ];

                    return (

                        <div
                            key={application._id}
                            style={{
                                backgroundColor: "white",
                                padding: "25px",
                                marginBottom: "25px",
                                borderRadius: "12px",
                                boxShadow:
                                    "0 2px 8px rgba(0,0,0,0.08)"
                            }}
                        >

                            {/* ==================================================
                                CANDIDATE
                            ================================================== */}

                            <h2>
                                👤 Candidate:{" "}
                                {candidate.name ||
                                    "Unknown"}
                            </h2>

                            <p>
                                <strong>
                                    Email:
                                </strong>{" "}
                                {candidate.email ||
                                    "Not available"}
                            </p>

                            <p>
                                <strong>
                                    Phone:
                                </strong>{" "}
                                {candidate.phone ||
                                    "Not available"}
                            </p>


                            {/* ==================================================
                                JOB DETAILS
                            ================================================== */}

                            <h3>
                                💼 Job Details
                            </h3>

                            <p>
                                <strong>
                                    Job:
                                </strong>{" "}
                                {job.title ||
                                    "Not available"}
                            </p>

                            <p>
                                <strong>
                                    Company:
                                </strong>{" "}
                                {job.company ||
                                    "Not specified"}
                            </p>

                            <p>
                                <strong>
                                    Location:
                                </strong>{" "}
                                {job.location ||
                                    "Not specified"}
                            </p>

                            <p>
                                <strong>
                                    Salary:
                                </strong>{" "}
                                {job.salary ||
                                    "Not specified"}
                            </p>

                            <p>
                                <strong>
                                    Application Status:
                                </strong>{" "}

                                <span
                                    style={{
                                        padding: "6px 12px",
                                        borderRadius: "20px",
                                        fontWeight: "bold",
                                        backgroundColor:
                                            application.status === "Selected"
                                                ? "#d1e7dd"
                                                : application.status === "Rejected"
                                                    ? "#f8d7da"
                                                    : application.status === "Shortlisted"
                                                        ? "#cfe2ff"
                                                        : "#fff3cd"
                                    }}
                                >
                                    {application.status}
                                </span>
                            </p>


                            {/* ==================================================
                                CANDIDATE PROFILE
                            ================================================== */}

                            <h3>
                                📄 Candidate Profile
                            </h3>

                            <p>
                                <strong>
                                    Skills:
                                </strong>{" "}
                                {Array.isArray(candidate.skills)
                                    ? candidate.skills.join(", ")
                                    : candidate.skills ||
                                    "Not available"}
                            </p>

                            <p>
                                <strong>
                                    Education:
                                </strong>{" "}
                                {candidate.education ||
                                    "Not available"}
                            </p>

                            <p>
                                <strong>
                                    Experience:
                                </strong>{" "}
                                {candidate.experience ||
                                    "Not available"}
                            </p>

                            {candidate.resume && (

                                <p>

                                    <strong>
                                        Resume:
                                    </strong>{" "}

                                    <a
                                        href={
                                            candidate.resume.startsWith("http")
                                                ? candidate.resume
                                                : `http://localhost:5000/${candidate.resume}`
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        📄 View Resume
                                    </a>

                                </p>

                            )}


                            {/* ==================================================
                                AI RESUME SCREENING
                            ================================================== */}

                            <div
                                style={{
                                    marginTop: "25px",
                                    padding: "20px",
                                    backgroundColor: "#f5f7fb",
                                    borderRadius: "10px",
                                    border: "1px solid #ddd"
                                }}
                            >

                                <h3>
                                    🤖 AI Resume Screening
                                </h3>

                                <p>
                                    Compare this candidate's skills
                                    with the job requirements.
                                </p>

                                {!screening && (

                                    <button
                                        onClick={() =>
                                            handleAIScreening(
                                                application._id
                                            )
                                        }
                                        disabled={
                                            screeningLoading[
                                                application._id
                                            ]
                                        }
                                        style={{
                                            padding: "12px 20px",
                                            cursor: "pointer",
                                            fontWeight: "bold",
                                            border: "none",
                                            borderRadius: "6px"
                                        }}
                                    >

                                        {screeningLoading[
                                            application._id
                                        ]
                                            ? "Running AI Screening..."
                                            : "🤖 Run AI Resume Screening"}

                                    </button>

                                )}


                                {/* ==================================================
                                    SCREENING RESULT
                                ================================================== */}

                                {screening && (

                                    <div
                                        style={{
                                            marginTop: "20px",
                                            padding: "20px",
                                            backgroundColor: "white",
                                            borderRadius: "10px"
                                        }}
                                    >

                                        <h3>
                                            AI Screening Result
                                        </h3>

                                        <p>
                                            <strong>
                                                Match Score:
                                            </strong>{" "}

                                            <span
                                                style={{
                                                    fontSize: "24px",
                                                    fontWeight: "bold"
                                                }}
                                            >
                                                {screening.matchScore}%
                                            </span>
                                        </p>

                                        <p>
                                            <strong>
                                                Result:
                                            </strong>{" "}
                                            {screening.screeningResult}
                                        </p>

                                        <p>
                                            <strong>
                                                Recommendation:
                                            </strong>{" "}
                                            {screening.recommendation}
                                        </p>

                                        <p>
                                            <strong>
                                                Matched Skills:
                                            </strong>{" "}

                                            {screening.matchedSkills?.length
                                                ? screening.matchedSkills.join(", ")
                                                : "None"}
                                        </p>

                                        <p>
                                            <strong>
                                                Missing Skills:
                                            </strong>{" "}

                                            {screening.missingSkills?.length
                                                ? screening.missingSkills.join(", ")
                                                : "None"}
                                        </p>

                                        <p>
                                            <strong>
                                                Summary:
                                            </strong>{" "}
                                            {screening.summary}
                                        </p>

                                        <button
                                            onClick={() =>
                                                handleAIScreening(
                                                    application._id
                                                )
                                            }
                                            style={{
                                                padding: "8px 15px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            Run Screening Again
                                        </button>

                                    </div>

                                )}

                            </div>


                            {/* ==================================================
                                AI INTERVIEW
                            ================================================== */}

                            <div
                                style={{
                                    marginTop: "20px",
                                    padding: "20px",
                                    backgroundColor: "#eef5ff",
                                    borderRadius: "10px"
                                }}
                            >

                                <h3>
                                    🎤 AI Interview
                                </h3>

                                {application.aiInterview?.completed ? (

                                    <div>

                                        <p>
                                            <strong>
                                                Interview Completed
                                            </strong>
                                        </p>

                                        <p>
                                            <strong>
                                                Score:
                                            </strong>{" "}
                                            {application.aiInterview.interviewScore}%
                                        </p>

                                        <p>
                                            <strong>
                                                Result:
                                            </strong>{" "}
                                            {application.aiInterview.interviewResult}
                                        </p>

                                        <p>
                                            <strong>
                                                Recommendation:
                                            </strong>{" "}
                                            {application.aiInterview.recommendation}
                                        </p>

                                    </div>

                                ) : (

                                    <p>
                                        The candidate has not completed
                                        the AI interview yet.
                                    </p>

                                )}

                            </div>


                            {/* ==================================================
                                APPLICATION ACTIONS
                            ================================================== */}

                            <h3
                                style={{
                                    marginTop: "25px"
                                }}
                            >
                                Application Actions
                            </h3>

                            <div
                                style={{
                                    display: "flex",
                                    gap: "10px",
                                    flexWrap: "wrap"
                                }}
                            >

                                <button
                                    onClick={() =>
                                        updateStatus(
                                            application._id,
                                            "Shortlisted"
                                        )
                                    }
                                    style={{
                                        padding: "10px 18px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Shortlist
                                </button>

                                <button
                                    onClick={() =>
                                        updateStatus(
                                            application._id,
                                            "Selected"
                                        )
                                    }
                                    style={{
                                        padding: "10px 18px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Select
                                </button>

                                <button
                                    onClick={() =>
                                        updateStatus(
                                            application._id,
                                            "Rejected"
                                        )
                                    }
                                    style={{
                                        padding: "10px 18px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Reject
                                </button>

                            </div>


                            {/* ==================================================
                                DATE
                            ================================================== */}

                            {application.createdAt && (

                                <p
                                    style={{
                                        marginTop: "20px",
                                        color: "#666"
                                    }}
                                >
                                    <strong>
                                        Applied On:
                                    </strong>{" "}

                                    {new Date(
                                        application.createdAt
                                    ).toLocaleString()}

                                </p>

                            )}

                        </div>

                    );

                })}

            </div>

        </div>
    );
}

export default Applications;