#!/bin/bash

# Production build script for image-generation-admin
# This script optimizes the build process for faster deployment

set -e

echo "🚀 Starting optimized production build..."

# Set build variables
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
export NODE_ENV=production

# Build arguments
BUILD_TIME=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
VERSION=${1:-"1.0.0"}
REVISION=${CI_COMMIT_SHA:-$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")}

echo "📦 Building with:"
echo "  Version: $VERSION"
echo "  Revision: $REVISION"
echo "  Build Time: $BUILD_TIME"

# Build production image with optimizations
docker build \
  --platform linux/amd64 \
  --target production \
  --build-arg BUILDTIME="$BUILD_TIME" \
  --build-arg VERSION="$VERSION" \
  --build-arg REVISION="$REVISION" \
  --tag thegobc/image-generation-admin:$VERSION \
  --tag thegobc/image-generation-admin:latest \
  .

echo "✅ Production build completed successfully!"
echo "📊 Build time: $BUILD_TIME"
echo "🏷️  Tags created:"
echo "  - thegobc/image-generation-admin:$VERSION"
echo "  - thegobc/image-generation-admin:latest"

# Optional: Push to registry
if [ "$2" = "push" ]; then
  echo "📤 Pushing to registry..."
  docker push thegobc/image-generation-admin:$VERSION
  docker push thegobc/image-generation-admin:latest
  echo "✅ Successfully pushed to registry!"
fi

echo "🎉 Build process completed!"