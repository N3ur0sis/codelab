/**
 * challengeRoutes.js - Routes for challenge-related endpoints.
 *
 * Key Features:
 * - Fetch all challenges.
 * - Fetch a specific challenge by its ID.
 * - Enroll a user in a challenge.
 * - Fetch the current stage of a user's enrollment.
 * - Move the user to the next stage.
 */

const express = require('express');
const ensureAuth = require('../middleware/ensureAuth');
const {
  getChallenges,
  getChallengeById,
  enrollChallenge,
  getCurrentStage,
  moveToNextStage,
  checkPushStatus,
} = require('../controllers/challengeController');

const router = express.Router();

/**
 * GET /challenges
 * Fetch all challenges available in the system.
 */
router.get('/', ensureAuth, getChallenges);

/**
 * GET /challenges/:id
 * Fetch a specific challenge by its ID, including enrollment and stage details.
 */
router.get('/:id', ensureAuth, getChallengeById);

/**
 * POST /challenges/enroll
 * Enroll the authenticated user in a challenge.
 */
router.post('/enroll', ensureAuth, enrollChallenge);

/**
 * GET /challenges/:id/current-stage
 * Fetch the current stage of a user's enrollment in the challenge.
 */
router.get('/:id/current-stage', ensureAuth, getCurrentStage);

/**
 * POST /challenges/:id/next-stage
 * Move the user to the next stage in the challenge.
 */
router.post('/:id/next-stage', ensureAuth, moveToNextStage);

/**
 * GET /challenges/:id/push-status
 * Check if the user's pre-stage Git push is validated.
 */
router.get('/:id/push-status', ensureAuth, checkPushStatus);


module.exports = router;
