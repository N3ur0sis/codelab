const { Worker } = require('bullmq');
const { KubeConfig, CoreV1Api } = require('@kubernetes/client-node');
const prisma = require('../lib/prisma');
const IORedis = require('ioredis');

const connection = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

const k8sApi = new KubeConfig().makeApiClient(CoreV1Api);

async function launchTestPod(jobData) {
  const podConfig = {
    apiVersion: 'v1',
    kind: 'Pod',
    metadata: {
      name: `test-runner-${jobData.stageId}-${jobData.commitHash.slice(0, 8)}`,
    },
    spec: {
      restartPolicy: 'Never',
      containers: [
        {
          name: 'test-runner',
          image: 'python:3.9', // Use the required runtime
          command: [
            'sh',
            '-c',
            `
            apt update && apt install -y git &&
            git clone https://$GITHUB_TOKEN@github.com/user/challenge-repo student-repo &&
            cd student-repo &&
            git checkout ${jobData.commitHash} &&
            git clone https://$GITHUB_TOKEN@github.com/challenge-org/test-repo test-repo &&
            cp -r test-repo/tests ./ &&
            cp test-repo/config.json ./ &&
            pip install -r test-repo/requirements.txt &&
            TEST_CMD=$(jq -r .test_command config.json) &&
            eval $TEST_CMD > test_output.log 2>&1 &&
            tail -n 50 test_output.log
            `,
          ],
          env: [
            {
              name: 'GITHUB_TOKEN',
              valueFrom: {
                secretKeyRef: { name: 'github-token', key: 'GITHUB_TOKEN' },
              },
            },
          ],
        },
      ],
    },
  };

  await k8sApi.createNamespacedPod('default', podConfig);
  console.log(`Pod created: ${podConfig.metadata.name}`);
  return podConfig.metadata.name;
}

async function fetchPodLogs(podName) {
  const logs = await k8sApi.readNamespacedPodLog(podName, 'default', 'test-runner');
  return logs.body;
}

const testWorker = new Worker(
  'test-jobs',
  async (job) => {
    console.log('Processing job:', job.data);

    try {
      const podName = await launchTestPod(job.data);
      let podStatus;
      do {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 sec
        podStatus = await k8sApi.readNamespacedPodStatus(podName, 'default');
      } while (podStatus.body.status.phase !== 'Succeeded' && podStatus.body.status.phase !== 'Failed');

      const logs = await fetchPodLogs(podName);
      const success = logs.includes('All tests passed');

      await prisma.enrollment.update({
        where: { id: job.data.userId },
        data: { testValidated: success, logs: logs },
      });

      console.log(`Job completed. Success: ${success}`);
    } catch (err) {
      console.error('Error processing job:', err);
    }
  },
  { connection }
);

console.log('Worker is listening for jobs...');