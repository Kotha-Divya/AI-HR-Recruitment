import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    // ==========================================
    // LOGIN
    // ==========================================

    const handleLogin = async (event) => {

        event.preventDefault();

        setError("");

        if (!email || !password) {

            setError(
                "Please enter email and password."
            );

            return;

        }


        try {

            setLoading(true);


            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );


            const data =
                await response.json();


            console.log(
                "LOGIN RESPONSE:",
                data
            );


            if (!response.ok) {

                setError(
                    data.message ||
                    "Invalid email or password."
                );

                return;

            }


            // ==================================
            // SAVE TOKEN
            // ==================================

            if (!data.token) {

                setError(
                    "Login successful, but token was not received."
                );

                return;

            }


            localStorage.setItem(
                "token",
                data.token
            );


            // ==================================
            // GET USER
            // ==================================

            const user =
                data.user || data;


            const role =
                user.role;


            console.log(
                "USER ROLE:",
                role
            );


            if (!role) {

                setError(
                    "User role was not received from server."
                );

                return;

            }


            localStorage.setItem(
                "role",
                role
            );


            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );


            // ==================================
            // ROLE BASED NAVIGATION
            // ==================================

            if (role === "candidate") {

                navigate(
                    "/candidate-dashboard",
                    {
                        replace: true
                    }
                );

            }

            else if (role === "recruiter") {

                navigate(
                    "/recruiter-dashboard",
                    {
                        replace: true
                    }
                );

            }

            else {

                setError(
                    "Invalid user role."
                );

            }


        } catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );

            setError(
                "Unable to connect to server."
            );

        } finally {

            setLoading(false);

        }

    };


    // ==========================================
    // LOGIN PAGE
    // ==========================================

    return (

        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f5f7fb",
                padding: "20px"
            }}
        >

            <div
                style={{
                    width: "100%",
                    maxWidth: "420px",
                    backgroundColor: "white",
                    padding: "35px",
                    borderRadius: "12px",
                    boxShadow:
                        "0 2px 10px rgba(0,0,0,0.1)"
                }}
            >

                <h1
                    style={{
                        textAlign: "center"
                    }}
                >
                    AI HR Recruitment System
                </h1>


                <p
                    style={{
                        textAlign: "center",
                        color: "#666"
                    }}
                >
                    Login to continue
                </p>


                <form
                    onSubmit={handleLogin}
                >

                    {/* EMAIL */}

                    <label>
                        <strong>
                            Email
                        </strong>
                    </label>

                    <input
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(
                                event.target.value
                            )
                        }
                        placeholder="Enter your email"
                        style={{
                            width: "100%",
                            padding: "12px",
                            marginTop: "6px",
                            marginBottom: "18px",
                            boxSizing: "border-box"
                        }}
                    />


                    {/* PASSWORD */}

                    <label>
                        <strong>
                            Password
                        </strong>
                    </label>

                    <input
                        type="password"
                        value={password}
                        onChange={(event) =>
                            setPassword(
                                event.target.value
                            )
                        }
                        placeholder="Enter your password"
                        style={{
                            width: "100%",
                            padding: "12px",
                            marginTop: "6px",
                            marginBottom: "20px",
                            boxSizing: "border-box"
                        }}
                    />


                    {/* ERROR */}

                    {error && (

                        <div
                            style={{
                                backgroundColor:
                                    "#f8d7da",
                                color:
                                    "#842029",
                                padding:
                                    "12px",
                                borderRadius:
                                    "8px",
                                marginBottom:
                                    "15px"
                            }}
                        >
                            {error}
                        </div>

                    )}


                    {/* LOGIN */}

                    <button
                        type="submit"
                        disabled={loading}

                        style={{
                            width: "100%",
                            padding: "13px",
                            cursor:
                                loading
                                    ? "not-allowed"
                                    : "pointer",
                            fontWeight: "bold"
                        }}
                    >

                        {loading
                            ? "Logging in..."
                            : "Login"}

                    </button>

                </form>


                {/* REGISTER */}

                <p
                    style={{
                        textAlign: "center",
                        marginTop: "20px"
                    }}
                >

                    Don't have an account?{" "}

                    <Link to="/register">
                        Register
                    </Link>

                </p>

            </div>

        </div>

    );
}

export default Login;
