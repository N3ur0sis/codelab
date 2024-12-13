/**
 * sessionConfig.js - Session configuration for the Express application.
 * This file configures session management using express-session.
 *
 * Key Features:
 * - Stores sessions to maintain user authentication.
 * - Configures secure cookie handling.
 */

const session = require("express-session");
const prisma = require("../lib/prisma");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");

/**
 * Session middleware configuration.
 */
const sessionConfig = session({
  store: new PrismaSessionStore(prisma, { checkPeriod: 2 * 60 * 1000 }), // Remove expired sessions every 2 minutes
  secret: process.env.SESSION_SECRET || "super-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production", // Secure cookies in production
    httpOnly: true, // Prevent client-side access to cookies
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
});

module.exports = sessionConfig;
