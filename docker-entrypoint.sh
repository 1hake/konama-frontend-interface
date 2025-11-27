#!/bin/sh
set -e

# Prefix for all Docker secrets
SECRET_PREFIX="IMAGE_GEN_ADMIN"

# Load a secret from Docker Swarm secrets into an environment variable
# Usage: load_secret "SECRET_NAME" "ENV_VAR_NAME"
# The secret file is expected at /run/secrets/${SECRET_PREFIX}_${SECRET_NAME}
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

# Load all secrets from Docker Swarm
load_secret "OPENAI_API_KEY"
load_secret "NEXT_PUBLIC_COMFY_API_URL"
load_secret "NEXT_PUBLIC_WORKFLOW_API_URL"
load_secret "NEXT_PUBLIC_BASE_URL"
load_secret "NEXT_PUBLIC_API_URL"

# Optional: Load additional secrets that might be needed
load_secret "JWT_SECRET"
load_secret "API_SECRET"
load_secret "DATABASE_URL"

# Wait for external API dependencies to be ready (if configured)
if [ -n "$NEXT_PUBLIC_COMFY_API_URL" ] && [ "$NEXT_PUBLIC_COMFY_API_URL" != "http://localhost:8188" ]; then
    echo "⏳ Checking ComfyUI API availability..."
    
    # Extract hostname and port from URL
    COMFY_HOST=$(echo "$NEXT_PUBLIC_COMFY_API_URL" | sed -E 's|https?://([^:/]+).*|\1|')
    COMFY_PORT=$(echo "$NEXT_PUBLIC_COMFY_API_URL" | sed -E 's|https?://[^:]+:([0-9]+).*|\1|')
    
    # Default to port 80 for http, 443 for https if not specified
    if [ "$COMFY_PORT" = "$NEXT_PUBLIC_COMFY_API_URL" ]; then
        if echo "$NEXT_PUBLIC_COMFY_API_URL" | grep -q "^https"; then
            COMFY_PORT=443
        else
            COMFY_PORT=80
        fi
    fi
    
    echo "🔍 Checking connectivity to ${COMFY_HOST}:${COMFY_PORT}..."
    
    # Simple connectivity check with timeout
    MAX_ATTEMPTS=5
    ATTEMPT=1
    CONNECTED=false
    
    while [ $ATTEMPT -le $MAX_ATTEMPTS ] && [ "$CONNECTED" = "false" ]; do
        echo "📡 Attempt $ATTEMPT/$MAX_ATTEMPTS to reach ComfyUI API..."
        
        if wget -q -T 10 -O /dev/null "$NEXT_PUBLIC_COMFY_API_URL" 2>/dev/null || \
           nc -z -w 5 "$COMFY_HOST" "$COMFY_PORT" 2>/dev/null; then
            echo "✅ ComfyUI API is reachable"
            CONNECTED=true
        else
            echo "⚠️  Failed attempt $ATTEMPT, waiting 10 seconds before retry..."
            sleep 10
            ATTEMPT=$((ATTEMPT + 1))
        fi
    done
    
    if [ "$CONNECTED" = "false" ]; then
        echo "⚠️  Could not reach ComfyUI API after $MAX_ATTEMPTS attempts"
        echo "🚀 Proceeding anyway - the app will handle connection errors gracefully"
    fi
else
    echo "📝 ComfyUI API URL not configured or set to localhost - skipping connectivity check"
fi

# Check if workflow API is configured and reachable
if [ -n "$NEXT_PUBLIC_WORKFLOW_API_URL" ] && [ "$NEXT_PUBLIC_WORKFLOW_API_URL" != "http://localhost:4000" ]; then
    echo "⏳ Checking Workflow API availability..."
    
    # Extract hostname and port from URL
    WORKFLOW_HOST=$(echo "$NEXT_PUBLIC_WORKFLOW_API_URL" | sed -E 's|https?://([^:/]+).*|\1|')
    WORKFLOW_PORT=$(echo "$NEXT_PUBLIC_WORKFLOW_API_URL" | sed -E 's|https?://[^:]+:([0-9]+).*|\1|')
    
    # Default to port 80 for http, 443 for https if not specified
    if [ "$WORKFLOW_PORT" = "$NEXT_PUBLIC_WORKFLOW_API_URL" ]; then
        if echo "$NEXT_PUBLIC_WORKFLOW_API_URL" | grep -q "^https"; then
            WORKFLOW_PORT=443
        else
            WORKFLOW_PORT=80
        fi
    fi
    
    echo "🔍 Checking connectivity to ${WORKFLOW_HOST}:${WORKFLOW_PORT}..."
    
    if wget -q -T 5 -O /dev/null "$NEXT_PUBLIC_WORKFLOW_API_URL/health" 2>/dev/null || \
       nc -z -w 5 "$WORKFLOW_HOST" "$WORKFLOW_PORT" 2>/dev/null; then
        echo "✅ Workflow API is reachable"
    else
        echo "⚠️  Workflow API is not reachable - the app will use fallback behavior"
    fi
else
    echo "📝 Workflow API URL not configured or set to localhost - skipping connectivity check"
fi

# Validate critical environment variables
echo "🔧 Validating environment configuration..."

if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  Warning: OPENAI_API_KEY is not set - voice transcription features will be disabled"
else
    echo "✅ OpenAI API key is configured"
fi

if [ -z "$NEXT_PUBLIC_COMFY_API_URL" ]; then
    echo "⚠️  Warning: NEXT_PUBLIC_COMFY_API_URL is not set - using default localhost configuration"
else
    echo "✅ ComfyUI API URL is configured: $NEXT_PUBLIC_COMFY_API_URL"
fi

# Set default values for critical Next.js environment variables if not provided
if [ -z "$NODE_ENV" ]; then
    export NODE_ENV="production"
    echo "📝 Set NODE_ENV to: $NODE_ENV"
fi

if [ -z "$PORT" ]; then
    export PORT=3001
    echo "📝 Set PORT to: $PORT"
fi

if [ -z "$HOSTNAME" ]; then
    export HOSTNAME="0.0.0.0"
    echo "📝 Set HOSTNAME to: $HOSTNAME"
fi

# Disable Next.js telemetry in production
export NEXT_TELEMETRY_DISABLED=1

echo "🎯 Starting Next.js application..."
echo "📊 Environment: $NODE_ENV"
echo "🌐 Listening on: $HOSTNAME:$PORT"

# Execute the main command (typically "node server.js" for Next.js standalone)
exec "$@"