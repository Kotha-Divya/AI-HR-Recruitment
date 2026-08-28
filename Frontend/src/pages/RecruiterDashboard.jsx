import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function RecruiterDashboard() {

    const navigate = useNavigate();

    const [jobCount, setJobCount] = useState(0);
    const [applicationCount, setApplicationCount] = useState(0);
    const [selectedCount, setSelectedCount] = useState(0);

    const [loading, setLoading] = useState(true);


    // ==========================================
    // LOAD DASHBOARD DATA
    // ==========================================

    useEffect(() => {

        loadDashboardData();

    }, []);


    const loadDashboardData = async () => {

        try {

            const token =
                localStorage.getItem("token");


            // ==================================
            // CHECK LOGIN
            // ==================================

            if (!token) {

                navigate("/login");

                return;

            }


            // ==================================
            // GET MY JOBS
            // ==================================

            const jobsResponse =
                await fetch(
                    "http://localhost:5000/api/jobs/my-jobs",
                    {
                        method: "GET",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const jobsData =
                await jobsResponse.json();


            console.log(
                "DASHBOARD JOBS:",
                jobsData
            );


            if (jobsResponse.ok) {

                setJobCount(
                    Array.isArray(
                        jobsData.jobs
                    )
                        ? jobsData.jobs.length
                        : 0
                );

            }


            // ==================================
            // GET RECRUITER APPLICATIONS
            // ==================================

            const applicationResponse =
                await fetch(
                    "http://localhost:5000/api/applications/recruiter-applications",
                    {
                        method: "GET",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const applicationData =
                await applicationResponse.json();


            console.log(
                "DASHBOARD APPLICATIONS:",
                applicationData
            );


            if (applicationResponse.ok) {

                const applications =
                    Array.isArray(
                        applicationData.applications
                    )
                        ? applicationData.applications
                        : [];


                // Total applications

                setApplicationCount(
                    applications.length
                );


                // Selected applications

                const selected =
                    applications.filter(
                        (application) =>
                            application.status ===
                            "Selected"
                    );


                setSelectedCount(
                    selected.length
                );

            }

        }

        catch (error) {

            console.error(
                "Dashboard error:",
                error
            );

        }

        finally {

            setLoading(false);

        }

    };


    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");

        navigate("/login");

    };


    // ==========================================
    // DASHBOARD
    // ==========================================

    return (

        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f5f7fb",
                padding: "40px"
            }}
        >

            <div
                style={{
                    maxWidth: "1000px",
                    margin: "0 auto"
                }}
            >


                {/* ==================================
                    HEADER
                ================================== */}

                <h1>
                    Recruiter Dashboard
                </h1>

                <p>
                    Welcome to the AI HR Recruitment System
                </p>


                {/* ==================================
                    STATISTICS
                ================================== */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "20px",
                        marginTop: "30px"
                    }}
                >


                    {/* TOTAL JOBS */}

                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "25px",
                            borderRadius: "12px",
                            textAlign: "center",
                            boxShadow:
                                "0 2px 8px rgba(0,0,0,0.08)"
                        }}
                    >

                        <h2>
                            Total Jobs
                        </h2>

                        <h1>
                            {loading
                                ? "..."
                                : jobCount}
                        </h1>

                    </div>


                    {/* TOTAL APPLICATIONS */}

                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "25px",
                            borderRadius: "12px",
                            textAlign: "center",
                            boxShadow:
                                "0 2px 8px rgba(0,0,0,0.08)"
                        }}
                    >

                        <h2>
                            Applications
                        </h2>

                        <h1>
                            {loading
                                ? "..."
                                : applicationCount}
                        </h1>

                    </div>


                    {/* SELECTED */}

                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "25px",
                            borderRadius: "12px",
                            textAlign: "center",
                            boxShadow:
                                "0 2px 8px rgba(0,0,0,0.08)"
                        }}
                    >

                        <h2>
                            Selected
                        </h2>

                        <h1>
                            {loading
                                ? "..."
                                : selectedCount}
                        </h1>

                    </div>

                </div>


                {/* ==================================
                    DASHBOARD CARDS
                ================================== */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "20px",
                        marginTop: "30px"
                    }}
                >


                    {/* MY JOBS */}

                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "25px",
                            borderRadius: "12px",
                            boxShadow:
                                "0 2px 8px rgba(0,0,0,0.08)"
                        }}
                    >

                        <h2>
                            My Jobs
                        </h2>

                        <p>
                            View and manage the jobs
                            you have created.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/my-jobs")
                            }
                            style={{
                                width: "100%",
                                padding: "12px",
                                cursor: "pointer"
                            }}
                        >
                            My Jobs
                        </button>

                    </div>


                    {/* CREATE JOB */}

                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "25px",
                            borderRadius: "12px",
                            boxShadow:
                                "0 2px 8px rgba(0,0,0,0.08)"
                        }}
                    >

                        <h2>
                            Create Job
                        </h2>

                        <p>
                            Post a new job vacancy
                            for candidates.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/create-job")
                            }
                            style={{
                                width: "100%",
                                padding: "12px",
                                cursor: "pointer"
                            }}
                        >
                            Create Job
                        </button>

                    </div>


                    {/* APPLICATIONS */}

                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "25px",
                            borderRadius: "12px",
                            boxShadow:
                                "0 2px 8px rgba(0,0,0,0.08)"
                        }}
                    >

                        <h2>
                            Applications
                        </h2>

                        <p>
                            View candidates who
                            applied for your jobs.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/applications")
                            }
                            style={{
                                width: "100%",
                                padding: "12px",
                                cursor: "pointer"
                            }}
                        >
                            Applications
                        </button>

                    </div>


                    {/* PROFILE */}

                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "25px",
                            borderRadius: "12px",
                            boxShadow:
                                "0 2px 8px rgba(0,0,0,0.08)"
                        }}
                    >

                        <h2>
                            Profile
                        </h2>

                        <p>
                            View and update your
                            recruiter profile.
                        </p>

                        <button
                            onClick={() =>
                                navigate(
                                    "/recruiter-profile"
                                )
                            }
                            style={{
                                width: "100%",
                                padding: "12px",
                                cursor: "pointer"
                            }}
                        >
                            Recruiter Profile
                        </button>

                    </div>

                </div>


                {/* ==================================
                    LOGOUT
                ================================== */}

                <div
                    style={{
                        textAlign: "center",
                        marginTop: "35px"
                    }}
                >

                    <button
                        onClick={handleLogout}
                        style={{
                            padding: "12px 30px",
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                    >
                        Logout
                    </button>

                </div>

            </div>

        </div>

    );

}

export default RecruiterDashboard;
