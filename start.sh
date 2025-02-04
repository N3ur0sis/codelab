#!/bin/bash

set -e  # Exit immediately if a command fails

echo "🚀 Starting CodeLab Application with Kubernetes & Docker Compose..."

# ------------------ Step 1: Ensure Docker is Installed ------------------

install_docker() {
  if ! command -v docker &> /dev/null; then
    echo "🐳 Docker is not installed. Installing Docker..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
      sudo apt update
      sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
      curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
      echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
      sudo apt update
      sudo apt install -y docker-ce docker-ce-cli containerd.io
      sudo usermod -aG docker $USER
      echo "🐳 Docker installed successfully. Please restart your terminal or run 'newgrp docker'."
    elif [[ "$OSTYPE" == "darwin"* ]]; then
      echo "🍏 macOS detected. Please install Docker Desktop from https://www.docker.com/products/docker-desktop/"
      exit 1
    else
      echo "🚨 Unsupported OS. Please install Docker manually."
      exit 1
    fi
  else
    echo "🐳 Docker is already installed."
  fi
}

# ------------------ Step 2: Ensure Kind is Installed ------------------

install_kind() {
  if ! command -v kind &> /dev/null; then
    echo "📦 Kind is not installed. Installing Kind..."

    # Detect OS and Architecture
    OS=$(uname -s)
    ARCH=$(uname -m)

    if [[ "$OS" == "Linux" ]]; then
      KIND_OS="linux"
    elif [[ "$OS" == "Darwin" ]]; then
      KIND_OS="darwin"
    else
      echo "🚨 Unsupported OS: $OS. Please install Kind manually from https://kind.sigs.k8s.io/"
      exit 1
    fi

    if [[ "$ARCH" == "x86_64" ]]; then
      KIND_ARCH="amd64"
    elif [[ "$ARCH" == "arm64" || "$ARCH" == "aarch64" ]]; then
      KIND_ARCH="arm64"
    else
      echo "🚨 Unsupported architecture: $ARCH"
      exit 1
    fi

    # Use the latest stable Kind release
    KIND_VERSION="v0.26.0"
    KIND_URL="https://kind.sigs.k8s.io/dl/${KIND_VERSION}/kind-${KIND_OS}-${KIND_ARCH}"

    echo "Downloading Kind from: $KIND_URL"
    
    curl -Lo ./kind "$KIND_URL"
    
    if [[ $? -ne 0 ]]; then
      echo "❌ Failed to download Kind. Check your internet connection or the URL."
      exit 1
    fi

    chmod +x kind
    sudo mv kind /usr/local/bin/kind
    echo "✅ Kind installed successfully."
  else
    echo "📦 Kind is already installed."
  fi
}

# ------------------ Step 3: Ensure Kubectl is Installed ------------------

install_kubectl() {
  if ! command -v kubectl &> /dev/null; then
    echo "🔧 Installing kubectl..."
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/$(uname -s | tr '[:upper:]' '[:lower:]')/amd64/kubectl"
    chmod +x kubectl
    sudo mv kubectl /usr/local/bin/
    echo "✅ kubectl installed successfully."
  else
    echo "🔧 kubectl is already installed."
  fi
}

# ------------------ Step 4: Start Docker Services ------------------

start_docker_compose() {
  echo "🔧 Starting Docker Compose services..."
  ENV=development docker compose --env-file .env.development up --build  -d 
}

# ------------------ Step 5: Create Kubernetes Cluster if Not Exists ------------------

start_kubernetes_cluster() {
  if ! kind get clusters | grep -q "codelab-cluster"; then
    echo "📌 Creating Kubernetes cluster (kind)..."
    kind create cluster --name codelab-cluster
  else
    echo "✅ Kubernetes cluster already exists."
  fi
}

# ------------------ Step 6: Configure Worker to Use Kubernetes ------------------

configure_worker_kubernetes() {
  echo "⏳ Waiting for the worker container to start..."
  while ! docker ps --format '{{.Names}}' | grep -q "worker"; do
    sleep 2
    echo "⌛ Still waiting for the worker container..."
  done

  echo "🔧 Ensuring /root/.kube directory exists in the worker..."
  docker exec worker mkdir -p /root/.kube

  echo "🔧 Copying Kubernetes config into Worker..."
  docker cp ~/.kube/config worker:/root/.kube/config

  echo "✅ Kubernetes config successfully copied!"
}

# ------------------ Step 7: Verify Everything is Running ------------------

verify_system() {
  echo "🔍 Verifying Kubernetes Cluster..."
  kubectl cluster-info
  kubectl get nodes
  kubectl get pods --all-namespaces
  echo "✅ All systems are up and running!"
}

# ------------------ Execute the Functions in Order ------------------

install_docker
install_kind
install_kubectl
start_docker_compose
start_kubernetes_cluster
configure_worker_kubernetes
verify_system
npx smee-client --url https://smee.io/YLDnwNTp96kvUd7 --target http://localhost:4000/webhooks/github

echo "🚀 CodeLab environment is fully set up!