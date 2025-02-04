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

// 🔧 Explicitly set the KUBECONFIG path
process.env.KUBECONFIG = '/root/.kube/config';

// 🔍 Function to wait for Kubernetes readiness
async function waitForKubernetes(retries = 10, delay = 5000) {
  const kc = new KubeConfig();
  kc.loadFromDefault();
  const k8sApi = kc.makeApiClient(CoreV1Api);

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔍 Checking Kubernetes connection (Attempt ${i + 1}/${retries})...`);
      await k8sApi.listNode(); // Test API connection
      console.log("✅ Kubernetes cluster is accessible!");
      return k8sApi;
    } catch (error) {
      console.error("⚠️ Kubernetes not ready yet, retrying...");
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("❌ Kubernetes cluster is still not accessible after retries!");
}

async function launchTestPod(jobData) {
  const k8sApi = await waitForKubernetes(); // ✅ Wait until Kubernetes is ready

  const podConfig = {
    apiVersion: 'v1',
    kind: 'Pod',
    metadata: { name: `test-runner-${jobData.stageId}-${jobData.commitHash.slice(0, 8)}` },
    spec: {
      restartPolicy: 'Never',
      containers: [
        {
          name: 'test-runner',
          image: 'python:3.9',
          command: ['sh', '-c', 'echo Running tests... && sleep 10'],
          resources: { limits: { memory: '512Mi', cpu: '0.5' } },
        },
      ],
    },
  };

  await k8sApi.createNamespacedPod('default', podConfig);
  console.log(`✅ Pod created successfully: ${podConfig.metadata.name}`);
}

const testWorker = new Worker(
  'test-jobs',
  async (job) => {
    console.log('Processing job:', job.data);

    try {
      await launchTestPod(job.data);
    } catch (err) {
      console.error('❌ Error launching test pod:', err);
    }
  },
  { connection }
);

console.log('🟢 Worker is listening for jobs...');