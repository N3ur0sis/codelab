/**
 * Seed script to populate the database with example data.
 * This includes a challenge with multiple stages for testing.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Example challenge
  const challenge = await prisma.challenge.create({
    data: {
      title: 'Build a Simple HTTP Server',
      description:
        'This challenge will guide you through the steps to create a simple HTTP server using Node.js. You will learn about HTTP requests, responses, and basic server configurations.',
      difficulty: 'Medium',
      estimatedTime: 120, // 120 minutes
      prerequisites: [], // No prerequisites for this challenge
      stages: {
        create: [
          {
            title: 'Setup the Project',
            description:
              'Create a new Node.js project and initialize it with `npm init`. Install the required dependencies.',
            order: 1,
          },
          {
            title: 'Create the HTTP Server',
            description:
              "Use the `http` module in Node.js to create a basic server that responds with 'Hello, World!' for any incoming request.",
            order: 2,
          },
          {
            title: 'Handle Routes',
            description:
              "Update the server to handle different routes. For example, respond with 'Welcome' for `/`, and 'About' for `/about`.",
            order: 3,
          },
          {
            title: 'Add Error Handling',
            description:
              'Ensure your server can handle invalid routes gracefully by returning a 404 response.',
            order: 4,
          },
          {
            title: 'Test the Server',
            description:
              'Write tests using a testing library (e.g., Jest) to ensure your server handles requests correctly.',
            order: 5,
          },
        ],
      },
    },
  });

  console.log('Challenge created:', challenge);
}

main()
  .then(() => {
    console.log('Seeding completed.');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
