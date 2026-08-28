import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function InterviewStatus() {

    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // ======================================================
    // LOAD CANDIDATE APPLICATIONS
    // ======================================================

    useEffect(() => {

        loadApplications();

    }, []);


    const loadApplications = async () => {

        try {

            setLoading(true);
            setError("");

            const token =
                localStorage.getItem("token");


            if (!token) {

                navigate("/login");
                return;

            }


            const response = await fetch(
                "http://localhost:5000/api/applications/my-applications",
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            const text =
                await response.text();


            let data;

            try {

                data =
                    JSON.parse(text);

            }
            catch {

                throw new Error(
                    "Invalid response from server."
                );

            }


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to load interview status."
                );

            }


            setApplications(
                data.applications || []
            );

        }
        catch (err) {

            console.error(
                "Interview status error:",
                err
            );

            setError(
                err.message ||
                "Unable to load interview status."
            );

        }
        finally {

            setLoading(false);

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
    // INTERVIEW STATUS
    // ======================================================

    const getInterviewStatus = (application) => {

        const interview =
            application.aiInterview;


        if (!interview) {

            if (
                application.status ===
                "Shortlisted"
            ) {

                return "Available";

            }

            return "Not Available";

        }


        if (
            interview.completed === true
        ) {

            return "Completed";

        }


        return "In Progress";

    };


    // ======================================================
    // STATUS STYLE
    // ======================================================

    const getStatusStyle = (status) => {

        if (status === "Selected") {

            return {
                backgroundColor: "#d1e7dd",
                color: "#0f5132"
            };

        }


        if (status === "Rejected") {

            return {
                backgroundColor: "#f8d7da",
                color: "#842029"
            };

        }


        if (status === "Shortlisted") {

            return {
                backgroundColor: "#cfe2ff",
                color: "#084298"
            };

        }


        return {
            backgroundColor: "#fff3cd",
            color: "#856404"
        };

    };


    // ======================================================
    // INTERVIEW RESULT
    // ======================================================

    const getInterviewResult = (application) => {

        const interview =
            application.aiInterview;


        if (
            interview?.interviewResult
        ) {

            return interview.interviewResult;

        }


        return "Pending";

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
                    justifyContent: "center",
                    backgroundColor: "#f5f7fb"
                }}
            >

                <h2>
                    Loading Interview Status...
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
                    maxWidth: "900px",
                    margin: "0 auto 25px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px"
                }}
            >

                <div>

                    <h1>
                        🎯 Interview Status
                    </h1>

                    <p
                        style={{
                            color: "#666"
                        }}
                    >
                        View your AI interview results
                        and feedback.
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
                            padding:
                                "10px 16px",

                            marginRight:
                                "10px",

                            cursor:
                                "pointer",

                            border:
                                "none",

                            borderRadius:
                                "6px"
                        }}
                    >
                        ← Dashboard
                    </button>


                    <button
                        onClick={handleLogout}

                        style={{
                            padding:
                                "10px 16px",

                            cursor:
                                "pointer",

                            border:
                                "none",

                            borderRadius:
                                "6px"
                        }}
                    >
                        Logout
                    </button>

                </div>

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

                <div
                    style={{
                        maxWidth: "900px",
                        margin: "0 auto 20px",
                        padding: "15px",
                        backgroundColor: "#f8d7da",
                        color: "#842029",
                        borderRadius: "8px"
                    }}
                >

                    {error}

                </div>

            )}


            {/* ==================================================
                NO APPLICATIONS
            ================================================== */}

            {applications.length === 0 && !error && (

                <div
                    style={{
                        maxWidth: "700px",
                        margin: "0 auto",
                        backgroundColor: "white",
                        padding: "30px",
                        borderRadius: "12px",
                        textAlign: "center",
                        boxShadow:
                            "0 2px 10px rgba(0,0,0,0.08)"
                    }}
                >

                    <h2>
                        No Interview Status Available
                    </h2>

                    <p>
                        You have not applied for any
                        jobs yet.
                    </p>


                    <button
                        onClick={() =>
                            navigate("/jobs")
                        }

                        style={{
                            padding:
                                "12px 20px",

                            border:
                                "none",

                            borderRadius:
                                "6px",

                            cursor:
                                "pointer"
                        }}
                    >
                        Browse Jobs
                    </button>

                </div>

            )}


            {/* ==================================================
                APPLICATIONS
            ================================================== */}

            <div
                style={{
                    maxWidth: "900px",
                    margin: "0 auto"
                }}
            >

                {applications.map(
                    application => {

                        const job =
                            application.job;

                        const interview =
                            application.aiInterview;

                        const interviewStatus =
                            getInterviewStatus(
                                application
                            );

                        const interviewResult =
                            getInterviewResult(
                                application
                            );


                        return (

                            <div
                                key={
                                    application._id
                                }

                                style={{
                                    backgroundColor:
                                        "white",

                                    padding:
                                        "25px",

                                    marginBottom:
                                        "20px",

                                    borderRadius:
                                        "12px",

                                    boxShadow:
                                        "0 2px 10px rgba(0,0,0,0.08)"
                                }}
                            >

                                {/* ==================================================
                                    JOB
                                ================================================== */}

                                <h2
                                    style={{
                                        marginTop: 0
                                    }}
                                >
                                    🎤 {job?.title ||
                                        "Job Application"}
                                </h2>


                                <p>

                                    <strong>
                                        Company:
                                    </strong>{" "}

                                    {job?.company ||
                                        "Not specified"}

                                </p>


                                {/* ==================================================
                                    APPLICATION STATUS
                                ================================================== */}

                                <p>

                                    <strong>
                                        Application Status:
                                    </strong>{" "}

                                    <span
                                        style={{
                                            ...getStatusStyle(
                                                application.status
                                            ),

                                            padding:
                                                "6px 12px",

                                            borderRadius:
                                                "20px",

                                            fontWeight:
                                                "bold",

                                            display:
                                                "inline-block"
                                        }}
                                    >
                                        {application.status}
                                    </span>

                                </p>


                                {/* ==================================================
                                    INTERVIEW STATUS
                                ================================================== */}

                                <div
                                    style={{
                                        marginTop: "20px",
                                        padding: "20px",
                                        backgroundColor:
                                            "#f8f9fa",
                                        borderRadius: "10px"
                                    }}
                                >

                                    <h3>
                                        🎤 AI Interview
                                    </h3>


                                    <p>

                                        <strong>
                                            Interview Status:
                                        </strong>{" "}

                                        {interviewStatus}

                                    </p>


                                    {/* ==================================================
                                        INTERVIEW NOT STARTED
                                    ================================================== */}

                                    {!interview &&

                                        application.status ===
                                        "Shortlisted" && (

                                        <div
                                            style={{
                                                marginTop: "15px"
                                            }}
                                        >

                                            <p>
                                                You have been
                                                shortlisted and
                                                can take the AI
                                                mock interview.
                                            </p>


                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        "/ai-mock-interview"
                                                    )
                                                }

                                                style={{
                                                    padding:
                                                        "12px 20px",

                                                    border:
                                                        "none",

                                                    borderRadius:
                                                        "6px",

                                                    cursor:
                                                        "pointer",

                                                    fontWeight:
                                                        "bold"
                                                }}
                                            >
                                                Start AI Interview
                                            </button>

                                        </div>

                                    )}


                                    {/* ==================================================
                                        INTERVIEW IN PROGRESS
                                    ================================================== */}

                                    {interview &&
                                        interview.completed !== true && (

                                        <div
                                            style={{
                                                marginTop:
                                                    "15px"
                                            }}
                                        >

                                            <p>
                                                Your AI interview
                                                is currently in
                                                progress.
                                            </p>

                                        </div>

                                    )}


                                    {/* ==================================================
                                        INTERVIEW COMPLETED
                                    ================================================== */}

                                    {interview?.completed === true && (

                                        <div
                                            style={{
                                                marginTop:
                                                    "20px"
                                            }}
                                        >

                                            <div
                                                style={{
                                                    padding:
                                                        "15px",

                                                    borderRadius:
                                                        "8px",

                                                    backgroundColor:
                                                        application.status ===
                                                        "Selected"
                                                            ? "#d1e7dd"
                                                            : application.status ===
                                                              "Rejected"
                                                                ? "#f8d7da"
                                                                : "#eef5ff"
                                                }}
                                            >

                                                <h3
                                                    style={{
                                                        marginTop:
                                                            0
                                                    }}
                                                >

                                                    {application.status ===
                                                    "Selected"
                                                        ? "🎉 Congratulations!"
                                                        : application.status ===
                                                          "Rejected"
                                                            ? "❌ Interview Result"
                                                            : "🎤 Interview Completed"}

                                                </h3>


                                                <p>

                                                    <strong>
                                                        Result:
                                                    </strong>{" "}

                                                    {interviewResult}

                                                </p>


                                                {/* ==================================================
                                                    AI FEEDBACK
                                                ================================================== */}

                                                <div
                                                    style={{
                                                        marginTop:
                                                            "15px",

                                                        padding:
                                                            "15px",

                                                        backgroundColor:
                                                            "white",

                                                        borderRadius:
                                                            "8px"
                                                    }}
                                                >

                                                    <strong>
                                                        📝 AI Feedback
                                                    </strong>


                                                    <p>
                                                        {interview.summary ||
                                                            interview.feedback ||
                                                            "No feedback available."}
                                                    </p>

                                                </div>

                                            </div>

                                        </div>

                                    )}

                                </div>

                            </div>

                        );

                    }
                )}

            </div>

        </div>

    );

}


export default InterviewStatus;
