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
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const prisma = require('../lib/prisma');
const { Octokit } = require('@octokit/rest'); 
const { createRepoForChallenge, getInstallationToken, deleteRepo, checkRepoExists,createTemplateRepo } = require('../services/githubService');
const GITHUB_ACCESS_TOKEN = process.env.GITHUB_PERSONNAL_ACCESS_TOKEN;
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
    const owner = 'SoloDesignDev'; // Replace with your correct account or organization name
    const installationToken = await getInstallationToken(owner);

    const octokit = new Octokit({ auth: installationToken });

    const templateOwner = owner;
    const templateRepo = 'challenge-template'; // Template repository name

    
    const repoExists = await checkRepoExists(owner, repoName, octokit);

    if (repoExists) {
      console.log("Le repo existe déjà");
      deleteRepo(owner,repoName, octokit);
    }
    
    const repoUrl = await createRepoForChallenge(repoName, req.user.username, templateRepo, templateOwner, octokit, owner);

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
          id: 0,
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
 * Validate if the pre-stage push is completed.
 * This is called by the frontend to check if the user has pushed to their repo.
 */
const checkPushStatus = async (req, res) => {
  try {
    const { id } = req.params; // Challenge ID
    const userId = req.user.id; // Authenticated user's ID

    // Fetch the user's enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: { userId, challengeId: Number(id) },
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found.' });
    }

    // Check if the user's push is validated
    const pushValidated = enrollment.pushValidated || false;
    const testValidated = enrollment.testValidated || false;

    res.status(200).json({ pushValidated, testValidated });
  } catch (err) {
    console.error('Error checking push status:', err);
    res.status(500).json({ message: 'Failed to check push status.' });
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
      data: { currentStage: nextStageOrder, pushValidated: false, testValidated: false },
    });

    res.status(200).json({ stage: nextStage });
  } catch (err) {
    console.error('Error moving to next stage:', err);
    res.status(500).json({ message: 'Failed to move to the next stage.' });
  }
};

const testSubmission = async (req, res) => {
  try {
    const { id, stageId } = req.params;
    const userId = req.user.id;

    // Validate the user's current stage
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        challengeId: Number(id),
        currentStage: Number(stageId),
      },
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found or invalid stage.' });
    }

    if (!enrollment.pushValidated) {
      return res.status(400).json({ message: 'Git push not validated yet.' });
    }

    // Simulate test validation (replace with actual logic)
    const testPassed = true; // Replace with actual test result

    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { testValidated: testPassed },
    });

    if (testPassed) {
      console.log(`Stage test validated for user ${userId} in challenge ${id}, stage ${stageId}.`);
      return res.status(200).json({ message: 'Test passed.' });
    } else {
      console.log(`Stage test failed for user ${userId} in challenge ${id}, stage ${stageId}.`);
      return res.status(400).json({ message: 'Test failed.' });
    }
  } catch (err) {
    console.error('Error validating stage test:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * Create a new challenge.
 * Allows an authenticated user to create a challenge with a title, description, difficulty, estimated time,
 * prerequisites, and stages. The challenge is associated with the user as the author.
 */
const formidable = require('formidable');
const createChallenge = async (req, res) => {
  const form = new formidable.IncomingForm();
  const uploadDir = path.join(__dirname, '../../uploads');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  form.uploadDir = uploadDir;
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de l\'upload du fichier.' });
    }

    try {
      const { title, description, difficulty, estimatedTime, prerequisites } = fields;
      const userId = req.user.id;

      const challengeTitle = String(title).trim(); 
      const challengeDescription = String(description).trim(); 

      // Fetch stages from form fields
      const stages = Object.keys(fields)
        .filter(key => key.startsWith('stages['))
        .reduce((acc, key) => {
          const match = key.match(/stages\[(\d+)\]\.(.+)/);
          if (match) {
            const index = Number(match[1]);
            const field = match[2];
            acc[index] = acc[index] || {};
            acc[index][field] = fields[key];
          }
          return acc;
        }, [])
        .map(stage => ({
          title: String(stage.title || '').trim(),  
          description: String(stage.description || '').trim(), 
          order: stage.order ? Number(stage.order) : 0,  
        }));
        // Create the challenge in the database
        const newChallenge = await prisma.challenge.create({
          data: {
            title: challengeTitle,
            description: challengeDescription,
            author: { connect: { id: userId } },
            stages: {  
              create: stages.map((stage, index) => ({
                title: stage.title,
                description: stage.description,
                order: index + 1,
              })),
            },
          },
        });
 
      // Fetch files uploaded with the form
      const uploadedFiles = [];
      for (let fileKey in files) {
        const file = files[fileKey][0];
        if (file.mimetype === 'application/zip' && file.filepath) {
          if (!fs.existsSync(file.filepath)) {
            console.error("Le fichier ZIP n'existe pas :", file.filepath);
            return res.status(400).json({ message: "Fichier ZIP introuvable." });
          }
          const zip = new AdmZip(file.filepath);
          const zipEntries = zip.getEntries();
          const extractDir = path.join(uploadDir, "template", newChallenge.id.toString());
          zip.extractAllTo(extractDir, true);

          for (const zipEntry of zipEntries) {
            const entryName = zipEntry.entryName;
            if (!zipEntry.isDirectory && !entryName.startsWith('__MACOSX') && !entryName.endsWith('/')) {
                uploadedFiles.push({
                filePath: path.join(extractDir, entryName),
                originalFilename: path.basename(entryName),
                mimetype: 'text/plain',
                size: zipEntry.header.size,
                });
            }
          }
        } else {
          uploadedFiles.push({
            filePath: file.filepath,
            originalFilename: file.originalFilename,
            mimetype: file.mimetype,
            size: file.size
          });
        }
      }
    
      console.log("Uploaded files:", uploadedFiles);

      // Create a new repository for the challenge template
      const repoName = `challenge-${newChallenge.id}-template`;
      const owner = 'SoloDesignDev';
      const octokit = new Octokit({ auth: GITHUB_ACCESS_TOKEN });
      const repoUrl = await createTemplateRepo(repoName, req.user.username, uploadedFiles, owner,challengeDescription,octokit);


      // Update the challenge with the repository URL
      await prisma.challenge.update({
        where: { id: newChallenge.id },
        data: { repoTemplateUrl : repoUrl
        
         },
      });

      console.log("Nouveau challenge créé:", newChallenge);      
      res.status(201).json({ challenge: newChallenge});
    } catch (err) {
      console.error('Erreur lors de la création du challenge:', err);
      res.status(500).json({ message: 'Erreur lors de la création du challenge.' });
    }
  });
};

