import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateJob() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        description: "",
        company: "",
        location: "",
        skills: "",
        salary: ""
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);


    // ==========================================
    // HANDLE INPUT
    // ==========================================

    const handleChange = (event) => {

        const { name, value } = event.target;

        setForm(previous => ({
            ...previous,
            [name]: value
        }));

    };


    // ==========================================
    // CREATE JOB
    // ==========================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setMessage("");
        setError("");


        // Check login

        const token =
            localStorage.getItem("token");

        if (!token) {

            navigate("/login");
            return;

        }


        // Basic validation

        if (
            !form.title.trim() ||
            !form.description.trim() ||
            !form.company.trim() ||
            !form.location.trim()
        ) {

            setError(
                "Please fill in all required fields."
            );

            return;

        }


        try {

            setSaving(true);


            const skillsArray =
                form.skills
                    .split(",")
                    .map(skill => skill.trim())
                    .filter(skill => skill !== "");


            const response = await fetch(
                "http://localhost:5000/api/jobs",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({

                        title:
                            form.title.trim(),

                        description:
                            form.description.trim(),

                        company:
                            form.company.trim(),

                        location:
                            form.location.trim(),

                        skills:
                            skillsArray,

                        salary:
                            form.salary.trim()

                    })
                }
            );


            const data =
                await response.json();


            console.log(
                "CREATE JOB RESPONSE:",
                data
            );


            if (!response.ok) {

                setError(
                    data.message ||
                    "Failed to create job."
                );

                return;

            }


            setMessage(
                "Job created successfully!"
            );


            // Clear form

            setForm({
                title: "",
                description: "",
                company: "",
                location: "",
                skills: "",
                salary: ""
            });


        } catch (error) {

            console.error(
                "Create job error:",
                error
            );

            setError(
                "Unable to connect to server."
            );

        } finally {

            setSaving(false);

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

                <h1>
                    Create Job
                </h1>


                <div>

                    <button
                        onClick={() =>
                            navigate(
                                "/recruiter-dashboard"
                            )
                        }

                        style={{
                            padding:
                                "10px 16px",
                            marginRight:
                                "10px",
                            cursor:
                                "pointer"
                        }}
                    >
                        Back to Dashboard
                    </button>


                    <button
                        onClick={() =>
                            navigate("/my-jobs")
                        }

                        style={{
                            padding:
                                "10px 16px",
                            marginRight:
                                "10px",
                            cursor:
                                "pointer"
                        }}
                    >
                        My Jobs
                    </button>


                    <button
                        onClick={handleLogout}

                        style={{
                            padding:
                                "10px 16px",
                            cursor:
                                "pointer"
                        }}
                    >
                        Logout
                    </button>

                </div>

            </div>


            {/* FORM CONTAINER */}

            <div
                style={{
                    maxWidth: "700px",
                    margin: "0 auto",
                    backgroundColor: "white",
                    padding: "30px",
                    borderRadius: "12px",
                    boxShadow:
                        "0 2px 8px rgba(0,0,0,0.08)"
                }}
            >

                <form
                    onSubmit={handleSubmit}
                >

                    {/* TITLE */}

                    <label>
                        <strong>
                            Job Title *
                        </strong>
                    </label>

                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Example: Python Developer"
                        style={{
                            width: "100%",
                            padding: "11px",
                            marginTop: "6px",
                            marginBottom: "18px",
                            boxSizing: "border-box"
                        }}
                    />


                    {/* DESCRIPTION */}

                    <label>
                        <strong>
                            Job Description *
                        </strong>
                    </label>

                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Enter job description"
                        rows="5"
                        style={{
                            width: "100%",
                            padding: "11px",
                            marginTop: "6px",
                            marginBottom: "18px",
                            boxSizing: "border-box",
                            resize: "vertical"
                        }}
                    />


                    {/* COMPANY */}

                    <label>
                        <strong>
                            Company *
                        </strong>
                    </label>

                    <input
                        type="text"
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        placeholder="Example: AI HR Solutions"
                        style={{
                            width: "100%",
                            padding: "11px",
                            marginTop: "6px",
                            marginBottom: "18px",
                            boxSizing: "border-box"
                        }}
                    />


                    {/* LOCATION */}

                    <label>
                        <strong>
                            Location *
                        </strong>
                    </label>

                    <input
                        type="text"
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="Example: Hyderabad"
                        style={{
                            width: "100%",
                            padding: "11px",
                            marginTop: "6px",
                            marginBottom: "18px",
                            boxSizing: "border-box"
                        }}
                    />


                    {/* SKILLS */}

                    <label>
                        <strong>
                            Required Skills
                        </strong>
                    </label>

                    <input
                        type="text"
                        name="skills"
                        value={form.skills}
                        onChange={handleChange}
                        placeholder="Python, SQL, MongoDB"
                        style={{
                            width: "100%",
                            padding: "11px",
                            marginTop: "6px",
                            marginBottom: "18px",
                            boxSizing: "border-box"
                        }}
                    />

                    <small>
                        Separate skills with commas.
                    </small>


                    {/* SALARY */}

                    <label
                        style={{
                            display: "block",
                            marginTop: "18px"
                        }}
                    >
                        <strong>
                            Salary
                        </strong>
                    </label>

                    <input
                        type="text"
                        name="salary"
                        value={form.salary}
                        onChange={handleChange}
                        placeholder="Example: 5-8 LPA"
                        style={{
                            width: "100%",
                            padding: "11px",
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


                    {/* SUCCESS */}

                    {message && (

                        <div
                            style={{
                                backgroundColor:
                                    "#d1e7dd",
                                color:
                                    "#0f5132",
                                padding:
                                    "12px",
                                borderRadius:
                                    "8px",
                                marginBottom:
                                    "15px"
                            }}
                        >
                            {message}
                        </div>

                    )}


                    {/* CREATE BUTTON */}

                    <button
                        type="submit"
                        disabled={saving}

                        style={{
                            width: "100%",
                            padding: "13px",
                            cursor:
                                saving
                                    ? "not-allowed"
                                    : "pointer",
                            fontWeight: "bold"
                        }}
                    >

                        {saving
                            ? "Creating Job..."
                            : "Create Job"}

                    </button>

                </form>

            </div>

        </div>

    );
}

export default CreateJob;
