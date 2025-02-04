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
  testSubmission,
  createChallenge,
  deleteChallenge,
  modifyChallenge
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

/**
 * GET /challenges/:id/stages/:stageId/test
 * Check if the user's pre-stage Git push is validated.
 */
router.post('/:id/stages/:stageId/test', ensureAuth, testSubmission);

/**
 * POST /challenges/create
 * Create a Challenge if the authenticated user is a TEACHER.
 */
router.post('/create', ensureAuth, createChallenge);

/**
 * PUT /challenges/:id/modify
 * Modify a Challenge if the authenticated user is a TEACHER.
 */
router.put('/:id/modify', ensureAuth, modifyChallenge);

/**
 * DELETE /challenges/:id/delete
 * Delete a Challenge if the authenticated user is a TEACHER.
 */
router.delete('/:id/delete', ensureAuth, deleteChallenge);

module.exports = router;
