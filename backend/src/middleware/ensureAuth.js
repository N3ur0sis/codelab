/**
 * ensureAuth.js - Middleware to protect routes by verifying user authentication.
 *
 * Key Features:
 * - Checks if the user is authenticated.
 * - Redirects or returns a 401 error if the user is not authenticated.
 * - Used to secure backend routes requiring user login.
 */

/**
 * Middleware function to ensure the user is authenticated.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated() && req.session) {
    return next(); // User is authenticated, proceed to the next middleware or route handler.
  }
  res.status(401).json({ message: "Unauthorized" }); // User is not authenticated, send a 401 response.
};

module.exports = ensureAuth;
