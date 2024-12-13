/**
 * authRoutes.js - Routes for handling GitHub OAuth authentication.
 * This file defines the API endpoints for user login, logout, and authentication.
 */

const express = require("express");
const passport = require("passport");
const prisma = require("../lib/prisma");
const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL;
/**
 * Route: /auth/github
 * Purpose: Initiates GitHub OAuth authentication.
 */
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
);

/**
 * Route: /auth/github/callback
 * Purpose: Handles the OAuth callback from GitHub.
 * - If authentication is successful, redirects to the home page.
 * - If authentication fails, redirects to the failure page.
 */
router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/auth/failure",
    successRedirect: `${FRONTEND_URL}/`,
  }),
);

/**
 * Route: /auth/logout
 * Purpose: Logs out the user by destroying their session.
 */
router.get("/logout", async (req, res) => {
  try {
    // Get the session ID from the request
    const sessionId = req.sessionID;

    // Destroy the session
    req.logout(async (err) => {
      if (err) {
        console.error("Error during logout:", err);
        return res.status(500).json({ message: "Error during logout" });
      }

      // Check if the session exists before attempting to delete
      const session = await prisma.session.findUnique({
        where: { sid: sessionId },
      });

      if (session) {
        await prisma.session.delete({
          where: { sid: sessionId },
        });
      }

      // Destroy the session in memory
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({ message: "Failed to log out" });
        }

        // Clear the session cookie
        res.clearCookie("connect.sid", { path: "/" });

        // Redirect to the frontend
        res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/`);
      });
    });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Failed to log out" });
  }
});

/**
 * Route: /auth/failure
 * Purpose: Displays an error message for failed authentication attempts.
 */
router.get("/failure", (req, res) => {
  res.status(401).json({ message: "Authentication failed" });
});

module.exports = router;
