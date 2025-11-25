#!/bin/sh
set -e

# Docker Entrypoint Script for Image Generation Admin
# This script handles Docker Swarm secrets, environment validation, and nginx setup

# Configure the prefix for environment variables (can be overridden)
SECRET_PREFIX="${SECRET_PREFIX:-KONAMA_CLIENT_}"

echo "[ENTRYPOINT] Starting Image Generation Admin application..."
echo "[ENTRYPOINT] Using environment variable prefix: ${SECRET_PREFIX}"

# Function to load secrets from Docker Swarm secrets
load_secrets() {
    # Check if running in Docker Swarm with secrets
    if [ -d "/run/secrets" ]; then
        echo "[SECRETS] Loading Docker Swarm secrets..."
        
        # Load OpenAI API Key
        if [ -f "/run/secrets/konama_client_openai_api_key" ]; then
            export "${SECRET_PREFIX}OPENAI_API_KEY"=$(cat /run/secrets/konama_client_openai_api_key)
            # Also export without prefix for application compatibility
            export "OPENAI_API_KEY"=$(cat /run/secrets/konama_client_openai_api_key)
            echo "[SECRETS] ✓ OpenAI API key loaded from secret as ${SECRET_PREFIX}OPENAI_API_KEY and OPENAI_API_KEY"
        fi
        

    else
        echo "[SECRETS] No Docker Swarm secrets directory found, using environment variables"
    fi
}

# Function to validate required environment variables
validate_environment() {
    echo "[VALIDATION] Validating environment configuration..."
    
    # Check if required environment variables are set
    OPENAI_VAR="${SECRET_PREFIX}OPENAI_API_KEY"
    if eval "[ -n \"\$$OPENAI_VAR\" ]" && [ -n "$OPENAI_API_KEY" ]; then
        echo "[VALIDATION] ✓ OpenAI API key configured as $OPENAI_VAR and OPENAI_API_KEY"
    else
        echo "[VALIDATION] ⚠️  OpenAI API key not configured - some features may not work"
    fi
    
    # Add other validation as needed
    echo "[VALIDATION] Environment validation complete"
}

# Function to setup nginx for production
setup_nginx() {
    echo "[NGINX] Setting up nginx configuration..."
    
    # Ensure nginx directories exist with proper permissions
    mkdir -p /var/cache/nginx/client_temp
    mkdir -p /var/cache/nginx/proxy_temp  
    mkdir -p /var/cache/nginx/fastcgi_temp
    mkdir -p /var/cache/nginx/uwsgi_temp
    mkdir -p /var/cache/nginx/scgi_temp
    mkdir -p /var/run/nginx
    
    # Set proper ownership
    chown -R nginx:nginx /var/cache/nginx
    chown -R nginx:nginx /var/run/nginx
    chown -R nginx:nginx /usr/share/nginx/html
    
    # Create health check file if it doesn't exist
    mkdir -p /usr/share/nginx/html/health
    echo '<!DOCTYPE html><html><head><title>Health Check</title></head><body><h1>OK</h1><p>Application is running</p></body></html>' > /usr/share/nginx/html/health/index.html
    
    echo "[NGINX] ✓ Nginx setup complete"
}

# Function to display startup information
display_info() {
    echo "[INFO] =================================================="
    echo "[INFO] 🚀 Image Generation Admin"
    echo "[INFO] =================================================="
    echo "[INFO] Environment: ${NODE_ENV:-development}"
    echo "[INFO] Build Time: ${BUILDTIME:-unknown}"
    echo "[INFO] Version: ${VERSION:-unknown}"
    echo "[INFO] Revision: ${REVISION:-unknown}"
    echo "[INFO] =================================================="
}

# Main execution
main() {
    display_info
    load_secrets
    validate_environment
    setup_nginx
    
    echo "[STARTUP] Starting nginx..."
    echo "[STARTUP] Application ready! Health check available at /health"
    
    # Execute the passed command (usually nginx)
    exec "$@"
}

# Run main function with all arguments
main "$@"