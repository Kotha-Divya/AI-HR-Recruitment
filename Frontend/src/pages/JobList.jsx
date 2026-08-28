import { useEffect, useState } from "react";

function JobList() {
const [jobs, setJobs] = useState([]);
const [message, setMessage] = useState("Loading jobs...");

useEffect(() => {
    fetchJobs();
}, []);

const fetchJobs = async () => {
    try {
        const response = await fetch(
            "http://localhost:5000/api/jobs"
        );

        const data = await response.json();

        if (response.ok) {
            setJobs(data.jobs || []);

            if (data.jobs && data.jobs.length > 0) {
                setMessage("");
            } else {
                setMessage("No jobs available");
            }
        } else {
            setMessage(
                data.message || "Failed to fetch jobs"
            );
        }
    } catch (error) {
        console.error("Error:", error);
        setMessage("Could not connect to backend");
    }
};

const applyForJob = async (jobId) => {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("Please login first");
            return;
        }

        const response = await fetch(
            "http://localhost:5000/api/applications",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    jobId: jobId
                })
            }
        );

        const data = await response.json();

        if (response.ok) {
            alert("Application submitted successfully");
        } else {
            alert(
                data.message ||
                    "Failed to submit application"
            );
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Could not connect to backend");
    }
};

return (
    <div>
        <h1>Available Jobs</h1>

        {message && <p>{message}</p>}

        {jobs.map((job) => (
            <div key={job._id}>
                <h2>{job.title}</h2>

                <p>
                    <strong>Description:</strong>{" "}
                    {job.description}
                </p>

                <p>
                    <strong>Company:</strong>{" "}
                    {job.company}
                </p>

                <p>
                    <strong>Location:</strong>{" "}
                    {job.location}
                </p>

                <p>
                    <strong>Skills:</strong>{" "}
                    {Array.isArray(job.skills)
                        ? job.skills.join(", ")
                        : job.skills}
                </p>

                <p>
                    <strong>Salary:</strong>{" "}
                    {job.salary}
                </p>

                <button
                    onClick={() =>
                        applyForJob(job._id)
                    }
                >
                    Apply Now
                </button>

                <hr />
            </div>
        ))}
    </div>
);

}

export default JobList;