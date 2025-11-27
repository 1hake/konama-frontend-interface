#!/bin/sh
set -e

# Prefix for all Docker secrets
SECRET_PREFIX="IMAGE_GEN_ADMIN"

# Load a secret from Docker Swarm secrets into an environment variable
load_secret() {
    env_var_name=$1
    secret_file="/run/secrets/${SECRET_PREFIX}_${env_var_name}"
    
    if [ -f "$secret_file" ]; then
        export "${env_var_name}"="$(cat "$secret_file")"
        echo "✅ Loaded secret: ${env_var_name}"
    else
        echo "⚠️  Secret file not found: ${secret_file}"
    fi
}

echo "🚀 Starting Image Generation Admin..."

# Load OpenAI API key from Docker Swarm secret
load_secret "OPENAI_API_KEY"

echo "🎯 Starting Next.js application..."

# Execute the main command
exec "$@"