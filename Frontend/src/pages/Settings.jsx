import { useNavigate } from "react-router-dom";

function Settings() {

    const navigate = useNavigate();

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f5f7fb",
                padding: "40px"
            }}
        >

            <div
                style={{
                    maxWidth: "800px",
                    margin: "0 auto",
                    background: "white",
                    padding: "40px",
                    borderRadius: "15px",
                    textAlign: "center",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
                }}
            >

                <h1>⚙️ Settings</h1>

                <p>
                    Manage your candidate portal settings.
                </p>

                <p>
                    Settings functionality will be
                    added next.
                </p>

                <button
                    onClick={() =>
                        navigate("/candidate-dashboard")
                    }
                    style={{
                        padding: "12px 20px",
                        border: "none",
                        borderRadius: "8px",
                        background: "#007bff",
                        color: "white",
                        cursor: "pointer"
                    }}
                >
                    ← Back to Dashboard
                </button>

            </div>

        </div>
    );
}

export default Settings;