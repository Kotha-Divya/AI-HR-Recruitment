import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Jobs() {

    console.log("NEW JOBS JSX IS LOADED");

    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [myApplications, setMyApplications] = useState([]);

    const [search, setSearch] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [jobType, setJobType] = useState("All");

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");


    // ==========================================
    // LOAD JOBS
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


            // ==================================
            // GET JOBS
            // ==================================

            const jobsResponse = await fetch(
                "http://localhost:5000/api/jobs",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


            const jobsData = await jobsResponse.json();

            console.log("JOBS:", jobsData);


            if (!jobsResponse.ok) {

                setMessage(
                    jobsData.message ||
                    "Unable to load jobs"
                );

                return;
            }


            setJobs(
                jobsData.jobs || []
            );


            // ==================================
            // GET MY APPLICATIONS
            // ==================================

            const applicationResponse = await fetch(
                "http://localhost:5000/api/applications/my-applications",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


            const applicationData =
                await applicationResponse.json();


            if (applicationResponse.ok) {

                setMyApplications(
                    applicationData.applications || []
                );

            }

        }

        catch (error) {

            console.error(
                "Load jobs error:",
                error
            );

            setMessage(
                "Server connection error"
            );

        }

        finally {

            setLoading(false);

        }

    };


    // ==========================================
    // CHECK ALREADY APPLIED
    // ==========================================

    const hasApplied = (jobId) => {

        return myApplications.some(
            (application) =>
                application.job?._id === jobId
        );

    };


    // ==========================================
    // APPLY FOR JOB
    // ==========================================

    const handleApply = async (jobId) => {

        try {

            const token =
                localStorage.getItem("token");


            if (!token) {

                navigate("/login");

                return;

            }


            const response = await fetch(
                "http://localhost:5000/api/applications",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        jobId: jobId
                    })
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                setMessage(
                    data.message ||
                    "Application failed"
                );

                return;

            }


            setMessage(
                "Application submitted successfully!"
            );


            // Reload jobs and applications
            loadJobs();

        }

        catch (error) {

            console.error(
                "Apply error:",
                error
            );

            setMessage(
                "Unable to apply for this job."
            );

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
    // FILTER JOBS
    // ==========================================

    const filteredJobs = jobs.filter((job) => {

        const title =
            (job.title || "").toLowerCase();

        const company =
            (job.company || "").toLowerCase();

        const location =
            (job.location || "").toLowerCase();

        const skills =
            Array.isArray(job.skills)
                ? job.skills
                    .join(" ")
                    .toLowerCase()
                : "";


        const searchValue =
            search
                .toLowerCase()
                .trim();


        const locationValue =
            locationFilter
                .toLowerCase()
                .trim();


        // Search by title or company

        const searchMatch =
            title.includes(searchValue) ||
            company.includes(searchValue);


        // Search by location

        const locationMatch =
            location.includes(locationValue);


        // Job type filter

        let typeMatch = true;


        if (jobType !== "All") {

            typeMatch =
                title.includes(
                    jobType.toLowerCase()
                ) ||
                skills.includes(
                    jobType.toLowerCase()
                );

        }


        return (
            searchMatch &&
            locationMatch &&
            typeMatch
        );

    });


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div
                style={{
                    padding: "50px",
                    textAlign: "center"
                }}
            >

                <h2>
                    Loading Jobs...
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


            {/* ==================================
                TOP BAR
            ================================== */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "25px",
                    flexWrap: "wrap",
                    gap: "10px"
                }}
            >

                <div>

                    <h1>
                        Available Jobs
                    </h1>

                    <p>
                        Find your next job opportunity.
                    </p>

                </div>


                <div>

                    <button
                        onClick={() =>
                            navigate(
                                "/candidate-dashboard"
                            )
                        }
                    >
                        Back to Dashboard
                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/my-applications"
                            )
                        }
                        style={{
                            marginLeft: "10px"
                        }}
                    >
                        My Applications
                    </button>


                    <button
                        onClick={handleLogout}
                        style={{
                            marginLeft: "10px"
                        }}
                    >
                        Logout
                    </button>

                </div>

            </div>


            {/* ==================================
                SEARCH SECTION
            ================================== */}

            <div
                style={{
                    backgroundColor: "white",
                    padding: "25px",
                    marginBottom: "25px",
                    borderRadius: "10px",
                    border: "2px solid black"
                }}
            >

                <h2>
                    Search Jobs
                </h2>


                {/* JOB SEARCH */}

                <div
                    style={{
                        marginBottom: "15px"
                    }}
                >

                    <label
                        style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "bold"
                        }}
                    >
                        Search by Job Title or Company
                    </label>


                    <input
                        type="text"
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        placeholder="Example: Python Developer"
                        style={{
                            display: "block",
                            width: "100%",
                            maxWidth: "600px",
                            height: "45px",
                            padding: "10px",
                            fontSize: "16px",
                            border: "2px solid black",
                            borderRadius: "5px",
                            boxSizing: "border-box"
                        }}
                    />

                </div>


                {/* LOCATION SEARCH */}

                <div
                    style={{
                        marginBottom: "15px"
                    }}
                >

                    <label
                        style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "bold"
                        }}
                    >
                        Filter by Location
                    </label>


                    <input
                        type="text"
                        value={locationFilter}
                        onChange={(e) =>
                            setLocationFilter(
                                e.target.value
                            )
                        }
                        placeholder="Example: Hyderabad"
                        style={{
                            display: "block",
                            width: "100%",
                            maxWidth: "600px",
                            height: "45px",
                            padding: "10px",
                            fontSize: "16px",
                            border: "2px solid black",
                            borderRadius: "5px",
                            boxSizing: "border-box"
                        }}
                    />

                </div>


                {/* JOB TYPE */}

                <div
                    style={{
                        marginBottom: "15px"
                    }}
                >

                    <label
                        style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "bold"
                        }}
                    >
                        Job Type
                    </label>


                    <select
                        value={jobType}
                        onChange={(e) =>
                            setJobType(
                                e.target.value
                            )
                        }
                        style={{
                            width: "100%",
                            maxWidth: "600px",
                            height: "45px",
                            padding: "8px",
                            fontSize: "16px",
                            border: "2px solid black",
                            borderRadius: "5px"
                        }}
                    >

                        <option value="All">
                            All Jobs
                        </option>

                        <option value="Python">
                            Python
                        </option>

                        <option value="Machine Learning">
                            Machine Learning
                        </option>

                        <option value="Data">
                            Data Analytics
                        </option>

                        <option value="Java">
                            Java
                        </option>

                    </select>

                </div>


                {/* CLEAR BUTTON */}

                <button
                    type="button"
                    onClick={() => {

                        setSearch("");
                        setLocationFilter("");
                        setJobType("All");

                    }}
                    style={{
                        padding: "10px 20px",
                        cursor: "pointer"
                    }}
                >
                    Clear
                </button>

            </div>


            {/* ==================================
                MESSAGE
            ================================== */}

            {message && (

                <div
                    style={{
                        backgroundColor: "#d1e7dd",
                        padding: "12px",
                        borderRadius: "6px",
                        marginBottom: "20px"
                    }}
                >

                    {message}

                </div>

            )}


            {/* ==================================
                RESULT COUNT
            ================================== */}

            <h3>

                {filteredJobs.length}{" "}

                {filteredJobs.length === 1
                    ? "Job"
                    : "Jobs"}{" "}

                Found

            </h3>


            {/* ==================================
                NO RESULTS
            ================================== */}

            {filteredJobs.length === 0 && (

                <div
                    style={{
                        backgroundColor: "white",
                        padding: "30px",
                        textAlign: "center",
                        borderRadius: "10px"
                    }}
                >

                    <h2>
                        No Jobs Found
                    </h2>

                    <p>
                        Try another search.
                    </p>

                </div>

            )}


            {/* ==================================
                JOB LIST
            ================================== */}

            <div>

                {filteredJobs.map((job) => {

                    const applied =
                        hasApplied(job._id);


                    return (

                        <div
                            key={job._id}
                            style={{
                                backgroundColor: "white",
                                padding: "25px",
                                marginBottom: "20px",
                                borderRadius: "10px",
                                boxShadow:
                                    "0 2px 8px rgba(0,0,0,0.08)"
                            }}
                        >

                            <h2>
                                {job.title}
                            </h2>


                            <p>

                                <strong>
                                    Description:
                                </strong>

                                <br />

                                {job.description ||
                                    "Not specified"}

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
                                    Skills:
                                </strong>{" "}

                                {Array.isArray(
                                    job.skills
                                )
                                    ? job.skills.join(", ")
                                    : "Not specified"}

                            </p>


                            {/* APPLY BUTTON */}

                            {applied ? (

                                <button
                                    disabled
                                    style={{
                                        padding:
                                            "12px 25px",
                                        marginTop:
                                            "10px"
                                    }}
                                >
                                    ✓ Already Applied
                                </button>

                            ) : (

                                <button
                                    onClick={() =>
                                        handleApply(
                                            job._id
                                        )
                                    }
                                    style={{
                                        padding:
                                            "12px 25px",
                                        marginTop:
                                            "10px",
                                        cursor:
                                            "pointer"
                                    }}
                                >
                                    Apply Now
                                </button>

                            )}

                        </div>

                    );

                })}

            </div>

        </div>

    );

}

export default Jobs;
