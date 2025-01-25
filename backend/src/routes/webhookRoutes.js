const express = require('express');
const bodyParser = require('body-parser'); // Use body-parser for raw body handling
const { verifyWebhookSignature } = require('../services/githubService'); // Import the signature verification function
const prisma = require('../lib/prisma'); // Import Prisma for database operations

const router = express.Router();

/**
 * POST /webhook/github
 * Handles incoming GitHub webhook events and processes push events.
 */
router.post(
  '/github',
  bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf; // Capture the raw body as a buffer
      console.log('Raw Buffer Captured:', buf.toString('utf-8')); // Debugging: log the raw buffer
    },
  }),
  async (req, res) => {
    try {
      const signature = req.headers['x-hub-signature-256'];
      const rawBody = req.rawBody;

      // Debugging: Ensure raw body is captured
      console.log('Headers:', req.headers);
      console.log('Raw Body:', rawBody);

      // Validate raw body presence
      if (!rawBody) {
        console.error('Raw body is missing');
        return res.status(400).send('Invalid request: Raw body is missing');
      }

      // Validate signature presence
      if (!signature) {
        console.error('Signature is missing');
        return res.status(400).send('Invalid request: Signature is missing');
      }

      // Verify webhook signature
      if (!verifyWebhookSignature(rawBody, signature)) {
        console.error('Invalid signature');
        return res.status(401).send('Invalid signature');
      }

      const payload = req.body; // Parsed JSON payload

      // Process the payload (e.g., update database, validate commit, etc.)
      const { repository, pusher, commits } = payload;

      console.log(`Push event for repo: ${repository.full_name} by ${pusher.name}`);
      console.log(`Commits: ${commits.map((commit) => commit.message).join(', ')}`);

      

      // Example: Update pre-stage validation in the database
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          repoUrl: repository.html_url, // Match the repository URL
        },
        include: { user: true }, // Include the user relationship
      });

      if (!enrollment) {
        console.log(`No enrollment found for repository: ${repository.full_name}`);
        return res.status(404).send('No enrollment found for this repository.');
      }

    // Update the enrollment to set `pushValidated: true` and reset `testValidated` if from the user
    if(pusher.name === enrollment.user.username){
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        pushValidated: true,
        testValidated: false, // Reset test validation for the new push
      },
    });
  }

      console.log(`Push validated for repo: ${repository.full_name}`);
      return res.status(200).send('Push validated and pre-stage completed.');
    } catch (err) {
      console.error('Error processing webhook:', err);
      return res.status(500).send('Internal server error.');
    }
  }
);

module.exports = router;
