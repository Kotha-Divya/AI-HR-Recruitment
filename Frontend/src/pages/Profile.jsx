import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {

    const navigate = useNavigate();

    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        location: "",
        skills: "",
        education: "",
        experience: "",
        resume: ""
    });

    const [selectedResume, setSelectedResume] = useState(null);

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);


    // ======================================================
    // LOAD PROFILE
    // ======================================================

    useEffect(() => {

        loadProfile();

    }, []);


    const loadProfile = async () => {

        try {

            const token =
                localStorage.getItem("token");


            if (!token) {

                navigate("/login");

                return;

            }


            const response =
                await fetch(
                    "http://localhost:5000/api/profile",
                    {
                        method: "GET",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const data =
                await response.json();


            console.log(
                "PROFILE RESPONSE:",
                data
            );


            if (!response.ok) {

                setMessage(
                    data.message ||
                    "Failed to load profile."
                );

                return;

            }


            const user =
                data.user;


            setProfile({

                name:
                    user.name || "",

                email:
                    user.email || "",

                phone:
                    user.phone || "",

                location:
                    user.location || "",

                skills:
                    Array.isArray(user.skills)
                        ? user.skills.join(", ")
                        : "",

                education:
                    user.education || "",

                experience:
                    user.experience || "",

                resume:
                    user.resume || ""

            });

        }

        catch (error) {

            console.error(
                "Profile error:",
                error
            );


            setMessage(
                "Unable to connect to server."
            );

        }

        finally {

            setLoading(false);

        }

    };


    // ======================================================
    // HANDLE INPUT
    // ======================================================

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;


        setProfile(
            previous => ({
                ...previous,
                [name]: value
            })
        );

    };


    // ======================================================
    // SELECT RESUME
    // ======================================================

    const handleResumeChange = (event) => {

        const file =
            event.target.files[0];


        if (!file) {

            setSelectedResume(null);

            return;

        }


        // Maximum 5 MB

        if (
            file.size >
            5 * 1024 * 1024
        ) {

            setMessage(
                "Resume must be less than 5 MB."
            );

            event.target.value = "";

            setSelectedResume(null);

            return;

        }


        const allowedExtensions = [
            ".pdf",
            ".doc",
            ".docx"
        ];


        const fileName =
            file.name.toLowerCase();


        const isAllowed =
            allowedExtensions.some(
                extension =>
                    fileName.endsWith(extension)
            );


        if (!isAllowed) {

            setMessage(
                "Only PDF, DOC and DOCX files are allowed."
            );

            event.target.value = "";

            setSelectedResume(null);

            return;

        }


        setMessage("");

        setSelectedResume(file);

    };


    // ======================================================
    // UPLOAD RESUME
    // ======================================================

    const handleResumeUpload = async () => {

        if (!selectedResume) {

            setMessage(
                "Please select a resume first."
            );

            return;

        }


        try {

            setUploading(true);

            setMessage("");


            const token =
                localStorage.getItem("token");


            if (!token) {

                navigate("/login");

                return;

            }


            const formData =
                new FormData();


            formData.append(
                "resume",
                selectedResume
            );


            const response =
                await fetch(
                    "http://localhost:5000/api/profile/upload-resume",
                    {
                        method: "POST",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        },

                        body: formData
                    }
                );


            const data =
                await response.json();


            console.log(
                "RESUME UPLOAD RESPONSE:",
                data
            );


            if (!response.ok) {

                setMessage(
                    data.message ||
                    "Resume upload failed."
                );

                return;

            }


            setProfile(
                previous => ({
                    ...previous,
                    resume:
                        data.resumeUrl
                })
            );


            setSelectedResume(null);


            setMessage(
                "Resume uploaded successfully!"
            );


        }

        catch (error) {

            console.error(
                "Resume upload error:",
                error
            );


            setMessage(
                "Unable to upload resume."
            );

        }

        finally {

            setUploading(false);

        }

    };


    // ======================================================
    // SAVE PROFILE
    // ======================================================

    const handleSave = async (event) => {

        event.preventDefault();


        try {

            setSaving(true);

            setMessage("");


            const token =
                localStorage.getItem("token");


            if (!token) {

                navigate("/login");

                return;

            }


            const skillsArray =
                profile.skills
                    .split(",")
                    .map(
                        skill =>
                            skill.trim()
                    )
                    .filter(
                        skill =>
                            skill !== ""
                    );


            const response =
                await fetch(
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

                            phone:
                                profile.phone,

                            location:
                                profile.location,

                            skills:
                                skillsArray,

                            education:
                                profile.education,

                            experience:
                                profile.experience,

                            resume:
                                profile.resume

                        })

                    }
                );


            const data =
                await response.json();


            console.log(
                "PROFILE UPDATE RESPONSE:",
                data
            );


            if (!response.ok) {

                setMessage(
                    data.message ||
                    "Failed to save profile."
                );

                return;

            }


            setMessage(
                "Profile saved successfully!"
            );

        }

        catch (error) {

            console.error(
                "Profile save error:",
                error
            );


            setMessage(
                "Unable to connect to server."
            );

        }

        finally {

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

            <div
                style={{
                    padding: "40px",
                    textAlign: "center"
                }}
            >

                <h2>
                    Loading Profile...
                </h2>

            </div>

        );

    }


    // ======================================================
    // PAGE
    // ======================================================

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
                    justifyContent:
                        "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                    marginBottom: "30px"
                }}
            >

                <h1>
                    Candidate Profile
                </h1>


                <div>

                    <button
                        onClick={() =>
                            navigate(
                                "/candidate-dashboard"
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
                        Back to Candidate Dashboard
                    </button>


                    <button
                        onClick={
                            handleLogout
                        }

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


            {/* PROFILE */}

            <div
                style={{
                    maxWidth: "700px",
                    margin: "0 auto",
                    backgroundColor:
                        "white",
                    padding: "30px",
                    borderRadius: "12px",
                    boxShadow:
                        "0 2px 8px rgba(0,0,0,0.08)"
                }}
            >

                <form
                    onSubmit={handleSave}
                >

                    {/* NAME */}

                    <label>
                        <strong>
                            Name
                        </strong>
                    </label>


                    <input
                        type="text"
                        value={
                            profile.name
                        }
                        disabled

                        style={{
                            width:
                                "100%",
                            padding:
                                "10px",
                            marginTop:
                                "6px",
                            marginBottom:
                                "18px",
                            boxSizing:
                                "border-box"
                        }}
                    />


                    {/* EMAIL */}

                    <label>
                        <strong>
                            Email
                        </strong>
                    </label>


                    <input
                        type="email"
                        value={
                            profile.email
                        }
                        disabled

                        style={{
                            width:
                                "100%",
                            padding:
                                "10px",
                            marginTop:
                                "6px",
                            marginBottom:
                                "18px",
                            boxSizing:
                                "border-box"
                        }}
                    />


                    {/* PHONE */}

                    <label>
                        <strong>
                            Phone
                        </strong>
                    </label>


                    <input
                        type="text"
                        name="phone"
                        value={
                            profile.phone
                        }
                        onChange={
                            handleChange
                        }

                        placeholder=
                            "Enter phone number"

                        style={{
                            width:
                                "100%",
                            padding:
                                "10px",
                            marginTop:
                                "6px",
                            marginBottom:
                                "18px",
                            boxSizing:
                                "border-box"
                        }}
                    />


                    {/* LOCATION */}

                    <label>
                        <strong>
                            Location
                        </strong>
                    </label>


                    <input
                        type="text"
                        name="location"
                        value={
                            profile.location
                        }
                        onChange={
                            handleChange
                        }

                        placeholder=
                            "Enter location"

                        style={{
                            width:
                                "100%",
                            padding:
                                "10px",
                            marginTop:
                                "6px",
                            marginBottom:
                                "18px",
                            boxSizing:
                                "border-box"
                        }}
                    />


                    {/* SKILLS */}

                    <label>
                        <strong>
                            Skills
                        </strong>
                    </label>


                    <input
                        type="text"
                        name="skills"
                        value={
                            profile.skills
                        }
                        onChange={
                            handleChange
                        }

                        placeholder=
                            "Python, Java, SQL"

                        style={{
                            width:
                                "100%",
                            padding:
                                "10px",
                            marginTop:
                                "6px",
                            marginBottom:
                                "8px",
                            boxSizing:
                                "border-box"
                        }}
                    />


                    <small>
                        Separate multiple
                        skills with commas.
                    </small>


                    {/* EDUCATION */}

                    <label
                        style={{
                            display:
                                "block",
                            marginTop:
                                "18px"
                        }}
                    >

                        <strong>
                            Education
                        </strong>

                    </label>


                    <input
                        type="text"
                        name="education"
                        value={
                            profile.education
                        }
                        onChange={
                            handleChange
                        }

                        placeholder=
                            "Enter your education"

                        style={{
                            width:
                                "100%",
                            padding:
                                "10px",
                            marginTop:
                                "6px",
                            marginBottom:
                                "18px",
                            boxSizing:
                                "border-box"
                        }}
                    />


                    {/* EXPERIENCE */}

                    <label>
                        <strong>
                            Experience
                        </strong>
                    </label>


                    <textarea
                        name="experience"
                        value={
                            profile.experience
                        }
                        onChange={
                            handleChange
                        }

                        placeholder=
                            "Enter your experience"

                        rows="4"

                        style={{
                            width:
                                "100%",
                            padding:
                                "10px",
                            marginTop:
                                "6px",
                            marginBottom:
                                "18px",
                            boxSizing:
                                "border-box",
                            resize:
                                "vertical"
                        }}
                    />


                    {/* ==================================================
                        RESUME UPLOAD
                    ================================================== */}

                    <div
                        style={{
                            marginTop:
                                "10px",
                            padding:
                                "20px",
                            border:
                                "2px solid #ddd",
                            borderRadius:
                                "10px"
                        }}
                    >

                        <h2>
                            Resume
                        </h2>


                        <p>
                            Upload your resume
                            for AI screening.
                        </p>


                        {/* FILE INPUT */}

                        <input
                            type="file"

                            accept=
                                ".pdf,.doc,.docx"

                            onChange={
                                handleResumeChange
                            }

                            style={{
                                marginBottom:
                                    "15px"
                            }}
                        />


                        {/* SELECTED FILE */}

                        {selectedResume && (

                            <p>

                                <strong>
                                    Selected:
                                </strong>{" "}

                                {
                                    selectedResume.name
                                }

                            </p>

                        )}


                        {/* UPLOAD BUTTON */}

                        <button
                            type="button"

                            onClick={
                                handleResumeUpload
                            }

                            disabled={
                                uploading ||
                                !selectedResume
                            }

                            style={{
                                padding:
                                    "10px 20px",
                                cursor:
                                    uploading ||
                                    !selectedResume
                                        ? "not-allowed"
                                        : "pointer"
                            }}
                        >

                            {uploading
                                ? "Uploading..."
                                : "Upload Resume"}

                        </button>


                        {/* EXISTING RESUME */}

                        {profile.resume && (

                            <div
                                style={{
                                    marginTop:
                                        "15px"
                                }}
                            >

                                <strong>
                                    Uploaded Resume:
                                </strong>


                                <br />


                                <a
                                    href={
                                        profile.resume.startsWith(
                                            "http"
                                        )
                                            ? profile.resume
                                            : `http://localhost:5000${profile.resume}`
                                    }

                                    target="_blank"

                                    rel="noopener noreferrer"
                                >
                                    View Resume
                                </a>

                            </div>

                        )}

                    </div>


                    {/* SAVE PROFILE */}

                    <button
                        type="submit"
                        disabled={
                            saving
                        }

                        style={{
                            padding:
                                "12px 22px",
                            marginTop:
                                "25px",
                            cursor:
                                saving
                                    ? "not-allowed"
                                    : "pointer"
                        }}
                    >

                        {saving
                            ? "Saving..."
                            : "Save Profile"}

                    </button>


                    {/* MESSAGE */}

                    {message && (

                        <p
                            style={{
                                marginTop:
                                    "15px",
                                fontWeight:
                                    "bold"
                            }}
                        >

                            {message}

                        </p>

                    )}

                </form>

            </div>

        </div>

    );

}

export default Profile;
