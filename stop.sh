#!/bin/bash

echo "🛑 Stopping CodeLab environment..."

# ------------------ Step 1: Stop smee-client if running ------------------

if pgrep -f "smee-client" > /dev/null; then
  echo "🔌 Stopping smee-client..."
  pkill -f "smee-client"
else
  echo "ℹ️ smee-client not running."
fi

# ------------------ Step 2: Stop Docker Compose services ------------------

echo "📦 Stopping Docker Compose services..."
docker compose down

# ------------------ Step 3: Delete Kind cluster ------------------

if kind get clusters | grep -q "codelab-cluster"; then
  echo "🧹 Deleting Kind cluster..."
  kind delete cluster --name codelab-cluster
else
  echo "ℹ️ No Kind cluster to delete."
fi

echo "✅ CodeLab environment fully stopped!"