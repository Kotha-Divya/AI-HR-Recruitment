import { useEffect, useState } from "react";
import CandidateProfile from "./CandidateProfile";

function RecruiterApplications() {
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("Loading applications...");
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login as recruiter first");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/applications/recruiter",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setApplications(data.applications || []);

        if (!data.applications || data.applications.length === 0) {
          setMessage("No applications found");
        } else {
          setMessage("");
        }
      } else {
        setMessage(data.message || "Could not fetch applications");
      }
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to backend");
    }
  };

  const updateStatus = async (applicationId, status) => {
    const token = localStorage.getItem("token");

    try {
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

      const data = await response.json();

      if (response.ok) {
        setMessage("Application status updated successfully!");
        fetchApplications();
      } else {
        setMessage(
          data.message || "Failed to update application status"
        );
      }
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to backend");
    }
  };

  if (selectedCandidate) {
    return (
      <div>
        <CandidateProfile candidateId={selectedCandidate} />

        <button onClick={() => setSelectedCandidate(null)}>
          Back to Applications
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Candidate Applications</h1>

      {message && <p>{message}</p>}

      {applications.map((application) => (
        <div key={application._id}>
          <h2>{application.job?.title}</h2>

          <p>
            <strong>Company:</strong>{" "}
            {application.job?.company}
          </p>

          <p>
            <strong>Location:</strong>{" "}
            {application.job?.location}
          </p>

          <p>
            <strong>Candidate:</strong>{" "}
            {application.candidate?.name}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {application.candidate?.email}
          </p>

          <p>
            <strong>Current Status:</strong>{" "}
            {application.status}
          </p>

          <label>
            Update Status:
          </label>

          <select
            value={application.status}
            onChange={(e) =>
              updateStatus(
                application._id,
                e.target.value
              )
            }
          >
            <option value="Applied">Applied</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Rejected">Rejected</option>
            <option value="Selected">Selected</option>
          </select>

          <br />
          <br />

          <button
            onClick={() =>
              setSelectedCandidate(application.candidate?._id)
            }
          >
            View Candidate Profile
          </button>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default RecruiterApplications;