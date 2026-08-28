import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function AIInterview() {

    const navigate = useNavigate();
    const { applicationId } = useParams();

    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");

    const [completed, setCompleted] = useState(false);
    const [result, setResult] = useState(null);


    // ======================================================
    // START INTERVIEW
    // ======================================================

    useEffect(() => {

        if (applicationId) {
            startInterview();
        }

    }, [applicationId]);


    const startInterview = async () => {

        try {

            const token =
                localStorage.getItem("token");

            if (!token) {

                navigate("/login");
                return;

            }


            console.log(
                "Starting AI Interview:",
                applicationId
            );


            const response =
                await fetch(
                    `http://localhost:5000/api/ai/start-interview/${applicationId}`,
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


            const text =
                await response.text();


            console.log(
                "START INTERVIEW STATUS:",
                response.status
            );

            console.log(
                "START INTERVIEW RESPONSE:",
                text
            );


            let data;

            try {

                data =
                    JSON.parse(text);

            }
            catch (error) {

                setMessage(
                    "Invalid response from server."
                );

                return;

            }


            if (!response.ok) {

                setMessage(
                    data.message ||
                    "Unable to start AI interview"
                );

                return;

            }


            // ==================================================
            // IMPORTANT
            // Backend returns:
            // data.interview.questions
            // ==================================================

            let receivedQuestions = [];


            if (
                data.interview &&
                Array.isArray(
                    data.interview.questions
                )
            ) {

                receivedQuestions =
                    data.interview.questions;

            }
            else if (
                Array.isArray(data.questions)
            ) {

                receivedQuestions =
                    data.questions;

            }


            console.log(
                "RAW QUESTIONS:",
                receivedQuestions
            );


            // ==================================================
            // CONVERT OBJECT QUESTIONS TO STRINGS
            // ==================================================

            receivedQuestions =
                receivedQuestions.map(
                    item => {

                        if (
                            typeof item === "string"
                        ) {

                            return item;

                        }


                        if (
                            item &&
                            typeof item.question === "string"
                        ) {

                            return item.question;

                        }


                        return "";

                    }
                )
                .filter(
                    question =>
                        question.trim() !== ""
                );


            console.log(
                "FINAL QUESTIONS:",
                receivedQuestions
            );


            // ==================================================
            // CHECK QUESTIONS
            // ==================================================

            if (
                receivedQuestions.length === 0
            ) {

                setMessage(
                    "No interview questions were generated."
                );

                return;

            }


            // ==================================================
            // SET QUESTIONS
            // ==================================================

            setQuestions(
                receivedQuestions
            );


            setAnswers(
                new Array(
                    receivedQuestions.length
                ).fill("")
            );


            setCurrentQuestion(0);


        }
        catch (error) {

            console.error(
                "Start interview error:",
                error
            );


            setMessage(
                "Unable to connect to AI interview server."
            );

        }
        finally {

            setLoading(false);

        }

    };


    // ======================================================
    // ANSWER CHANGE
    // ======================================================

    const handleAnswerChange = (value) => {

        const updatedAnswers =
            [...answers];


        updatedAnswers[currentQuestion] =
            value;


        setAnswers(
            updatedAnswers
        );


        setMessage("");

    };


    // ======================================================
    // NEXT QUESTION
    // ======================================================

    const handleNext = async () => {

        // Check answer

        if (
            !answers[currentQuestion] ||
            answers[currentQuestion].trim() === ""
        ) {

            setMessage(
                "Please answer the question before continuing."
            );

            return;

        }


        setMessage("");


        // ==================================================
        // SAVE ANSWER TO BACKEND
        // ==================================================

        try {

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
                                currentQuestion,

                            answer:
                                answers[currentQuestion]

                        })
                    }
                );


            const data =
                await response.json();


            console.log(
                "ANSWER RESPONSE:",
                data
            );


            if (!response.ok) {

                setMessage(
                    data.message ||
                    "Unable to submit answer."
                );

                return;

            }


            // ==================================================
            // MOVE TO NEXT QUESTION
            // ==================================================

            if (
                !data.completed
            ) {

                setCurrentQuestion(
                    currentQuestion + 1
                );

                setMessage("");

            }


        }
        catch (error) {

            console.error(
                "Next question error:",
                error
            );


            setMessage(
                "Unable to submit answer."
            );

        }

    };


    // ======================================================
    // PREVIOUS QUESTION
    // ======================================================

    const handlePrevious = () => {

        setMessage("");


        if (
            currentQuestion > 0
        ) {

            setCurrentQuestion(
                currentQuestion - 1
            );

        }

    };


    // ======================================================
    // SUBMIT / COMPLETE INTERVIEW
    // ======================================================

    const submitInterview = async () => {

        // Check current answer

        if (
            !answers[currentQuestion] ||
            answers[currentQuestion].trim() === ""
        ) {

            setMessage(
                "Please answer the current question."
            );

            return;

        }


        // Check all answers

        const unanswered =
            answers.some(
                answer =>
                    !answer ||
                    answer.trim() === ""
            );


        if (unanswered) {

            setMessage(
                "Please answer all interview questions before submitting."
            );

            return;

        }


        try {

            setSubmitting(true);

            setMessage("");


            const token =
                localStorage.getItem("token");


            // ==================================================
            // FIRST SAVE LAST ANSWER
            // ==================================================

            const answerResponse =
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
                                currentQuestion,

                            answer:
                                answers[currentQuestion]

                        })
                    }
                );


            const answerData =
                await answerResponse.json();


            console.log(
                "FINAL ANSWER RESPONSE:",
                answerData
            );


            if (!answerResponse.ok) {

                setMessage(
                    answerData.message ||
                    "Unable to save final answer."
                );

                return;

            }


            // ==================================================
            // COMPLETE INTERVIEW
            // ==================================================

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


            console.log(
                "COMPLETE INTERVIEW RESPONSE:",
                data
            );


            if (!response.ok) {

                setMessage(
                    data.message ||
                    "Unable to complete interview."
                );

                return;

            }


            // ==================================================
            // RESULT
            // ==================================================

            setResult(
                data.interview ||
                data.result ||
                data
            );


            setCompleted(true);


        }
        catch (error) {

            console.error(
                "Submit interview error:",
                error
            );


            setMessage(
                "Unable to submit AI interview."
            );

        }
        finally {

            setSubmitting(false);

        }

    };


    // ======================================================
    // LOADING
    // ======================================================

    if (loading) {

        return (

            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#f5f7fb"
                }}
            >

                <div
                    style={{
                        backgroundColor: "white",
                        padding: "40px",
                        borderRadius: "12px",
                        textAlign: "center"
                    }}
                >

                    <h2>
                        🤖 Starting AI Interview...
                    </h2>

                    <p>
                        Please wait while your interview
                        questions are generated.
                    </p>

                </div>

            </div>

        );

    }


    // ======================================================
    // COMPLETED
    // ======================================================

    if (completed) {

        return (

            <div
                style={{
                    minHeight: "100vh",
                    backgroundColor: "#f5f7fb",
                    padding: "40px"
                }}
            >

                <div
                    style={{
                        maxWidth: "800px",
                        margin: "auto",
                        backgroundColor: "white",
                        padding: "35px",
                        borderRadius: "12px",
                        textAlign: "center"
                    }}
                >

                    <h1>
                        🎉 AI Interview Completed
                    </h1>


                    <p>
                        Your interview has been
                        successfully submitted.
                    </p>


                    {result && (

                        <div
                            style={{
                                marginTop: "25px",
                                padding: "25px",
                                backgroundColor: "#f5f7fb",
                                borderRadius: "10px"
                            }}
                        >

                            {result.interviewScore !==
                                undefined && (

                                <h2>
                                    Score:{" "}
                                    {result.interviewScore}%
                                </h2>

                            )}


                            {result.interviewResult && (

                                <h3>
                                    Result:{" "}
                                    {result.interviewResult}
                                </h3>

                            )}


                            {result.recommendation && (

                                <p>
                                    <strong>
                                        Recommendation:
                                    </strong>{" "}
                                    {result.recommendation}
                                </p>

                            )}


                            {result.summary && (

                                <p>
                                    <strong>
                                        Summary:
                                    </strong>{" "}
                                    {result.summary}
                                </p>

                            )}

                        </div>

                    )}


                    <button
                        onClick={() =>
                            navigate(
                                "/my-applications"
                            )
                        }

                        style={{
                            marginTop: "20px",
                            padding: "12px 20px",
                            cursor: "pointer",
                            border: "none",
                            borderRadius: "8px"
                        }}
                    >
                        Back to My Applications
                    </button>

                </div>

            </div>

        );

    }


    // ======================================================
    // NO QUESTIONS
    // ======================================================

    if (
        questions.length === 0
    ) {

        return (

            <div
                style={{
                    minHeight: "100vh",
                    padding: "40px",
                    textAlign: "center",
                    backgroundColor: "#f5f7fb"
                }}
            >

                <h2>
                    Unable to start AI interview
                </h2>


                {message && (

                    <p>
                        {message}
                    </p>

                )}


                <button
                    onClick={() =>
                        navigate(
                            "/my-applications"
                        )
                    }

                    style={{
                        padding: "10px 20px",
                        cursor: "pointer"
                    }}
                >
                    Back to My Applications
                </button>

            </div>

        );

    }


    // ======================================================
    // CURRENT QUESTION
    // ======================================================

    const isLastQuestion =
        currentQuestion ===
        questions.length - 1;


    // ======================================================
    // INTERVIEW PAGE
    // ======================================================

    return (

        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f5f7fb",
                padding: "30px"
            }}
        >

            <div
                style={{
                    maxWidth: "800px",
                    margin: "auto"
                }}
            >

                {/* HEADER */}

                <div
                    style={{
                        backgroundColor: "white",
                        padding: "25px",
                        borderRadius: "12px",
                        marginBottom: "20px"
                    }}
                >

                    <h1>
                        🤖 AI Mock Interview
                    </h1>


                    <p>
                        Answer each question carefully.
                    </p>


                    <div
                        style={{
                            fontWeight: "bold",
                            marginTop: "15px"
                        }}
                    >

                        Question{" "}
                        {currentQuestion + 1}
                        {" "}of{" "}
                        {questions.length}

                    </div>


                    {/* PROGRESS */}

                    <div
                        style={{
                            marginTop: "15px",
                            height: "8px",
                            backgroundColor: "#ddd",
                            borderRadius: "10px",
                            overflow: "hidden"
                        }}
                    >

                        <div
                            style={{
                                width:
                                    `${
                                        (
                                            (currentQuestion + 1) /
                                            questions.length
                                        ) * 100
                                    }%`,

                                height: "100%",
                                backgroundColor: "#4f46e5",
                                transition:
                                    "width 0.3s ease"
                            }}
                        />

                    </div>

                </div>


                {/* MESSAGE */}

                {message && (

                    <div
                        style={{
                            backgroundColor: "#f8d7da",
                            color: "#842029",
                            padding: "12px",
                            borderRadius: "8px",
                            marginBottom: "20px"
                        }}
                    >

                        {message}

                    </div>

                )}


                {/* QUESTION CARD */}

                <div
                    style={{
                        backgroundColor: "white",
                        padding: "30px",
                        borderRadius: "12px"
                    }}
                >

                    <h2>
                        Question {currentQuestion + 1}
                    </h2>


                    <p
                        style={{
                            fontSize: "18px",
                            lineHeight: "1.6",
                            marginTop: "15px"
                        }}
                    >
                        {questions[currentQuestion]}
                    </p>


                    {/* ANSWER */}

                    <textarea
                        value={
                            answers[currentQuestion] ||
                            ""
                        }

                        onChange={(event) =>
                            handleAnswerChange(
                                event.target.value
                            )
                        }

                        placeholder="Type your answer here..."

                        rows={7}

                        style={{
                            width: "100%",
                            padding: "15px",
                            marginTop: "20px",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            fontSize: "16px",
                            resize: "vertical",
                            boxSizing: "border-box"
                        }}
                    />


                    {/* BUTTONS */}

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: "20px",
                            gap: "10px"
                        }}
                    >

                        {/* PREVIOUS */}

                        <button
                            onClick={
                                handlePrevious
                            }

                            disabled={
                                currentQuestion === 0
                            }

                            style={{
                                padding:
                                    "12px 20px",

                                cursor:
                                    currentQuestion === 0
                                        ? "not-allowed"
                                        : "pointer",

                                borderRadius: "8px",

                                border: "1px solid #ccc",

                                backgroundColor:
                                    currentQuestion === 0
                                        ? "#eee"
                                        : "white"
                            }}
                        >

                            ← Previous

                        </button>


                        {/* NEXT OR SUBMIT */}

                        {!isLastQuestion ? (

                            <button
                                onClick={
                                    handleNext
                                }

                                style={{
                                    padding:
                                        "12px 25px",

                                    cursor:
                                        "pointer",

                                    borderRadius:
                                        "8px",

                                    border:
                                        "none",

                                    fontWeight:
                                        "bold"
                                }}
                            >

                                Next →

                            </button>

                        ) : (

                            <button
                                onClick={
                                    submitInterview
                                }

                                disabled={
                                    submitting
                                }

                                style={{
                                    padding:
                                        "12px 25px",

                                    cursor:
                                        submitting
                                            ? "not-allowed"
                                            : "pointer",

                                    borderRadius:
                                        "8px",

                                    border:
                                        "none",

                                    fontWeight:
                                        "bold"
                                }}
                            >

                                {submitting
                                    ? "Submitting..."
                                    : "Submit Interview"}

                            </button>

                        )}

                    </div>

                </div>

            </div>

        </div>

    );

}

export default AIInterview;
