const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const prisma = require('../lib/prisma'); // Import Prisma for database operations

// Redis connection configuration
const connection = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,    // Optional, but recommended for some setups
});

// Create a worker to process test jobs
const testWorker = new Worker(
  'test-jobs',
  async (job) => {
    console.log('Processing job:', job.data);

    // Simulate a test process
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate test duration
    await prisma.enrollment.update({
      where: { id: job.data.enrollment.id },
      data: {
        testValidated: true, // Reset test validation for the new push
      },
    });

    console.log('Test job completed:', job.data);
  },
  { connection }
);

console.log('Worker is listening for jobs...');
