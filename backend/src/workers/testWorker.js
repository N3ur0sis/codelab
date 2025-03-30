// testWorker.js
const { Worker } = require('bullmq');
const { KubeConfig, CoreV1Api } = require('@kubernetes/client-node');
const prisma = require('../lib/prisma');
const IORedis = require('ioredis');
const { getInstallationToken } = require('../services/githubService');

const connection = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

process.env.KUBECONFIG = '/root/.kube/config';

async function waitForKubernetes(retries = 10, delay = 5000) {
  const kc = new KubeConfig();
  kc.loadFromDefault();
  const k8sApi = kc.makeApiClient(CoreV1Api);

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔍 Checking Kubernetes connection (Attempt ${i + 1}/${retries})...`);
      await k8sApi.listNode();
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
  const { stageId, commitHash, enrollment, repoUrl } = jobData;
  const podName = `test-runner-${stageId}-${commitHash.slice(0, 8)}`;
  const githubToken = await getInstallationToken('SoloDesignDev');

  const kc = new KubeConfig();
  kc.loadFromDefault();
  const k8sApi = kc.makeApiClient(CoreV1Api);

  const podConfig = {
    apiVersion: 'v1',
    kind: 'Pod',
    metadata: { name: podName },
    spec: {
      restartPolicy: 'Never',
      containers: [
        {
          name: 'test-runner',
          image: 'python:3.9',
          env: [
            { name: 'GITHUB_TOKEN', value: githubToken },
            { name: 'REPO_URL', value: repoUrl },
            { name: 'COMMIT_HASH', value: commitHash },
            { name: 'STAGE_ID', value: String(stageId) },
            { name: 'TEST_REPO_URL', value: 'https://github.com/SoloDesignDev/challenge-1-tests' },
          ],
          command: ['sh', '-c'],
          args: [`
            set -e
            echo "🏗️ Cloning student repo..." &&
            CLEAN_REPO_URL=$(echo "$REPO_URL" | sed 's~https://~~') &&
            git clone https://x-access-token:$GITHUB_TOKEN@$CLEAN_REPO_URL student &&
            cd student &&
            git checkout $COMMIT_HASH &&
            cd .. &&

            echo "🔍 Cloning test repo..." &&
            CLEAN_TEST_REPO_URL=$(echo "$TEST_REPO_URL" | sed 's~https://~~') &&
            git clone https://x-access-token:$GITHUB_TOKEN@$CLEAN_TEST_REPO_URL tests &&
            pip install -r tests/requirements.txt &&

            echo "🧪 Running tests for stage $STAGE_ID..." &&
            cd tests &&
            pytest tests/test_stage_$STAGE_ID.py && echo "__RESULT__:PASS" || echo "__RESULT__:FAIL"
          `],
          resources: {
            limits: { memory: '512Mi', cpu: '0.5' },
          },
        },
      ],
    },
  };
  
  await k8sApi.createNamespacedPod({
    namespace: 'default',
    body: podConfig,
  });

  console.log(`✅ Pod created: ${podName}`);

  // Wait for the pod to complete
  for (let i = 0; i < 20; i++) {
    const res = await k8sApi.readNamespacedPodStatus({
      name: podName,
      namespace: 'default',
    });
  
    if (!res.body || !res.body.status) {
      console.error('⚠️ Invalid response from Kubernetes when checking pod status');
      await new Promise(r => setTimeout(r, 3000));
      continue;
    }
  
    const phase = res.body.status.phase;
    console.log(`⏱️ Pod phase: ${phase}`);
    if (phase === 'Succeeded' || phase === 'Failed') break;
    await new Promise(r => setTimeout(r, 3000));
  }

  // Get logs
  const logs = await k8sApi.readNamespacedPodLog({
    name: podName,
    namespace: 'default',
  });
  console.log(`📜 Logs from pod:\n${logs}`);

  const testPassed = logs.includes('__RESULT__:PASS');

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: { testValidated: testPassed },
  });

  console.log(`🧪 Test ${testPassed ? 'passed' : 'failed'} — DB updated.`);
}

const testWorker = new Worker(
  'test-jobs',
  async (job) => {
    console.log('📥 Processing job:', job.data);
    try {
      await waitForKubernetes();
      await launchTestPod(job.data);
    } catch (err) {
      console.error('❌ Error processing job:', err);
    }
  },
  { connection }
);

console.log('🟢 Worker is listening for jobs...');