/**
 * Delete a challenge.
 * Allows an authenticated user (challenge author) to delete a challenge. The challenge, along with its stages 
 * and enrollments, will be deleted from the database.
 */
const deleteChallenge = async (req, res) => {
  let { id } = req.params;
  const userId = req.user.id;
  id = parseInt(id, 10);

  if (isNaN(id)) {return res.status(400).json({ message: 'Invalid challenge ID' });}

  try {
    //Find the challenge
    const challenge = await prisma.challenge.findUnique({where: { id },});

    if (!challenge) {return res.status(404).json({ message: 'Challenge not found' }); }
    if (challenge.authorId !== userId) {return res.status(403).json({ message: 'You do not have permission to delete this challenge.' });}

    // Delete Stage
    await prisma.stage.deleteMany({where: {challengeId: id,},});
    // Delete Enrollment
    await prisma.enrollment.deleteMany({where: {challengeId: id,},});
    // Delete Challenge
    await prisma.challenge.delete({where: { id },});

    res.status(200).json({ message: 'Challenge deleted successfully.' });
  } catch (error) {
    console.error('Error deleting challenge:', error);
    res.status(500).json({ message: 'An error occurred while deleting the challenge.' });
  }
};

/**
 * Modify an existing challenge.
 * Allows an authenticated user (challenge author) to update the challenge's title, description, difficulty,
 * estimated time, prerequisites, and stages. Only the challenge author can modify it.
 */
const modifyChallenge = async (req, res) => {
  try {
    const { id } = req.params; 
    const { title, description, difficulty, estimatedTime, prerequisites, stages } = req.body;
    const userId = req.user.id;

    // Find the challenge
    const challenge = await prisma.challenge.findUnique({
      where: { id: Number(id) },
    });

    // Some Verifications
    if (!challenge) {return res.status(404).json({ message: 'Challenge not found.' });}
    if (challenge.authorId !== userId) {return res.status(403).json({ message: 'You do not have permission to modify this challenge.' }); }

    // Update the challenge with new data
    const updatedChallenge = await prisma.challenge.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        difficulty,
        estimatedTime,
        prerequisites,
        stages: {
          deleteMany: {},
          create: stages.map((stage) => ({
            title: stage.title,
            description: stage.description,
            order: stage.order,
          })),
        },
      },
    });

    res.status(200).json(updatedChallenge);
  } catch (err) {
    console.error('Error modifying challenge:', err);
    res.status(500).json({ message: 'Failed to modify challenge.' });
  }
};

module.exports = {
  getChallenges,
  getChallengeById,
  enrollChallenge,
  getCurrentStage,
  moveToNextStage,
  checkPushStatus,
  testSubmission,
  createChallenge,
  deleteChallenge,
  modifyChallenge,
};
