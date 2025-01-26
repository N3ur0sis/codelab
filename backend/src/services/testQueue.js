const { Queue } = require('bullmq');
const IORedis = require('ioredis');

// Redis connection configuration
const connection = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || '', // Optional password if Redis is secured
});

// Initialize BullMQ queue
const testQueue = new Queue('test-jobs', { connection });

module.exports = testQueue;
