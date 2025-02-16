const { Worker } = require('bullmq');
const { KubeConfig, CoreV1Api } = require('@kubernetes/client-node');
const prisma = require('../lib/prisma');
const IORedis = require('ioredis');

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// 🔧 Set the Kubernetes config path explicitly
process.env.KUBECONFIG = '/root/.kube/config';
const namespace = "default"; // Define Kubernetes namespace

// 🔍 Function to ensure Kubernetes is ready
async function waitForKubernetes(retries = 10, delay = 5000) {
  const kc = new KubeConfig();
  kc.loadFromDefault();
  const k8sApi = kc.makeApiClient(CoreV1Api);

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔍 Checking Kubernetes connection (Attempt ${i + 1}/${retries})...`);
      await k8sApi.listNode(); // API call to check if Kubernetes is accessible
      console.log("✅ Kubernetes cluster is accessible!");
      return k8sApi;
    } catch (error) {
      console.error(`⚠️ Kubernetes not ready yet, retrying in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("❌ Kubernetes cluster is still not accessible after retries!");
}

// 🚀 Function to launch the test pod
async function launchTestPod(jobData) {
  try {
    const k8sApi = await waitForKubernetes(); // Ensure Kubernetes is ready

    const podName = `test-runner-${jobData.stageId}-${jobData.commitHash.slice(0, 8)}`;

    const podConfig = {
      apiVersion: 'v1',
      kind: 'Pod',
      metadata: { name: podName },
      spec: {
        restartPolicy: 'Never',
        containers: [
          {
            name: 'test-runner',
            image: 'python:3.9', // Replace with relevant runtime (Node.js, Java, etc.)
            command: [
              'sh',
              '-c',
              `
              sudo apt clean && sudo apt update && sudo apt upgrade && sudo apt install -y git jq && sudo apt install --reinstall ca-certificates
              echo "🚀 Cloning student repository..." &&
              git clone https://$GITHUB_TOKEN@github.com/${jobData.repoUrl.replace('https://github.com/', '')} student-repo &&
              cd student-repo &&
              git checkout ${jobData.commitHash} &&
              echo "✅ Student repo cloned."

              echo "🚀 Cloning test repository..." &&
              git -c http.sslVerify=false clone https://github.com/N3ur0sis/challenge-test test-repo &&
              cp -r test-repo/tests ./ &&
              cp test-repo/config.json ./ &&
              echo "✅ Test repo cloned and tests copied."

              pip install --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host=files.pythonhosted.org -r test-repo/requirements.txt &&
              TEST_CMD=$(jq -r .test_command config.json) &&
              echo "🚀 Running tests..." &&
              eval $TEST_CMD > test_output.log 2>&1 &&
              echo "✅ Tests completed. Showing last 20 lines:" &&
              tail -n 20 test_output.log
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
            resources: { limits: { memory: '512Mi', cpu: '0.5' } },
          },
        ],
      },
    };

    console.log(`🚀 Creating pod in namespace: ${namespace}`);

    // ✅ Check API response
    const response = await k8sApi.createNamespacedPod({namespace: namespace, body:podConfig});

    if (!response || !response.body) {
      throw new Error("❌ Failed to create pod, Kubernetes API response is invalid.");
    }

    console.log(`✅ Pod created successfully: ${podConfig.metadata.name}`);

    return response.body; // Ensure we return the full response object
  } catch (error) {
    console.error("❌ Failed to launch test pod:", error);
    throw error;
  }
}

// 🚀 Function to fetch logs from the pod
async function fetchPodLogs(podName) {
  const k8sApi = await waitForKubernetes();
  const logs = await k8sApi.readNamespacedPodLog(podName, namespace, 'test-runner');
  return logs.body;
}

// 🎯 Test Worker: Process jobs from the queue
const testWorker = new Worker(
  'test-jobs',
  async (job) => {
    console.log('Processing job:', job.data);

    try {
      const podName = await launchTestPod(job.data);
      
      let podStatus;
      do {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 sec
        const k8sApi = await waitForKubernetes();
        podStatus = await k8sApi.readNamespacedPodStatus({name: podName, namespace: namespace});
      } while (podStatus.body.status.phase !== 'Succeeded' && podStatus.body.status.phase !== 'Failed');

      const logs = await fetchPodLogs(podName);
      const success = logs.includes('All tests passed');

      // 🔹 Store results in database
      await prisma.enrollment.update({
        where: { id: job.data.userId },
        data: { testValidated: success, logs: logs },
      });

      console.log(`✅ Test completed. Success: ${success}`);
    } catch (err) {
      console.error('❌ Error processing test job:', err);
    }
  },
  { connection }
);

console.log('🟢 Worker is listening for jobs...');
