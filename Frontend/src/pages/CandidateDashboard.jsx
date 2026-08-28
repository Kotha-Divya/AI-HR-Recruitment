import { useNavigate } from "react-router-dom";
import "../Dashboard.css";

function CandidateDashboard() {

    const navigate = useNavigate();

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
    // CANDIDATE DASHBOARD
    // ==========================================

    return (

        <div className="dashboard">

            <h1>
                Candidate Dashboard
            </h1>

            <p>
                Welcome to the AI HR Recruitment System
            </p>


            {/* ==========================================
                APPLICATIONS & INTERVIEWS
            ========================================== */}

            <h2 style={{ marginTop: "30px" }}>
                📋 Applications & Interviews
            </h2>

            <div className="dashboard-buttons">

                {/* VIEW AVAILABLE JOBS */}

                <button
                    onClick={() =>
                        navigate("/jobs")
                    }
                >
                    🔎 View Available Jobs
                </button>


                {/* MY APPLICATIONS */}

                <button
                    onClick={() =>
                        navigate("/my-applications")
                    }
                >
                    📋 My Applications
                </button>


                {/* INTERVIEW STATUS */}

                <button
                    onClick={() =>
                        navigate("/interview-status")
                    }
                >
                    🎯 Interview Status
                </button>

            </div>


            {/* ==========================================
                ACCOUNT
            ========================================== */}

            <h2 style={{ marginTop: "30px" }}>
                👤 Account
            </h2>

            <div className="dashboard-buttons">

                {/* PROFILE */}

                <button
                    onClick={() =>
                        navigate("/profile")
                    }
                >
                    👤 Profile
                </button>


                {/* LOGOUT */}

                <button
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>

            </div>

        </div>

    );
}

export default CandidateDashboard;