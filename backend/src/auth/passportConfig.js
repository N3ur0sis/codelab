/**
 * passportConfig.js - GitHub OAuth configuration using Passport.js
 * This file sets up Passport.js with the GitHub strategy and handles user serialization/deserialization.
 *
 * Key Features:
 * - Implements GitHub OAuth for authentication.
 * - Uses Prisma to fetch or create users in the database.
 */

const passport = require('passport');
const { Strategy: GitHubStrategy } = require('passport-github2');
const prisma = require('../lib/prisma');

/**
 * Serialize user ID to store in the session.
 * @param {Object} user - The user object.
 * @param {Function} done - Callback to signal completion.
 */
passport.serializeUser((user, done) => {
  done(null, user.id);
});

/**
 * Deserialize user by ID from the session.
 * @param {number} id - The user ID.
 * @param {Function} done - Callback to signal completion.
 */
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

/**
 * GitHub OAuth strategy configuration.
 */
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract email if available
        let email = profile.emails?.[0]?.value || null;

        // If no email is found, fetch emails explicitly from the GitHub API
        if (!email) {
          const emailResponse = await fetch('https://api.github.com/user/emails', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (emailResponse.ok) {
            const emails = await emailResponse.json();
            const primaryEmail = emails.find((e) => e.primary)?.email;
            email = primaryEmail || emails[0]?.email || null;
          }
        }

        // Throw an error if email is still not found
        if (!email) {
          return done(new Error('Email not found in GitHub profile or API'));
        }

        // Check if the user already exists in the database
        let user = await prisma.user.findUnique({
          where: { githubId: profile.id },
        });

        // If the user doesn't exist, create a new one
        if (!user) {
          user = await prisma.user.create({
            data: {
              name: profile.displayName || profile.username,
              email: email,
              githubId: profile.id,
              accessToken,
              avatarUrl: profile.avatarUrl,
            },
          });
        } else {
          // Update the user's access token
          await prisma.user.update({
            where: { id: user.id },
            data: { accessToken },
          });
        }

        // Pass the user to the next middleware
        done(null, user);
      } catch (error) {
        console.error('Error during GitHub OAuth strategy:', error);
        done(error, false);
      }
    },
  ),
);

module.exports = passport;
