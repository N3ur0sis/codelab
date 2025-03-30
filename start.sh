#!/bin/bash

set -e

echo "🚀 Starting CodeLab Application with Kubernetes & Docker Compose..."

# ------------------ Step 0: Get local IP ------------------

get_local_ip() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    LOCAL_IP=$(ipconfig getifaddr en0)
  else
    LOCAL_IP=$(hostname -I | awk '{print $1}')
  fi
}

# ------------------ Step 1: Ensure Docker is Installed ------------------

install_docker() {
  if ! command -v docker &> /dev/null; then
    echo "🐳 Docker is not installed. Please install Docker manually."
    exit 1
  else
    echo "🐳 Docker is already installed."
  fi
}

# ------------------ Step 2: Ensure Kind is Installed ------------------

install_kind() {
  if ! command -v kind &> /dev/null; then
    echo "📦 Kind is not installed. Installing..."
    OS=$(uname -s | tr '[:upper:]' '[:lower:]')
    ARCH=$(uname -m)
    [[ "$ARCH" == "x86_64" ]] && ARCH="amd64"
    [[ "$ARCH" == "arm64" ]] && ARCH="arm64"

    KIND_VERSION="v0.26.0"
    curl -Lo kind "https://kind.sigs.k8s.io/dl/${KIND_VERSION}/kind-${OS}-${ARCH}"
    chmod +x kind
    sudo mv kind /usr/local/bin/
    echo "✅ Kind installed successfully."
  else
    echo "📦 Kind is already installed."
  fi
}

# ------------------ Step 3: Ensure Kubectl is Installed ------------------

install_kubectl() {
  if ! command -v kubectl &> /dev/null; then
    echo "🔧 Installing kubectl..."
    curl -LO "https://dl.k8s.io/release/$(curl -s https://dl.k8s.io/release/stable.txt)/bin/$(uname -s | tr '[:upper:]' '[:lower:]')/amd64/kubectl"
    chmod +x kubectl
    sudo mv kubectl /usr/local/bin/
    echo "✅ kubectl installed successfully."
  else
    echo "🔧 kubectl is already installed."
  fi
}

# ------------------ Step 4: Start Docker Compose ------------------

start_docker_compose() {
  echo "🛠️ Starting Docker Compose services..."
  ENV=development docker compose --env-file .env.development up --build -d
}

# ------------------ Step 5: Start or recreate Kind cluster ------------------

start_kubernetes_cluster() {
  CONFIG_FILE="./kind-config.yaml"

  echo "📝 Writing Kind config to $CONFIG_FILE"
  cat <<EOF > "$CONFIG_FILE"
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: codelab-cluster
networking:
  apiServerAddress: "0.0.0.0"
  apiServerPort: 6443
nodes:
  - role: control-plane
    kubeadmConfigPatches:
      - |
        kind: ClusterConfiguration
        apiServer:
          certSANs:
            - "127.0.0.1"
            - "localhost"
            - "$LOCAL_IP"
EOF

  if kind get clusters | grep -q "codelab-cluster"; then
    echo "🧹 Deleting existing Kind cluster..."
    kind delete cluster --name codelab-cluster
  fi

  echo "🚀 Creating new Kind cluster with SAN: $LOCAL_IP"
  kind create cluster --config "$CONFIG_FILE"

  echo "🧠 Patching kubeconfig to use $LOCAL_IP"
  kind get kubeconfig --name codelab-cluster > ~/.kube/config
  sed -i.bak "s/0.0.0.0/$LOCAL_IP/" ~/.kube/config
}

# ------------------ Step 6: Copy kubeconfig into the worker ------------------

configure_worker_kubernetes() {
  echo "⏳ Waiting for the worker container to start..."
  until docker ps --format '{{.Names}}' | grep -q "worker"; do
    echo "⌛ Waiting for worker..."
    sleep 2
  done

  echo "📁 Creating /root/.kube inside worker..."
  docker exec worker mkdir -p /root/.kube

  echo "📦 Copying kubeconfig to worker..."
  docker cp ~/.kube/config worker:/root/.kube/config
  echo "✅ kubeconfig copied into worker."
}

# ------------------ Step 7: Wait until Kubernetes is ready ------------------

wait_for_kubernetes_ready() {
  echo "🔍 Waiting for Kubernetes node to be Ready..."
  until kubectl get nodes 2>/dev/null | grep -q " Ready "; do
    echo "⌛ Node not ready yet..."
    sleep 3
  done
  echo "✅ Kubernetes is Ready."
}

# ------------------ Step 8: Verify everything is up ------------------

verify_system() {
  echo "🔍 Verifying Kubernetes setup:"
  kubectl cluster-info
  kubectl get nodes
  kubectl get pods -A
}

# ------------------ Main Flow ------------------

get_local_ip
install_docker
install_kind
install_kubectl
start_docker_compose
start_kubernetes_cluster
configure_worker_kubernetes
wait_for_kubernetes_ready
verify_system

# Optional: Connect GitHub webhook
npx smee-client --url https://smee.io/YLDnwNTp96kvUd7 --target http://localhost:4000/webhooks/github &

echo "🚀 CodeLab environment is fully set up and Kubernetes is ready!"