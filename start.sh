#!/bin/sh
set -e

echo "=== Starting Image Generation Admin ==="
echo "Node version: $(node --version)"
echo "Environment: ${NODE_ENV:-development}"
echo "Working directory: $(pwd)"
echo "Available files:"
ls -la

echo "=== Checking required files ==="
if [ ! -f "server.js" ]; then
    echo "ERROR: server.js not found!"
    ls -la
    exit 1
fi

if [ ! -d ".next" ]; then
    echo "ERROR: .next directory not found!"
    ls -la
    exit 1
fi

echo "=== Starting server ==="
exec node server.js