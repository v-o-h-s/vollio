# CI/CD Setup Guide for Vollio Backend

This guide explains how to set up automated deployment for the Vollio backend using GitHub Actions.

## Architecture Overview

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  GitHub Push    │ ──▶ │ GitHub       │ ──▶ │ Docker Hub  │
│  (main branch)  │     │ Actions      │     │ (Image)     │
└─────────────────┘     └──────────────┘     └──────────────┘
                                                    │
                                                    ▼
                              ┌──────────────────────────────┐
                              │        VPS Server            │
                              │  ┌─────────┐   ┌─────────┐   │
                              │  │ Vollio  │   │  Redis  │   │
                              │  │ Server  │◀─▶│         │   │
                              │  └─────────┘   └─────────┘   │
                              └──────────────────────────────┘
```

## Prerequisites

1. Docker Hub account (or GitHub Container Registry)
2. VPS with Docker and Docker Compose installed
3. SSH access to your VPS

## Step 1: Configure GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add the following secrets:

| Secret Name          | Description                             | Example                                  |
| -------------------- | --------------------------------------- | ---------------------------------------- |
| `DOCKERHUB_USERNAME` | Your Docker Hub username                | `yourusername`                           |
| `DOCKERHUB_TOKEN`    | Docker Hub access token (not password!) | `dckr_pat_xxx...`                        |
| `VPS_HOST`           | Your VPS IP address or domain           | `123.456.789.0` or `api.vollio.xyz`      |
| `VPS_USERNAME`       | SSH username for VPS                    | `root` or `deploy`                       |
| `VPS_SSH_KEY`        | Private SSH key for VPS access          | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `VPS_SSH_PORT`       | SSH port (optional, defaults to 22)     | `22`                                     |
| `VPS_APP_DIR`        | App directory on VPS (optional)         | `/opt/vollio`                            |

### How to get Docker Hub Access Token

1. Go to [Docker Hub](https://hub.docker.com/)
2. Click your profile → **Account Settings** → **Security**
3. Click **New Access Token**
4. Give it a description (e.g., "GitHub Actions")
5. Copy the token (you won't see it again!)

### How to generate SSH key for deployment

```bash
# Generate a new SSH key specifically for deployment
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy

# Copy the public key to your VPS
ssh-copy-id -i ~/.ssh/github_deploy.pub user@your-vps-ip

# The PRIVATE key content goes into GitHub Secrets (VPS_SSH_KEY)
cat ~/.ssh/github_deploy
```

## Step 2: Prepare Your VPS

SSH into your VPS and set up the environment:

```bash
# Create app directory
sudo mkdir -p /opt/vollio
cd /opt/vollio

# Copy the production docker-compose file
# (You can SCP it or create manually)
nano docker-compose.prod.yml

# Create .env file with your production secrets
nano .env
```

### Example `.env` file for VPS:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# AI Services
OPENROUTER_API_KEY=your-openrouter-key
VOYAGE_API_KEY=your-voyage-key

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# API Configuration
API_URL=https://api.vollio.xyz
NODE_ENV=production

# Security
COOKIE_SECRET=your-super-secret-cookie-key
SESSION_SECRET=your-super-secret-session-key

# Docker image (for docker-compose)
DOCKERHUB_USERNAME=yourusername
```

## Step 3: Initial Deployment

For the first deployment, manually run:

```bash
cd /opt/vollio

# Pull and start containers
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f vollio-server
```

## Step 4: Test the Pipeline

1. Make a change to any file in `server/` directory
2. Commit and push to `main` branch
3. Go to GitHub → **Actions** tab to watch the pipeline
4. Check your VPS to verify the new container is running

## Workflow Triggers

The pipeline runs automatically when:

- Push to `main` branch that modifies:
  - `server/**` - Backend code changes
  - `packages/shared/**` - Shared package changes
  - `Dockerfile` - Docker configuration changes
  - `docker-compose.yml` - Compose configuration changes

You can also trigger manually from GitHub Actions → **Backend Deploy** → **Run workflow**

## Troubleshooting

### SSH Connection Issues

```bash
# Test SSH connection manually
ssh -i ~/.ssh/github_deploy user@your-vps-ip -p 22

# Check if key is added correctly on VPS
cat ~/.ssh/authorized_keys
```

### Docker Permission Issues

```bash
# Add your user to docker group
sudo usermod -aG docker $USER

# Re-login or run
newgrp docker
```

### Container Not Starting

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs vollio-server

# Check if port is available
sudo lsof -i :3000

# Restart containers
docker compose -f docker-compose.prod.yml restart
```

### Health Check Failing

```bash
# Test health endpoint directly
curl http://localhost:3000/health

# Check if Redis is running
docker compose -f docker-compose.prod.yml exec redis redis-cli ping
```

## Security Best Practices

1. **Never commit secrets** - Use environment variables and GitHub Secrets
2. **Use SSH keys** - Not passwords for VPS access
3. **Restrict Redis** - Only expose to localhost (`127.0.0.1:6379`)
4. **Use Docker Hub access tokens** - Not your password
5. **Keep images updated** - Enable Dependabot for security updates
6. **Use non-root user** - Create a deploy user with limited permissions

## Optional Enhancements

### Add Slack/Discord Notifications

```yaml
- name: Notify on Success
  if: success()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {"text": "✅ Backend deployed successfully!"}
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Add Rollback Capability

Tag images with git SHA so you can rollback:

```bash
# Rollback to specific version
docker pull youruser/vollio-server:abc123f
docker compose -f docker-compose.prod.yml up -d
```

### Add Database Migrations

```yaml
- name: Run Migrations
  uses: appleboy/ssh-action@v1.0.3
  with:
    host: ${{ secrets.VPS_HOST }}
    username: ${{ secrets.VPS_USERNAME }}
    key: ${{ secrets.VPS_SSH_KEY }}
    script: |
      docker compose exec vollio-server npm run migrate
```
