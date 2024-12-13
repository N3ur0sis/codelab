/**
 * app.js - Express application setup.
 * This file initializes the Express app, sets up middleware, and integrates Passport.js for authentication.
 *
 * Key Features:
 * - Parses JSON requests.
 * - Configures CORS headers.
 * - Integrates session handling and Passport.js for authentication.
 * - Mounts routes for authentication and API handling.
 */

const express = require("express");
const cors = require("cors");
const passport = require("passport");
const sessionConfig = require("./middleware/sessionConfig");
const authRoutes = require("./routes/authRoutes");
const ensureAuth = require("./middleware/ensureAuth");

require("./auth/passportConfig"); // Initialize Passport strategies
const FRONTEND_URL = process.env.FRONTEND_URL;
const app = express();

/**
 * Middleware: CORS configuration.
 * Allows cross-origin requests from the frontend.
 */
app.use(
  cors({
    origin: `${FRONTEND_URL}`, // Frontend URL
    credentials: true, // Include credentials (cookies, headers)
  }),
);

/**
 * Middleware: Parses incoming JSON requests.
 */
app.use(express.json());

/**
 * Middleware: Session management.
 */
app.use(sessionConfig);

/**
 * Middleware: Initialize Passport for authentication.
 */
app.use(passport.initialize());
app.use(passport.session());

/**
 * Routes: Authentication-related endpoints.
 */
app.use("/auth", authRoutes);

/**
 * Protected route: Session data.
 * GET /auth/session
 * Purpose: Returns the session data for authenticated users.
 */
app.get("/auth/session", ensureAuth, (req, res) => {
  res.status(200).json(req.user);
});

/**
 * Endpoint: Health Check
 * GET /health
 *
 * Purpose: To verify that the API is running.
 */
app.get("/health", (req, res) => {
  res.status(200).json({ message: "API is running" });
});

module.exports = app;
