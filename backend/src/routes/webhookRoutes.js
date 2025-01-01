const express = require('express');
const { verifyWebhookSignature } = require('../services/githubService');

const router = express.Router();

router.post(
  '/github',
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
  (req, res) => {
    const signature = req.headers['x-hub-signature-256'];
    if (!verifyWebhookSignature(req.rawBody, signature)) {
      return res.status(401).send('Invalid signature');
    }

    const payload = req.body;
    console.log('Push event received:', payload);

    // TODO: Process the push event, validate commits, and mark stages as completed.

    res.status(200).send('Webhook received');
  },
);

module.exports = router;
