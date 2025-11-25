# CI/CD Deployment Guide

This guide covers the enhanced CI/CD pipeline for the Image Generation Admin application, inspired by the mlmh-shop project's deployment practices.

## Overview

The CI/CD pipeline now includes:
- **Automated testing** on pull requests and main branch
- **Multi-stage builds** with caching
- **Security scanning** and linting
- **Docker Swarm deployment** with secrets management
- **Health checks** and monitoring
- **Staged deployments** (staging and production)

## Required GitHub Secrets

Set these secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

### Docker Registry
```
DOCKER_USERNAME=your-docker-hub-username
DOCKER_PASSWORD=your-docker-hub-password-or-token
```

### Server Access
```
SERVER_HOST=your-server-ip-or-domain
SERVER_USER=root
SSH_PRIVATE_KEY=your-ssh-private-key
```

## Server Setup

### 1. Docker Swarm Initialization

```bash
# Initialize Docker Swarm
docker swarm init

# Create external network for Traefik
docker network create --driver overlay webnet
```

### 2. Create Docker Secrets

```bash
# Create secrets for production environment
echo "your-openai-api-key" | docker secret create image_gen_openai_api_key -
```

### 3. Setup Traefik (Reverse Proxy)

Create `traefik.yml`:
```yaml
version: '3.8'

services:
  traefik:
    image: traefik:v3.0
    command:
      - "--api.dashboard=true"
      - "--providers.docker.swarmMode=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.myresolver.acme.tlschallenge=true"
      - "--certificatesresolvers.myresolver.acme.email=your-email@domain.com"
      - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik-letsencrypt:/letsencrypt
    networks:
      - webnet
    deploy:
      replicas: 1
      placement:
        constraints: [node.role == manager]

volumes:
  traefik-letsencrypt:

networks:
  webnet:
    external: true
```

Deploy Traefik:
```bash
docker stack deploy -c traefik.yml traefik
```

## Deployment Process

### 1. Automatic Deployment (Recommended)

The CI/CD pipeline automatically:
1. Runs tests on every push/PR
2. Builds and pushes Docker images on main branch
3. Deploys to production server using Docker Swarm

### 2. Manual Deployment

```bash
# Pull latest image
docker pull thegobc/image-generation-admin:latest

# Deploy the stack
docker stack deploy -c docker-compose.swarm.yml image-generation-admin-stack

# Force update service with new image
docker service update --image thegobc/image-generation-admin:latest --force image-generation-admin-stack_image-generation-admin
```

## Configuration

### Environment Variables

Update `docker-compose.swarm.yml` with your domain:

```yaml
labels:
  - 'traefik.http.routers.image-generation-admin.rule=Host(`your-domain.com`)'
environment:
  NEXT_PUBLIC_API_URL: https://your-domain.com
```

### Resource Limits

The swarm configuration includes resource limits:
- Memory: 1GB limit, 512MB reservation  
- CPU: 0.5 cores limit, 0.25 cores reservation

Adjust these based on your server capacity.

## Monitoring and Health Checks

### Health Endpoints

- **Application Health**: `https://your-domain.com/health`
- **Traefik Dashboard**: `https://your-domain.com:8080` (if enabled)

### Service Status

```bash
# Check service status
docker service ls

# View service logs
docker service logs image-generation-admin-stack_image-generation-admin

# Check container health
docker service ps image-generation-admin-stack_image-generation-admin
```

### Scaling

```bash
# Scale service to multiple replicas
docker service scale image-generation-admin-stack_image-generation-admin=3
```

## Rollback Procedures

### Quick Rollback

```bash
# Rollback to previous version
docker service rollback image-generation-admin-stack_image-generation-admin
```

### Specific Version Rollback

```bash
# Deploy specific image version
docker service update --image thegobc/image-generation-admin:specific-tag image-generation-admin-stack_image-generation-admin
```

## Security Considerations

1. **Secrets Management**: All sensitive data stored in Docker Secrets
2. **Network Isolation**: Services run on isolated overlay network
3. **HTTPS Enforcement**: Automatic SSL certificates via Let's Encrypt
4. **Security Headers**: Enhanced nginx configuration with security headers
5. **Non-root User**: Services run with appropriate user permissions

## Troubleshooting

### Common Issues

1. **Service won't start**: Check logs with `docker service logs`
2. **Health check failing**: Verify `/health` endpoint manually
3. **Certificate issues**: Check Traefik logs for ACME challenges
4. **Image pull failures**: Verify Docker Hub credentials

### Debug Commands

```bash
# Access running container
docker exec -it $(docker ps -q --filter "name=image-generation-admin") sh

# View nginx logs
docker exec -it $(docker ps -q --filter "name=image-generation-admin") tail -f /var/log/nginx/access.log

# Test health endpoint
curl -f http://localhost/health
```

## Development vs Production

- **Development**: Uses `target: development` with hot reload
- **Production**: Uses `target: production` with nginx and static files
- **Staging**: Uses PR-specific tags for testing

## Performance Optimizations

1. **Multi-stage builds** reduce final image size
2. **Build caching** speeds up CI/CD pipeline  
3. **Gzip compression** reduces bandwidth usage
4. **Static asset caching** improves load times
5. **Health checks** enable zero-downtime deployments