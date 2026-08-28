import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Register.css";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("candidate");

    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        setMessage("Creating account...");

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password,
                        role
                    })
                }
            );

            const data = await response.json();

            console.log(
                "REGISTER RESPONSE:",
                data
            );

            if (response.ok) {
                setMessage(
                    "Registration successful! Redirecting to login..."
                );

                setTimeout(() => {
                    navigate("/login");
                }, 1000);

            } else {
                setMessage(
                    data.message ||
                    "Registration failed"
                );
            }

        } catch (error) {
            console.error(
                "Registration error:",
                error
            );

            setMessage(
                "Could not connect to backend"
            );
        }
    };

    return (
        <div className="register-page">

            <div className="register-box">

                <h2>
                    Create Account
                </h2>

                <form onSubmit={handleRegister}>

                    <label>
                        Name
                    </label>

                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        required
                    />

                    <br />

                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                    />

                    <br />

                    <label>
                        Password
                    </label>

                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                    />

                    <br />

                    <label>
                        Role
                    </label>

                    <select
                        value={role}
                        onChange={(e) =>
                            setRole(e.target.value)
                        }
                    >
                        <option value="candidate">
                            Candidate
                        </option>

                        <option value="recruiter">
                            Recruiter
                        </option>
                    </select>

                    <button type="submit">
                        Register
                    </button>

                </form>

                <p className="register-message">
                    {message}
                </p>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/login")
                    }
                >
                    Back to Login
                </button>

            </div>

        </div>
    );
}

export default Register;