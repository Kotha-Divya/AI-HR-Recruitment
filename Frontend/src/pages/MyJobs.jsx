import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyJobs() {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [deletingJob, setDeletingJob] = useState(null);

    // ==========================================
    // LOAD RECRUITER JOBS
    // ==========================================

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await fetch(
                "http://localhost:5000/api/jobs/my-jobs",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            console.log("MY JOBS RESPONSE:", data);

            if (!response.ok) {
                setMessage(
                    data.message ||
                    "Failed to load jobs."
                );
                return;
            }

            setJobs(data.jobs || []);

        } catch (error) {
            console.error(
                "My Jobs error:",
                error
            );

            setMessage(
                "Unable to connect to server."
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // DELETE JOB
    // ==========================================

    const handleDeleteJob = async (jobId) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this job?"
        );

        if (!confirmDelete) {
            return;
        }

        try {

            setDeletingJob(jobId);
            setMessage("");

            const token =
                localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await fetch(
                `http://localhost:5000/api/jobs/${jobId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const text =
                await response.text();

            let data = {};

            try {
                data = JSON.parse(text);
            } catch {
                data = {};
            }

            console.log(
                "DELETE JOB RESPONSE:",
                data
            );

            if (!response.ok) {

                setMessage(
                    data.message ||
                    "Failed to delete job."
                );

                return;
            }

            // Remove deleted job from screen
            setJobs(
                previousJobs =>
                    previousJobs.filter(
                        job =>
                            job._id !== jobId
                    )
            );

            setMessage(
                "Job deleted successfully."
            );

        } catch (error) {

            console.error(
                "Delete job error:",
                error
            );

            setMessage(
                "Unable to delete job."
            );

        } finally {

            setDeletingJob(null);

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
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div
                style={{
                    padding: "40px",
                    textAlign: "center"
                }}
            >
                <h2>
                    Loading My Jobs...
                </h2>
            </div>
        );
    }

    // ==========================================
    // PAGE
    // ==========================================

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f5f7fb",
                padding: "30px"
            }}
        >

            {/* HEADER */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                    marginBottom: "30px"
                }}
            >

                <div>

                    <h1>
                        My Jobs
                    </h1>

                    <p>
                        Manage the jobs you have created.
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
                        Back to Dashboard
                    </button>

                    <button
                        onClick={() =>
                            navigate("/create-job")
                        }

                        style={{
                            padding: "10px 16px",
                            marginRight: "10px",
                            cursor: "pointer"
                        }}
                    >
                        Create Job
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


            {/* MESSAGE */}

            {message && (
                <div
                    style={{
                        backgroundColor:
                            message.includes(
                                "successfully"
                            )
                                ? "#d1e7dd"
                                : "#f8d7da",

                        color:
                            message.includes(
                                "successfully"
                            )
                                ? "#0f5132"
                                : "#842029",

                        padding: "12px",
                        borderRadius: "8px",
                        marginBottom: "20px"
                    }}
                >
                    {message}
                </div>
            )}


            {/* NO JOBS */}

            {jobs.length === 0 && !message && (
                <div
                    style={{
                        backgroundColor: "white",
                        padding: "30px",
                        borderRadius: "12px",
                        textAlign: "center"
                    }}
                >

                    <h3>
                        No Jobs Created
                    </h3>

                    <p>
                        You have not created any jobs yet.
                    </p>

                    <button
                        onClick={() =>
                            navigate("/create-job")
                        }

                        style={{
                            padding: "10px 18px",
                            cursor: "pointer"
                        }}
                    >
                        Create Your First Job
                    </button>

                </div>
            )}


            {/* JOB CARDS */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(320px, 1fr))",
                    gap: "20px"
                }}
            >

                {jobs.map(job => (

                    <div
                        key={job._id}

                        style={{
                            backgroundColor: "white",
                            padding: "25px",
                            borderRadius: "12px",
                            boxShadow:
                                "0 2px 8px rgba(0,0,0,0.08)"
                        }}
                    >

                        {/* TITLE */}

                        <h2>
                            {job.title}
                        </h2>


                        {/* COMPANY */}

                        <p>
                            <strong>
                                Company:
                            </strong>{" "}
                            {job.company ||
                                "Not specified"}
                        </p>


                        {/* LOCATION */}

                        <p>
                            <strong>
                                Location:
                            </strong>{" "}
                            {job.location ||
                                "Not specified"}
                        </p>


                        {/* SALARY */}

                        <p>
                            <strong>
                                Salary:
                            </strong>{" "}
                            {job.salary ||
                                "Not specified"}
                        </p>


                        {/* DESCRIPTION */}

                        <p>
                            <strong>
                                Description:
                            </strong>
                        </p>

                        <p>
                            {job.description ||
                                "No description available."}
                        </p>


                        {/* SKILLS */}

                        {Array.isArray(job.skills) &&
                            job.skills.length > 0 && (

                                <div>

                                    <strong>
                                        Skills:
                                    </strong>

                                    <p>
                                        {job.skills.join(", ")}
                                    </p>

                                </div>

                            )}


                        {/* CREATED DATE */}

                        {job.createdAt && (

                            <p
                                style={{
                                    color: "#666",
                                    fontSize: "14px"
                                }}
                            >
                                <strong>
                                    Created:
                                </strong>{" "}
                                {new Date(
                                    job.createdAt
                                ).toLocaleDateString()}
                            </p>

                        )}


                        {/* APPLICATIONS BUTTON */}

                        <button
                            onClick={() =>
                                navigate(
                                    "/applications"
                                )
                            }

                            style={{
                                width: "100%",
                                padding: "11px",
                                marginTop: "15px",
                                cursor: "pointer",
                                fontWeight: "bold"
                            }}
                        >
                            View Applications
                        </button>


                        {/* DELETE BUTTON */}

                        <button
                            onClick={() =>
                                handleDeleteJob(
                                    job._id
                                )
                            }

                            disabled={
                                deletingJob ===
                                job._id
                            }

                            style={{
                                width: "100%",
                                padding: "11px",
                                marginTop: "10px",
                                cursor:
                                    deletingJob ===
                                    job._id
                                        ? "not-allowed"
                                        : "pointer",
                                fontWeight: "bold",
                                backgroundColor:
                                    "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "6px"
                            }}
                        >
                            {deletingJob === job._id
                                ? "Deleting..."
                                : "🗑️ Delete Job"}
                        </button>

                    </div>

                ))}

            </div>

        </div>
    );
}

export default MyJobs;
