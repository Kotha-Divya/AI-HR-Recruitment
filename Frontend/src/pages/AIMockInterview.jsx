import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function AIMockInterview() {

    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState("");

    const [interviewStarted, setInterviewStarted] = useState(false);
    const [applicationId, setApplicationId] = useState("");

    const [question, setQuestion] = useState("");
    const [questionIndex, setQuestionIndex] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);

    const [answer, setAnswer] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [completed, setCompleted] = useState(false);
    const [result, setResult] = useState(null);

    const [isListening, setIsListening] = useState(false);
    const [voiceSupported, setVoiceSupported] = useState(true);

    const recognitionRef = useRef(null);


    // ======================================================
    // LOAD APPLICATIONS
    // ======================================================

    useEffect(() => {

        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        loadApplications();

    }, []);


    // ======================================================
    // VOICE RECOGNITION
    // ======================================================

    useEffect(() => {

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {

            setVoiceSupported(false);
            return;

        }

        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";


        recognition.onstart = () => {

            setIsListening(true);
            setError("");

            setMessage(
                "🎤 Listening... Speak your answer."
            );

        };


        recognition.onresult = (event) => {

            let transcript = "";

            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {

                transcript +=
                    event.results[i][0].transcript;

            }

            setAnswer(transcript);

        };


        recognition.onerror = (event) => {

            console.error(
                "Speech recognition error:",
                event.error
            );

            setIsListening(false);

            setError(
                "Voice recognition failed. You can type your answer instead."
            );

        };


        recognition.onend = () => {

            setIsListening(false);

        };


        recognitionRef.current = recognition;


        return () => {

            try {

                recognition.stop();

            }
            catch (error) {

                console.log(
                    "Recognition already stopped."
                );

            }

        };

    }, []);


    // ======================================================
    // LOAD MY APPLICATIONS
    // ======================================================

    const loadApplications = async () => {

        try {

            setLoading(true);
            setError("");

            const token =
                localStorage.getItem("token");


            const response =
                await fetch(
                    "http://localhost:5000/api/applications/my-applications",
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


            let data;

            try {

                data = JSON.parse(text);

            }
            catch {

                throw new Error(
                    "Invalid response from server."
                );

            }


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to load applications."
                );

            }


            setApplications(
                data.applications || []
            );

        }
        catch (err) {

            console.error(
                "Load applications error:",
                err
            );

            setError(
                err.message ||
                "Unable to load applications."
            );

        }
        finally {

            setLoading(false);

        }

    };


    // ======================================================
    // START INTERVIEW
    // ======================================================

    const startInterview = async () => {

        if (!selectedApplication) {

            setError(
                "Please select an application."
            );

            return;

        }


        const selected =
            applications.find(
                application =>
                    application._id ===
                    selectedApplication
            );


        if (!selected) {

            setError(
                "Selected application was not found."
            );

            return;

        }


        // ONLY SHORTLISTED CANDIDATES

        if (selected.status !== "Shortlisted") {

            setError(
                "You can start the AI interview only after your application is shortlisted."
            );

            return;

        }


        try {

            setLoading(true);
            setError("");

            setMessage(
                "Starting AI interview..."
            );


            const token =
                localStorage.getItem("token");


            const response =
                await fetch(
                    `http://localhost:5000/api/ai/start-interview/${selectedApplication}`,
                    {
                        method: "POST",

                        headers: {
                            Authorization:
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json"
                        }
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to start AI interview."
                );

            }


            setApplicationId(
                data.interview.applicationId
            );


            setQuestion(
                data.interview.question
            );


            setQuestionIndex(
                data.interview.currentQuestion
            );


            setTotalQuestions(
                data.interview.totalQuestions
            );


            setInterviewStarted(true);

            setAnswer("");

            setMessage(
                "AI interview started successfully."
            );


            speakQuestion(
                data.interview.question
            );

        }
        catch (err) {

            console.error(
                "Start interview error:",
                err
            );

            setError(
                err.message ||
                "Unable to start AI interview."
            );

            setMessage("");

        }
        finally {

            setLoading(false);

        }

    };


    // ======================================================
    // TEXT TO SPEECH
    // ======================================================

    const speakQuestion = (text) => {

        if (!window.speechSynthesis) {
            return;
        }


        window.speechSynthesis.cancel();


        const speech =
            new SpeechSynthesisUtterance(text);

        speech.lang = "en-US";
        speech.rate = 0.9;
        speech.pitch = 1;


        window.speechSynthesis.speak(
            speech
        );

    };


    // ======================================================
    // START VOICE
    // ======================================================

    const startVoiceAnswer = () => {

        if (!voiceSupported) {

            setError(
                "Voice input is not supported. Please use Chrome or Microsoft Edge."
            );

            return;

        }


        if (!recognitionRef.current) {

            setError(
                "Voice recognition is not available."
            );

            return;

        }


        setAnswer("");
        setError("");
        setMessage("");


        try {

            recognitionRef.current.start();

        }
        catch (err) {

            console.error(
                "Voice start error:",
                err
            );

        }

    };


    // ======================================================
    // STOP VOICE
    // ======================================================

    const stopVoiceAnswer = () => {

        if (
            recognitionRef.current &&
            isListening
        ) {

            recognitionRef.current.stop();

        }

    };


    // ======================================================
    // SUBMIT ANSWER
    // ======================================================

    const submitAnswer = async () => {

        if (!answer.trim()) {

            setError(
                "Please type or speak an answer."
            );

            return;

        }


        try {

            setLoading(true);
            setError("");

            setMessage(
                "Evaluating your answer..."
            );


            const token =
                localStorage.getItem("token");


            const response =
                await fetch(
                    `http://localhost:5000/api/ai/submit-answer/${applicationId}`,
                    {
                        method: "POST",

                        headers: {
                            Authorization:
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            questionIndex:
                                questionIndex,

                            answer:
                                answer.trim()

                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to submit answer."
                );

            }


            // ==================================================
            // ALL QUESTIONS ANSWERED
            // ==================================================

            if (data.completed) {

                setMessage(
                    "All questions answered. Completing interview..."
                );


                await completeInterview();

                return;

            }


            // ==================================================
            // NEXT QUESTION
            // ==================================================

            setQuestionIndex(
                data.nextQuestionIndex
            );


            setQuestion(
                data.nextQuestion
            );


            setAnswer("");


            setMessage(
                `Answer evaluated: ${data.score}/100`
            );


            speakQuestion(
                data.nextQuestion
            );

        }
        catch (err) {

            console.error(
                "Submit answer error:",
                err
            );

            setError(
                err.message ||
                "Unable to submit answer."
            );

            setMessage("");

        }
        finally {

            setLoading(false);

        }

    };


    // ======================================================
    // COMPLETE INTERVIEW
    // ======================================================

    const completeInterview = async () => {

        try {

            const token =
                localStorage.getItem("token");


            const response =
                await fetch(
                    `http://localhost:5000/api/ai/complete-interview/${applicationId}`,
                    {
                        method: "POST",

                        headers: {
                            Authorization:
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json"
                        }
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to complete interview."
                );

            }


            console.log(
                "INTERVIEW RESULT:",
                data.interview
            );


            setResult(
                data.interview
            );


            setCompleted(true);

            setInterviewStarted(false);


            setMessage(
                "🎉 AI interview completed successfully!"
            );

        }
        catch (err) {

            console.error(
                "Complete interview error:",
                err
            );

            setError(
                err.message ||
                "Unable to complete interview."
            );

        }

    };


    // ======================================================
    // GET CANDIDATE RESULT
    // ======================================================

    const getCandidateResult = () => {

        if (!result) {
            return "Result not available";
        }


        const interviewResult =
            result.interviewResult ||
            result.result ||
            "";


        if (
            interviewResult ===
            "Excellent Candidate"
        ) {

            return "Selected";

        }


        if (
            interviewResult ===
            "Good Candidate"
        ) {

            return "Selected";

        }


        if (
            interviewResult ===
            "Recommended"
        ) {

            return "Selected";

        }


        if (
            interviewResult ===
            "Not Recommended"
        ) {

            return "Rejected";

        }


        if (
            interviewResult ===
            "Needs Improvement"
        ) {

            return "Rejected";

        }


        if (
            interviewResult ===
            "Poor Candidate"
        ) {

            return "Rejected";

        }


        if (
            interviewResult ===
            "Selected"
        ) {

            return "Selected";

        }


        if (
            interviewResult ===
            "Rejected"
        ) {

            return "Rejected";

        }


        return interviewResult ||
            "Result not available";

    };


    // ======================================================
    // LOGOUT
    // ======================================================

    const logout = () => {

        if (window.speechSynthesis) {

            window.speechSynthesis.cancel();

        }


        if (
            recognitionRef.current &&
            isListening
        ) {

            recognitionRef.current.stop();

        }


        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");

        navigate("/login");

    };


    // ======================================================
    // BACK TO DASHBOARD
    // ======================================================

    const backToDashboard = () => {

        if (window.speechSynthesis) {

            window.speechSynthesis.cancel();

        }


        if (
            recognitionRef.current &&
            isListening
        ) {

            recognitionRef.current.stop();

        }


        navigate(
            "/candidate-dashboard"
        );

    };


    // ======================================================
    // RESULT STYLE
    // ======================================================

    const candidateResult =
        getCandidateResult();


    const resultIsSelected =
        candidateResult === "Selected";


    const resultStyle = {

        display: "inline-block",

        padding: "10px 25px",

        borderRadius: "25px",

        backgroundColor:
            resultIsSelected
                ? "#d1e7dd"
                : "#f8d7da",

        color:
            resultIsSelected
                ? "#0f5132"
                : "#842029",

        fontSize: "24px",

        fontWeight: "bold"

    };


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

            {/* ==================================================
                HEADER
            ================================================== */}

            <div
                style={{
                    maxWidth: "900px",
                    margin: "0 auto 25px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >

                <button
                    onClick={backToDashboard}

                    style={buttonStyle}
                >
                    ← Back to Dashboard
                </button>


                <button
                    onClick={logout}

                    style={{
                        ...buttonStyle,
                        backgroundColor: "#dc3545"
                    }}
                >
                    Logout
                </button>

            </div>


            {/* ==================================================
                MAIN CARD
            ================================================== */}

            <div
                style={{
                    maxWidth: "900px",
                    margin: "0 auto",
                    backgroundColor: "white",
                    borderRadius: "15px",
                    padding: "35px",
                    boxShadow:
                        "0 4px 20px rgba(0,0,0,0.08)"
                }}
            >

                {/* ==================================================
                    TITLE
                ================================================== */}

                <div
                    style={{
                        textAlign: "center",
                        marginBottom: "30px"
                    }}
                >

                    <div
                        style={{
                            fontSize: "50px"
                        }}
                    >
                        🤖
                    </div>


                    <h1>
                        AI Mock Interview
                    </h1>


                    <p
                        style={{
                            color: "#666"
                        }}
                    >
                        Practice your interview with AI
                        using voice or text answers.
                    </p>

                </div>


                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (

                    <div
                        style={{
                            backgroundColor: "#f8d7da",
                            color: "#842029",
                            padding: "12px",
                            borderRadius: "8px",
                            marginBottom: "20px"
                        }}
                    >
                        {error}
                    </div>

                )}


                {/* ==================================================
                    MESSAGE
                ================================================== */}

                {message && (

                    <div
                        style={{
                            backgroundColor: "#e8f4ff",
                            color: "#145a8d",
                            padding: "12px",
                            borderRadius: "8px",
                            marginBottom: "20px"
                        }}
                    >
                        {message}
                    </div>

                )}


                {/* ==================================================
                    FINAL RESULT
                ================================================== */}

                {completed && result && (

                    <div>

                        <h2
                            style={{
                                textAlign: "center"
                            }}
                        >
                            🎉 Interview Completed
                        </h2>


                        {/* ==================================================
                            CANDIDATE RESULT
                            SCORE IS INTENTIONALLY HIDDEN
                        ================================================== */}

                        <div
                            style={{
                                textAlign: "center",
                                margin: "30px 0"
                            }}
                        >

                            <h3>
                                Interview Result
                            </h3>


                            <div
                                style={resultStyle}
                            >
                                {candidateResult}
                            </div>

                        </div>


                        {/* ==================================================
                            AI FEEDBACK
                        ================================================== */}

                        <div
                            style={{
                                backgroundColor: "#f5f7fb",
                                padding: "20px",
                                borderRadius: "10px",
                                marginBottom: "25px"
                            }}
                        >

                            <h3>
                                💬 AI Feedback
                            </h3>


                            <p
                                style={{
                                    lineHeight: "1.6",
                                    color: "#444"
                                }}
                            >

                                {result.summary ||
                                    result.feedback ||
                                    "No feedback available."}

                            </p>

                        </div>


                        {/* ==================================================
                            BACK TO DASHBOARD
                        ================================================== */}

                        <button
                            onClick={backToDashboard}

                            style={{
                                ...buttonStyle,
                                width: "100%"
                            }}
                        >
                            Back to Candidate Dashboard
                        </button>

                    </div>

                )}


                {/* ==================================================
                    APPLICATION SELECTION
                ================================================== */}

                {!interviewStarted &&
                    !completed && (

                    <div>

                        <h2>
                            Start Your Interview
                        </h2>


                        <p>
                            Select a shortlisted application
                            to begin your AI mock interview.
                        </p>


                        {loading ? (

                            <p>
                                Loading applications...
                            </p>

                        ) : applications.length === 0 ? (

                            <div>

                                <p>
                                    You have no applications yet.
                                </p>


                                <button
                                    onClick={() =>
                                        navigate("/jobs")
                                    }

                                    style={buttonStyle}
                                >
                                    Browse Available Jobs
                                </button>

                            </div>

                        ) : (

                            <>

                                <select
                                    value={
                                        selectedApplication
                                    }

                                    onChange={(e) =>
                                        setSelectedApplication(
                                            e.target.value
                                        )
                                    }

                                    style={inputStyle}
                                >

                                    <option value="">
                                        -- Select Application --
                                    </option>


                                    {applications.map(
                                        application => (

                                            <option
                                                key={
                                                    application._id
                                                }

                                                value={
                                                    application._id
                                                }
                                            >

                                                {application.job?.title ||
                                                    "Job Application"}

                                                {" - "}

                                                {application.status}

                                            </option>

                                        )
                                    )}

                                </select>


                                <button
                                    onClick={
                                        startInterview
                                    }

                                    disabled={loading}

                                    style={{
                                        ...buttonStyle,
                                        width: "100%",
                                        marginTop: "15px"
                                    }}
                                >
                                    🤖 Start AI Interview
                                </button>


                                <p
                                    style={{
                                        marginTop: "15px",
                                        color: "#666",
                                        fontSize: "14px"
                                    }}
                                >
                                    Note: You can start the
                                    interview after your
                                    application is shortlisted.
                                </p>

                            </>

                        )}

                    </div>

                )}


                {/* ==================================================
                    INTERVIEW
                ================================================== */}

                {interviewStarted &&
                    !completed && (

                    <div>

                        {/* ==================================================
                            PROGRESS
                        ================================================== */}

                        <div
                            style={{
                                textAlign: "center",
                                marginBottom: "25px"
                            }}
                        >

                            <strong>
                                Question {questionIndex + 1}
                                {" "}of{" "}
                                {totalQuestions}
                            </strong>

                        </div>


                        {/* ==================================================
                            QUESTION
                        ================================================== */}

                        <div
                            style={{
                                backgroundColor: "#f5f7fb",
                                padding: "25px",
                                borderRadius: "12px",
                                marginBottom: "25px"
                            }}
                        >

                            <h3>
                                🤖 AI Interviewer
                            </h3>


                            <p
                                style={{
                                    fontSize: "20px",
                                    lineHeight: "1.6"
                                }}
                            >
                                {question}
                            </p>


                            <button
                                onClick={() =>
                                    speakQuestion(question)
                                }

                                style={{
                                    ...buttonStyle,
                                    marginTop: "10px"
                                }}
                            >
                                🔊 Hear Question
                            </button>

                        </div>


                        {/* ==================================================
                            ANSWER
                        ================================================== */}

                        <label
                            style={{
                                fontWeight: "bold"
                            }}
                        >
                            Your Answer
                        </label>


                        <textarea
                            value={answer}

                            onChange={(e) =>
                                setAnswer(
                                    e.target.value
                                )
                            }

                            placeholder="Type your answer here or use the microphone..."

                            rows="7"

                            style={{
                                ...inputStyle,
                                resize: "vertical",
                                marginTop: "10px"
                            }}
                        />


                        {/* ==================================================
                            VOICE + SUBMIT
                        ================================================== */}

                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                marginTop: "15px",
                                flexWrap: "wrap"
                            }}
                        >

                            {!isListening ? (

                                <button
                                    onClick={
                                        startVoiceAnswer
                                    }

                                    style={{
                                        ...buttonStyle,
                                        backgroundColor:
                                            "#198754"
                                    }}
                                >
                                    🎤 Start Speaking
                                </button>

                            ) : (

                                <button
                                    onClick={
                                        stopVoiceAnswer
                                    }

                                    style={{
                                        ...buttonStyle,
                                        backgroundColor:
                                            "#dc3545"
                                    }}
                                >
                                    ⏹ Stop Speaking
                                </button>

                            )}


                            <button
                                onClick={
                                    submitAnswer
                                }

                                disabled={
                                    loading ||
                                    !answer.trim()
                                }

                                style={{
                                    ...buttonStyle,
                                    flex: 1,
                                    opacity:
                                        loading ||
                                        !answer.trim()
                                            ? 0.6
                                            : 1
                                }}
                            >

                                {loading
                                    ? "Evaluating..."
                                    : questionIndex + 1 ===
                                      totalQuestions
                                        ? "Submit Final Answer →"
                                        : "Submit Answer →"}

                            </button>

                        </div>


                        {/* ==================================================
                            VOICE SUPPORT MESSAGE
                        ================================================== */}

                        {!voiceSupported && (

                            <p
                                style={{
                                    color: "#777",
                                    marginTop: "10px"
                                }}
                            >
                                Voice input is not supported
                                in this browser. Please use
                                Chrome or Microsoft Edge.
                            </p>

                        )}

                    </div>

                )}

            </div>

        </div>

    );

}


// ======================================================
// BUTTON STYLE
// ======================================================

const buttonStyle = {

    border: "none",

    padding: "12px 20px",

    borderRadius: "8px",

    backgroundColor: "#007bff",

    color: "white",

    fontSize: "15px",

    cursor: "pointer"

};


// ======================================================
// INPUT STYLE
// ======================================================

const inputStyle = {

    width: "100%",

    boxSizing: "border-box",

    padding: "12px",

    border: "1px solid #ccc",

    borderRadius: "8px",

    fontSize: "16px"

};


export default AIMockInterview;
