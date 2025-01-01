/**
 * githubService.js - Service layer for interacting with GitHub API.
 *
 * Key Features:
 * - Create repositories for challenges using GitHub API.
 * - Assign user permissions to repositories.
 * - Validate incoming webhooks.
 */

const { Octokit } = require('@octokit/rest');
const jwt = require('jsonwebtoken');

const APP_ID = process.env.GITHUB_APP_ID;
const PRIVATE_KEY = process.env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, '\n'); // Fix multiline keys
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

/**
 * Generate a JWT for GitHub App authentication.
 */
const generateGitHubJWT = () => {
  const payload = {
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60, // JWT valid for 60 seconds
    iss: APP_ID,
  };
  return jwt.sign(payload, PRIVATE_KEY, { algorithm: 'RS256' });
};

/**
 * Fetch installation token for a specific GitHub account or organization.
 */
const getInstallationToken = async (owner) => {
  const jwtToken = generateGitHubJWT();
  const octokit = new Octokit({ auth: jwtToken });

  // List installations and find the correct one based on the owner login
  const { data: installations } = await octokit.apps.listInstallations();
  const installation = installations.find((inst) => inst.account.login === owner);

  if (!installation) {
    throw new Error(
      `No installation found for owner: ${owner}. Available: ${installations.map((inst) => inst.account.login).join(', ')}`,
    );
  }

  // Create installation access token
  const { data: tokenData } = await octokit.apps.createInstallationAccessToken({
    installation_id: installation.id,
  });

  console.log('Installation Token Generated:', tokenData);
  return tokenData.token;
};
/**
 * Create a repository for a challenge using a template repository.
 */
async function createRepoForChallenge(username, challengeTitle) {
  try {
    const owner = 'N3ur0sis'; // Replace with your correct account or organization name
    const installationToken = await getInstallationToken(owner);

    const octokit = new Octokit({ auth: installationToken });

    const repoName = `challenge-${challengeTitle.replace(/\s+/g, '-').toLowerCase()}-${username}`;
    const templateOwner = owner;
    const templateRepo = 'challenge-template'; // Template repository name

    console.log('Using template details:', {
      template_owner: templateOwner,
      template_repo: templateRepo,
      repoName,
    });

    // Generate repository from template
    const response = await octokit.repos.createUsingTemplate({
      template_owner: templateOwner, // Owner of the template repo
      template_repo: templateRepo, // Name of the template repo
      owner, // Target owner (your account or organization)
      name: repoName, // New repo name
      private: true,
      description: `Repository for challenge: ${challengeTitle}`,
    });

    console.log('Repository created successfully:', response.data.html_url);
    return response.data.html_url;
  } catch (err) {
    console.error('Error creating repository from template:', err.response?.data || err.message);
    throw err;
  }
}

/**
 * Verify webhook signature.
 */
const verifyWebhookSignature = (payload, signature) => {
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  hmac.update(payload);
  const expected = `sha256=${hmac.digest('hex')}`;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
};

module.exports = { createRepoForChallenge, verifyWebhookSignature };
