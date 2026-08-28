import { BrowserRouter, Routes, Route } from "react-router-dom";

// ======================================================
// AUTH PAGES
// ======================================================

import Login from "./pages/Login";
import Register from "./pages/Register";

// ======================================================
// CANDIDATE PAGES
// ======================================================

import CandidateDashboard from "./pages/CandidateDashboard";
import Jobs from "./pages/Jobs";
import MyApplications from "./pages/MyApplications";
import Profile from "./pages/Profile";
import AIMockInterview from "./pages/AIMockInterview";
import InterviewStatus from "./pages/InterviewStatus";

// ======================================================
// RECRUITER PAGES
// ======================================================

import RecruiterDashboard from "./pages/RecruiterDashboard";
import CreateJob from "./pages/CreateJob";
import MyJobs from "./pages/MyJobs";
import Applications from "./pages/Applications";
import RecruiterProfile from "./pages/RecruiterProfile";

// ======================================================
// APP
// ======================================================

function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* ==================================================
                    AUTH
                ================================================== */}

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* ==================================================
                    CANDIDATE
                ================================================== */}

                <Route
                    path="/candidate-dashboard"
                    element={<CandidateDashboard />}
                />

                <Route
                    path="/jobs"
                    element={<Jobs />}
                />

                <Route
                    path="/my-applications"
                    element={<MyApplications />}
                />

                <Route
                    path="/profile"
                    element={<Profile />}
                />

                <Route
                    path="/ai-mock-interview"
                    element={<AIMockInterview />}
                />

                <Route
                    path="/ai-interview/:applicationId"
                    element={<AIMockInterview />}
                />

                <Route
                    path="/interview-status"
                    element={<InterviewStatus />}
                />


                {/* ==================================================
                    RECRUITER
                ================================================== */}

                <Route
                    path="/recruiter-dashboard"
                    element={<RecruiterDashboard />}
                />

                <Route
                    path="/create-job"
                    element={<CreateJob />}
                />

                <Route
                    path="/my-jobs"
                    element={<MyJobs />}
                />

                <Route
                    path="/applications"
                    element={<Applications />}
                />

                {/* RECRUITER PROFILE */}

                <Route
                    path="/recruiter-profile"
                    element={<RecruiterProfile />}
                />


                {/* ==================================================
                    FALLBACK
                ================================================== */}

                <Route
                    path="*"
                    element={<Login />}
                />

            </Routes>

        </BrowserRouter>

    );

}

export default App;