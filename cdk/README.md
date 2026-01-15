# ArchiEase CDK Deployment Guide

This guide covers deploying the ArchiEase application to AWS using CDK.

## Architecture Overview

| Stack | Description |
|-------|-------------|
| **SesStack** | AWS SES for email sending with SMTP credentials |
| **NetworkStack** | VPC, subnets, and security groups |
| **DatabaseStack** | RDS MySQL database |
| **BackendStack** | EC2 instance with Elastic IP running Docker containers |
| **FrontendStack** | S3 bucket + CloudFront distribution for React app |

## Prerequisites

- **AWS CLI** - Configured with your credentials
- **Node.js** - v18 or later
- **Docker** - Installed and running
- **AWS Account** - With appropriate permissions

## Deployment Steps

### Step 1: Configure AWS CLI

```bash
aws configure
```

Enter:
- AWS Access Key ID
- AWS Secret Access Key
- Default region: `us-east-1`
- Default output format: `json`

Verify your configuration:

```bash
aws sts get-caller-identity
```

Note your **Account ID** from the output - you'll need it later.

---

### Step 2: Install CDK Dependencies

```bash
cd cdk
npm install
```

---

### Step 3: Bootstrap CDK (First-time only)

CDK bootstrap creates the necessary resources (S3 bucket, ECR repository) for CDK deployments:

```bash
npx cdk bootstrap aws://YOUR_ACCOUNT_ID/us-east-1
```

Replace `YOUR_ACCOUNT_ID` with your actual AWS account ID.

---

### Step 4: Build and Push Docker Image

The backend runs as a Docker container on EC2. You must build and push the image to ECR before deploying.

> **Important Notes:**
> - The Dockerfile builds for **Linux AMD64** architecture (compatible with AWS EC2 T3 instances)
> - The build uses the **Dockerfile** directly (NOT docker-compose.yml or docker-compose.prod.yml)
> - Docker Compose files are only for local development/testing
> - The Dockerfile builds the JAR using Gradle, then creates a runtime image

```bash
# Navigate to project root
cd ..

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build the Docker image for Linux AMD64 (even on Apple Silicon Macs)
docker build --platform linux/amd64 -t archiease-backend .

# Tag for ECR
docker tag archiease-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/cdk-hnb659fds-container-assets-YOUR_ACCOUNT_ID-us-east-1:latest

# Push to ECR
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/cdk-hnb659fds-container-assets-YOUR_ACCOUNT_ID-us-east-1:latest
```

> **Note:** Replace `YOUR_ACCOUNT_ID` with your actual AWS account ID in all commands.

**What happens during the build:**
1. **Stage 1 (Builder):** Compiles Java code and builds JAR using Gradle 8.13 + JDK 21
2. **Stage 2 (Runtime):** Creates minimal runtime image with JRE 21 Alpine
3. **Platform:** Both stages use `--platform=linux/amd64` for EC2 compatibility

---

### Step 5: Build Frontend

The frontend must be built before deployment as CDK deploys from `frontend/build`:

```bash
cd frontend
npm install
npm run build
cd ..
```

---

### Step 6: Update Backend Stack (If Using Different Account)

If you're deploying to a different AWS account, update the ECR repository reference in `cdk/lib/backend-stack.ts`:

```typescript
// Line 60 - Update the account ID
const repository = ecr.Repository.fromRepositoryName(
  this, 
  'AppRepository', 
  'cdk-hnb659fds-container-assets-YOUR_ACCOUNT_ID-us-east-1'
);
```

---

### Step 7: Deploy All Stacks

```bash
cd cdk

# Compile TypeScript
npm run build

# Deploy all stacks
npx cdk deploy --all --require-approval never
```

Or deploy stacks individually (in dependency order):

```bash
npx cdk deploy SesStack
npx cdk deploy NetworkStack
npx cdk deploy DatabaseStack
npx cdk deploy BackendStack
npx cdk deploy FrontendStack
```

---

## Quick Deploy Script

For convenience, here's a complete deployment script:

```bash
#!/bin/bash
set -e

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION="us-east-1"

echo "Deploying to Account: $ACCOUNT_ID in Region: $REGION"

# Build and push Docker image
echo "Building Docker image for Linux AMD64..."
docker build --platform linux/amd64 -t archiease-backend .

echo "Logging into ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

echo "Tagging and pushing image..."
docker tag archiease-backend:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/cdk-hnb659fds-container-assets-$ACCOUNT_ID-$REGION:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/cdk-hnb659fds-container-assets-$ACCOUNT_ID-$REGION:latest

# Build frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Deploy CDK stacks
echo "Deploying CDK stacks..."
cd cdk
npm install
npm run build
npx cdk deploy --all --require-approval never

echo "Deployment complete!"
```

---

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run watch` | Watch for changes and compile |
| `npx cdk deploy` | Deploy this stack to your AWS account |
| `npx cdk diff` | Compare deployed stack with current state |
| `npx cdk synth` | Emit the synthesized CloudFormation template |
| `npx cdk destroy --all` | Destroy all stacks |

---

## Post-Deployment

After successful deployment, CDK will output:

- **CloudFront Distribution URL** - Your frontend URL
- **ALB DNS Name** - Backend API endpoint (proxied through CloudFront at `/api/*`)

### Verify Deployment

1. Access the CloudFront URL in your browser
2. Check EC2 instances are running and healthy
3. Verify RDS database is available
4. Test API endpoints via CloudFront

---

## Troubleshooting

### Docker Build Fails
- Ensure Docker daemon is running
- Check you have enough disk space

### ECR Push Fails
- Verify AWS credentials are configured
- Ensure CDK bootstrap has been run
- Check ECR repository exists

### CDK Deploy Fails
- Run `npx cdk diff` to see pending changes
- Check CloudFormation console for detailed error messages
- Ensure all dependencies are deployed first

### Backend Health Check Fails
- SSH into EC2 instance via Session Manager
- Check Docker container logs: `docker logs $(docker ps -q)`
- Verify environment variables are set correctly

---

## Cleanup

To destroy all resources:

```bash
cd cdk
npx cdk destroy --all
```

> **Warning:** This will delete all resources including the database. Ensure you have backups if needed.
