const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

// ======================================================
// ROUTES
// ======================================================

const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const profileRoutes = require("./routes/profileRoutes");
const aiRoutes = require("./routes/aiRoutes");
const aiInterviewRoutes = require("./routes/aiInterviewRoutes");

// ======================================================
// EXPRESS APP
// ======================================================

const app = express();

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

// ======================================================
// UPLOADS FOLDER
// ======================================================

// This allows uploaded resumes to be viewed
// from the browser.

app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);

// ======================================================
// TEST ROUTE
// ======================================================

app.get("/", (req, res) => {

    res.status(200).json({

        message:
            "AI HR Recruitment Backend is running"

    });

});

// ======================================================
// AUTH ROUTES
// ======================================================

app.use(
    "/api/auth",
    authRoutes
);

// ======================================================
// JOB ROUTES
// ======================================================

app.use(
    "/api/jobs",
    jobRoutes
);

// ======================================================
// APPLICATION ROUTES
// ======================================================

app.use(
    "/api/applications",
    applicationRoutes
);

// ======================================================
// PROFILE ROUTES
// ======================================================

app.use(
    "/api/profile",
    profileRoutes
);

// ======================================================
// AI RESUME SCREENING ROUTES
// ======================================================

app.use(
    "/api/ai",
    aiRoutes
);

// ======================================================
// AI INTERVIEW ROUTES
// ======================================================

app.use(
    "/api/ai-interview",
    aiInterviewRoutes
);

// ======================================================
// 404 API ROUTE
// ======================================================

app.use((req, res) => {

    res.status(404).json({

        message:
            "API route not found",

        path:
            req.originalUrl

    });

});

// ======================================================
// ERROR HANDLER
// ======================================================

app.use((error, req, res, next) => {

    console.error(
        "SERVER ERROR:",
        error
    );

    res.status(
        error.status || 500
    ).json({

        message:
            error.message ||
            "Internal server error"

    });

});

// ======================================================
// PORT
// ======================================================

const PORT =
    process.env.PORT || 5000;

// ======================================================
// MONGODB CONNECTION
// ======================================================

console.log(
    "Trying to connect to MongoDB..."
);

mongoose
    .connect(process.env.MONGO_URI)

    .then(() => {

        console.log(
            "MongoDB Connected Successfully"
        );

        // ==================================================
        // START SERVER
        // ==================================================

        app.listen(
            PORT,
            () => {

                console.log(
                    `Server is running on port ${PORT}`
                );

                console.log(
                    `Backend URL: http://localhost:${PORT}`
                );

                console.log(
                    `AI Resume Screening: http://localhost:${PORT}/api/ai`
                );

                console.log(
                    `AI Interview: http://localhost:${PORT}/api/ai-interview`
                );

            }
        );

    })

    .catch((error) => {

        console.error(
            "MongoDB connection failed:"
        );

        console.error(
            error.message
        );

    });
