import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Dashboard.css";

function RecruiterProfile() {

    const navigate = useNavigate();

    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        location: ""
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // ======================================================
    // LOAD RECRUITER PROFILE
    // ======================================================

    useEffect(() => {

        const loadProfile = async () => {

            try {

                const token =
                    localStorage.getItem("token");

                if (!token) {
                    setMessage("Please login first.");
                    setLoading(false);
                    return;
                }

                console.log(
                    "Recruiter Profile Token:",
                    token
                );

                const response = await fetch(
                    "http://localhost:5000/api/profile",
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

                console.log(
                    "Recruiter Profile Status:",
                    response.status
                );

                console.log(
                    "Recruiter Profile Response:",
                    text
                );

                let data;

                try {

                    data = JSON.parse(text);

                } catch (error) {

                    setMessage(
                        "Invalid response from server."
                    );

                    setLoading(false);
                    return;
                }

                if (!response.ok) {

                    setMessage(
                        data.message ||
                        "Failed to load recruiter profile."
                    );

                    setLoading(false);
                    return;
                }

                const user =
                    data.user || data.profile;

                if (user) {

                    setProfile({
                        name: user.name || "",
                        email: user.email || "",
                        phone: user.phone || "",
                        location: user.location || ""
                    });

                } else {

                    setMessage(
                        "Recruiter profile not found."
                    );
                }

                setLoading(false);

            } catch (error) {

                console.error(
                    "Recruiter profile error:",
                    error
                );

                setMessage(
                    "Unable to connect to server."
                );

                setLoading(false);
            }
        };

        loadProfile();

    }, []);

    // ======================================================
    // SAVE PROFILE
    // ======================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        const token =
            localStorage.getItem("token");

        if (!token) {

            setMessage(
                "Please login first."
            );

            return;
        }

        try {

            setSaving(true);
            setMessage("Saving profile...");

            const response = await fetch(
                "http://localhost:5000/api/profile",
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        phone: profile.phone,
                        location: profile.location
                    })
                }
            );

            const text =
                await response.text();

            console.log(
                "Save Profile Status:",
                response.status
            );

            console.log(
                "Save Profile Response:",
                text
            );

            let data;

            try {

                data = JSON.parse(text);

            } catch (error) {

                setMessage(
                    "Invalid response from server."
                );

                return;
            }

            if (!response.ok) {

                setMessage(
                    data.message ||
                    "Profile update failed."
                );

                return;
            }

            const user =
                data.user || data.profile;

            if (user) {

                setProfile({
                    name:
                        user.name ||
                        profile.name,

                    email:
                        user.email ||
                        profile.email,

                    phone:
                        user.phone ||
                        profile.phone,

                    location:
                        user.location ||
                        profile.location
                });

            }

            setMessage(
                "Profile saved successfully!"
            );

        } catch (error) {

            console.error(
                "Save profile error:",
                error
            );

            setMessage(
                "Unable to connect to server."
            );

        } finally {

            setSaving(false);
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

            <div className="dashboard">

                <h1>
                    Recruiter Profile
                </h1>

                <p>
                    Loading recruiter profile...
                </p>

            </div>
        );
    }

    // ======================================================
    // PAGE
    // ======================================================

    return (

        <div className="dashboard">

            {/* ==================================================
                TOP BUTTONS
            ================================================== */}

            <div
                className="dashboard-buttons"
                style={{
                    marginBottom: "25px"
                }}
            >

                <button
                    onClick={() =>
                        navigate(
                            "/recruiter-dashboard"
                        )
                    }
                >
                    ← Back to Dashboard
                </button>

                <button
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>

            </div>

            {/* ==================================================
                TITLE
            ================================================== */}

            <h1>
                Recruiter Profile
            </h1>

            <p>
                View and update your recruiter profile.
            </p>

            {/* ==================================================
                MESSAGE
            ================================================== */}

            {message && (

                <div
                    style={{
                        padding: "12px",
                        marginBottom: "20px",
                        borderRadius: "8px",
                        backgroundColor:
                            message.includes("successfully")
                                ? "#d1e7dd"
                                : "#f8d7da",

                        color:
                            message.includes("successfully")
                                ? "#0f5132"
                                : "#842029"
                    }}
                >
                    {message}
                </div>
            )}

            {/* ==================================================
                PROFILE FORM
            ================================================== */}

            <form
                onSubmit={handleSubmit}
                style={{
                    maxWidth: "600px",
                    backgroundColor: "white",
                    padding: "25px",
                    borderRadius: "12px",
                    boxShadow:
                        "0 2px 8px rgba(0,0,0,0.08)"
                }}
            >

                {/* NAME */}

                <div
                    style={{
                        marginBottom: "20px"
                    }}
                >

                    <label
                        style={{
                            display: "block",
                            fontWeight: "bold",
                            marginBottom: "8px"
                        }}
                    >
                        Name
                    </label>

                    <input
                        type="text"
                        value={profile.name}
                        readOnly
                        style={{
                            width: "100%",
                            padding: "10px",
                            boxSizing: "border-box"
                        }}
                    />

                </div>

                {/* EMAIL */}

                <div
                    style={{
                        marginBottom: "20px"
                    }}
                >

                    <label
                        style={{
                            display: "block",
                            fontWeight: "bold",
                            marginBottom: "8px"
                        }}
                    >
                        Email
                    </label>

                    <input
                        type="email"
                        value={profile.email}
                        readOnly
                        style={{
                            width: "100%",
                            padding: "10px",
                            boxSizing: "border-box"
                        }}
                    />

                </div>

                {/* PHONE */}

                <div
                    style={{
                        marginBottom: "20px"
                    }}
                >

                    <label
                        style={{
                            display: "block",
                            fontWeight: "bold",
                            marginBottom: "8px"
                        }}
                    >
                        Phone
                    </label>

                    <input
                        type="text"
                        placeholder="Enter phone number"
                        value={profile.phone}
                        onChange={(e) =>
                            setProfile({
                                ...profile,
                                phone: e.target.value
                            })
                        }
                        style={{
                            width: "100%",
                            padding: "10px",
                            boxSizing: "border-box"
                        }}
                    />

                </div>

                {/* LOCATION */}

                <div
                    style={{
                        marginBottom: "20px"
                    }}
                >

                    <label
                        style={{
                            display: "block",
                            fontWeight: "bold",
                            marginBottom: "8px"
                        }}
                    >
                        Location
                    </label>

                    <input
                        type="text"
                        placeholder="Enter location"
                        value={profile.location}
                        onChange={(e) =>
                            setProfile({
                                ...profile,
                                location: e.target.value
                            })
                        }
                        style={{
                            width: "100%",
                            padding: "10px",
                            boxSizing: "border-box"
                        }}
                    />

                </div>

                {/* SAVE */}

                <button
                    type="submit"
                    disabled={saving}
                    style={{
                        padding: "12px 20px",
                        cursor: saving
                            ? "not-allowed"
                            : "pointer",
                        fontWeight: "bold"
                    }}
                >

                    {saving
                        ? "Saving..."
                        : "Save Profile"}

                </button>

            </form>

        </div>
    );
}

export default RecruiterProfile;
