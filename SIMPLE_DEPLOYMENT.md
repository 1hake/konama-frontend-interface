# Simple Deployment Guide

## Overview

Simplified CI/CD setup that automatically builds and deploys your application when you push to the main branch.

## Required GitHub Secrets

Set these in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

```
DOCKER_USERNAME=your-docker-hub-username
DOCKER_PASSWORD=your-docker-hub-token
SERVER_HOST=your-server-ip
SERVER_USER=root
SSH_PRIVATE_KEY=your-ssh-private-key
```

## Server Setup

### 1. Initialize Docker Swarm

```bash
docker swarm init
docker network create --driver overlay webnet
```

### 2. Deploy Traefik (reverse proxy)

```bash
# Create traefik.yml
cat > traefik.yml << EOF
version: '3.8'
services:
  traefik:
    image: traefik:v3.0
    command:
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
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik-letsencrypt:/letsencrypt
    networks:
      - webnet
    deploy:
      placement:
        constraints: [node.role == manager]

volumes:
  traefik-letsencrypt:

networks:
  webnet:
    external: true
EOF

docker stack deploy -c traefik.yml traefik
```

### 3. Deploy your application

```bash
docker stack deploy -c docker-compose.swarm.yml champdavoine
```

## How it works

1. Push to `main` branch
2. GitHub Actions builds Docker image
3. Pushes image to Docker Hub as `thegobc/image-generation-admin:latest`
4. SSHs to your server and updates the service
5. Traefik automatically routes `champdavoine.com` to your app with HTTPS

## Manual deployment

```bash
# Update the service manually
docker service update --image thegobc/image-generation-admin:latest champdavoine_champdavoine

# Or redeploy the entire stack
docker stack deploy -c docker-compose.swarm.yml champdavoine
```

## Monitoring

```bash
# Check service status
docker service ls

# View logs
docker service logs champdavoine_champdavoine

# Scale the service
docker service scale champdavoine_champdavoine=2
```

That's it! No complex configuration needed.
