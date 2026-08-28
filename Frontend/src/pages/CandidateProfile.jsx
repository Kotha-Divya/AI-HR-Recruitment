import { useEffect, useState } from "react";

function CandidateProfile({ candidateId }) {
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState("Loading candidate profile...");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Please login as recruiter first");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/applications/recruiter/candidate/${candidateId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (response.ok) {
          setProfile(data.profile);
          setMessage("");
        } else {
          setMessage(
            data.message || "Candidate profile not found"
          );
        }
      } catch (error) {
        console.error(error);
        setMessage("Could not connect to backend");
      }
    };

    fetchProfile();
  }, [candidateId]);

  return (
    <div className="dashboard">
      <h1>Candidate Profile</h1>

      {message && <p>{message}</p>}

      {profile && (
        <div>
          <p>
            <strong>Name:</strong>{" "}
            {profile.user?.name || "Not provided"}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {profile.user?.email || "Not provided"}
          </p>

          <p>
            <strong>Phone:</strong>{" "}
            {profile.phone || "Not provided"}
          </p>

          <p>
            <strong>Location:</strong>{" "}
            {profile.location || "Not provided"}
          </p>

          <p>
            <strong>Skills:</strong>{" "}
            {profile.skills?.join(", ") || "Not provided"}
          </p>

          <p>
            <strong>Education:</strong>{" "}
            {profile.education || "Not provided"}
          </p>

          <p>
            <strong>Experience:</strong>{" "}
            {profile.experience || "Not provided"}
          </p>

          <p>
            <strong>Resume:</strong>{" "}
            {profile.resume || "Not provided"}
          </p>
        </div>
      )}
    </div>
  );
}

export default CandidateProfile;