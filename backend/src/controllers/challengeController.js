/**
 * challengeController.js - Controller for challenge-related logic.
 *
 * Key Features:
 * - Fetch all challenges available in the system.
 * - Fetch a specific challenge by ID.
 * - Enroll a user in a challenge.
 * - Fetch the current stage of a user's enrollment.
 * - Move the user to the next stage.
 */

const prisma = require('../lib/prisma');
const { createRepoForChallenge } = require('../services/githubService');

/**
 * Fetch all challenges available in the system.
 * Returns an array of challenges with metadata.
 */
const getChallenges = async (req, res) => {
  try {
    const challenges = await prisma.challenge.findMany({
      include: {
        stages: true, // Include stages for each challenge
      },
    });
    res.status(200).json(challenges);
  } catch (err) {
    console.error('Error fetching challenges:', err);
    res.status(500).json({ message: 'Failed to fetch challenges.' });
  }
};

/**
 * Fetch a specific challenge by its ID.
 * If the user is enrolled, also include the user's current stage.
 */
const getChallengeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Fetch the challenge details
    const challenge = await prisma.challenge.findUnique({
      where: { id: Number(id) },
      include: {
        stages: true,
      },
    });

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found.' });
    }

    // Check if the user is enrolled in this challenge
    const enrollment = await prisma.enrollment.findFirst({
      where: { userId, challengeId: Number(id) },
    });

    // If enrolled, fetch the current stage
    let currentStage = null;
    if (enrollment) {
      if (enrollment.currentStage === 0) {
        currentStage = {
          title: 'Setup Repository',
          description: `Clone the repository from ${enrollment.repoUrl} and make your first commit to start.`,
        };
      } else {
        currentStage = challenge.stages.find((stage) => stage.order === enrollment.currentStage);
      }
    }

    res.status(200).json({
      challenge,
      enrolled: !!enrollment,
      currentStage,
    });
  } catch (err) {
    console.error('Error fetching challenge by ID:', err);
    res.status(500).json({ message: 'Failed to fetch challenge.' });
  }
};

/**
 * Enroll the authenticated user in a specific challenge.
 * Creates a new enrollment record for the user.
 */
const enrollChallenge = async (req, res) => {
  try {
    const { challengeId } = req.body;
    const userId = req.user.id;

    const existingEnrollment = await prisma.enrollment.findFirst({
      where: { userId, challengeId },
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled' });
    }

    const repoName = `challenge-${challengeId}-user-${req.user.githubId}`;
    const repoUrl = await createRepoForChallenge(repoName, req.user.githubId);

    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        challengeId,
        currentStage: 0,
        repoUrl,
      },
    });

    res.status(201).json({
      enrollment,
      preStage: {
        title: 'Setup Repository',
        description: `Clone the repository from ${repoUrl} and make your first commit.`,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error enrolling in challenge' });
  }
};

/**
 * Fetch the current stage of the user's enrollment in a challenge.
 * Returns the pre-stage if the user is in stage 0.
 */
const getCurrentStage = async (req, res) => {
  try {
    const { id } = req.params; // Challenge ID
    const userId = req.user.id; // Authenticated user's ID

    // Fetch the user's enrollment in the challenge
    const enrollment = await prisma.enrollment.findFirst({
      where: { userId, challengeId: Number(id) },
      include: { challenge: { include: { stages: true } } },
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found.' });
    }

    // If the current stage is 0, return the pre-stage instructions
    if (enrollment.currentStage === 0) {
      return res.status(200).json({
        stage: {
          title: 'Setup Repository',
          description: `Clone the repository from ${enrollment.repoUrl} and make your first commit to start.`,
        },
      });
    }

    // Fetch the current stage from the challenge's stages
    const currentStage = enrollment.challenge.stages.find(
      (stage) => stage.order === enrollment.currentStage,
    );

    if (!currentStage) {
      return res.status(404).json({ message: 'Stage not found.' });
    }

    res.status(200).json({ stage: currentStage });
  } catch (err) {
    console.error('Error fetching current stage:', err);
    res.status(500).json({ message: 'Failed to fetch current stage.' });
  }
};

/**
 * Move the user to the next stage in the challenge.
 * Updates the enrollment's current stage and fetches the next stage.
 */
const moveToNextStage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Fetch the user's enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: { userId, challengeId: Number(id) },
      include: { challenge: { include: { stages: true } } },
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found.' });
    }

    // Move to the next stage
    const nextStageOrder = enrollment.currentStage + 1;
    const nextStage = enrollment.challenge.stages.find((stage) => stage.order === nextStageOrder);

    if (!nextStage) {
      return res.status(400).json({ message: 'No more stages available.' });
    }

    // Update the enrollment with the next stage
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { currentStage: nextStageOrder },
    });

    res.status(200).json({ stage: nextStage });
  } catch (err) {
    console.error('Error moving to next stage:', err);
    res.status(500).json({ message: 'Failed to move to the next stage.' });
  }
};

module.exports = {
  getChallenges,
  getChallengeById,
  enrollChallenge,
  getCurrentStage,
  moveToNextStage,
};
