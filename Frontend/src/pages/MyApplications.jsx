import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyApplications() {

const navigate = useNavigate();

const [applications, setApplications] = useState([]);
const [loading, setLoading] = useState(true);
const [message, setMessage] = useState("");

// ======================================================
// LOAD MY APPLICATIONS
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
            "http://localhost:5000/api/applications/my-applications",
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
        } catch (error) {
            setMessage("Invalid response from server.");
            return;
        }

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
            "My applications error:",
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
// LOGOUT
// ======================================================

const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    navigate("/login");

};

// ======================================================
// STATUS STYLE
// ======================================================

const getStatusStyle = (status) => {

    if (status === "Applied") {

        return {
            backgroundColor: "#fff3cd",
            color: "#856404"
        };

    }

    if (status === "Shortlisted") {

        return {
            backgroundColor: "#cfe2ff",
            color: "#084298"
        };

    }

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

    return {
        backgroundColor: "#eee",
        color: "#333"
    };

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
                Loading My Applications...
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

                <h1 style={{ margin: 0 }}>
                    My Applications
                </h1>

                <p
                    style={{
                        color: "#666"
                    }}
                >
                    Track your job applications
                    and their current status.
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
                    Back to Candidate Dashboard
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
                    backgroundColor: "#f8d7da",
                    color: "#842029",
                    padding: "12px",
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
                    No Applications Yet
                </h2>

                <p>
                    You have not applied for any jobs yet.
                </p>

                <button
                    onClick={() =>
                        navigate("/jobs")
                    }
                    style={{
                        padding: "10px 18px",
                        cursor: "pointer"
                    }}
                >
                    View Available Jobs
                </button>

            </div>

        )}

        {/* ==================================================
            APPLICATION LIST
        ================================================== */}

        <div
            style={{
                maxWidth: "1000px",
                margin: "0 auto"
            }}
        >

            {applications.map(
                (application) => {

                    const job =
                        application.job;

                    return (

                        <div
                            key={
                                application._id
                            }
                            style={{
                                backgroundColor: "white",
                                padding: "25px",
                                marginBottom: "20px",
                                borderRadius: "12px",
                                boxShadow:
                                    "0 2px 8px rgba(0,0,0,0.08)"
                            }}
                        >

                            {/* ==================================================
                                JOB TITLE
                            ================================================== */}

                            <h2
                                style={{
                                    marginTop: 0
                                }}
                            >
                                {job?.title ||
                                    "Job information unavailable"}
                            </h2>

                            {/* ==================================================
                                COMPANY
                            ================================================== */}

                            <p>

                                <strong>
                                    Company:
                                </strong>{" "}

                                {job?.company ||
                                    "Not specified"}

                            </p>

                            {/* ==================================================
                                LOCATION
                            ================================================== */}

                            <p>

                                <strong>
                                    Location:
                                </strong>{" "}

                                {job?.location ||
                                    "Not specified"}

                            </p>

                            {/* ==================================================
                                SALARY
                            ================================================== */}

                            {job?.salary && (

                                <p>

                                    <strong>
                                        Salary:
                                    </strong>{" "}

                                    {job.salary}

                                </p>

                            )}

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
                                            "inline-block",
                                        marginLeft:
                                            "5px"
                                    }}
                                >
                                    {application.status}
                                </span>

                            </p>

                            {/* ==================================================
                                APPLIED DATE
                            ================================================== */}

                            {application.createdAt && (

                                <p
                                    style={{
                                        color: "#666"
                                    }}
                                >

                                    <strong>
                                        Applied On:
                                    </strong>{" "}

                                    {new Date(
                                        application.createdAt
                                    ).toLocaleDateString()}

                                </p>

                            )}

                            {/* ==================================================
                                REJECTED
                            ================================================== */}

                            {application.status ===
                                "Rejected" && (

                                <div
                                    style={{
                                        marginTop:
                                            "15px",
                                        padding:
                                            "15px",
                                        backgroundColor:
                                            "#f8d7da",
                                        borderRadius:
                                            "8px",
                                        color:
                                            "#842029"
                                    }}
                                >

                                    <strong>
                                        Your application was
                                        not selected for the
                                        next stage.
                                    </strong>

                                </div>

                            )}

                            {/* ==================================================
                                SHORTLISTED → AI MOCK INTERVIEW
                            ================================================== */}

                            {application.status ===
                                "Shortlisted" && (

                                <div
                                    style={{
                                        marginTop:
                                            "20px",
                                        padding:
                                            "20px",
                                        backgroundColor:
                                            "#eef5ff",
                                        borderRadius:
                                            "10px",
                                        border:
                                            "1px solid #cfe2ff"
                                    }}
                                >

                                    <h3
                                        style={{
                                            marginTop: 0
                                        }}
                                    >
                                        🎤 AI Mock Interview
                                    </h3>

                                    <p>
                                        Congratulations!
                                        You have been shortlisted
                                        for this position.
                                    </p>

                                    <p>
                                        Complete the AI mock
                                        interview to continue
                                        the recruitment process.
                                    </p>

                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/ai-interview/${application._id}`
                                            )
                                        }
                                        style={{
                                            padding:
                                                "12px 22px",
                                            cursor:
                                                "pointer",
                                            border:
                                                "none",
                                            borderRadius:
                                                "6px",
                                            fontWeight:
                                                "bold",
                                            fontSize:
                                                "15px"
                                        }}
                                    >
                                        🎤 Start AI Mock Interview
                                    </button>

                                </div>

                            )}

                            {/* ==================================================
                                SELECTED
                            ================================================== */}

                            {application.status ===
                                "Selected" && (

                                <div
                                    style={{
                                        marginTop:
                                            "15px",
                                        padding:
                                            "15px",
                                        backgroundColor:
                                            "#d1e7dd",
                                        borderRadius:
                                            "8px",
                                        color:
                                            "#0f5132"
                                    }}
                                >

                                    <strong>
                                        🎉 Congratulations!
                                        You have been selected.
                                    </strong>

                                </div>

                            )}

                        </div>

                    );

                }
            )}

        </div>

    </div>

);

}

export default MyApplications;