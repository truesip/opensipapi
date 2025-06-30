# OpenSIP Voice API - Complete Installation & Setup Guide

This comprehensive guide will walk you through setting up the OpenSIP Voice API server from scratch, including all prerequisites, configuration, and deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Installation](#detailed-installation)
4. [Configuration](#configuration)
5. [Deployment](#deployment)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)
8. [Production Deployment](#production-deployment)

## Prerequisites

### System Requirements

- **Operating System**: Linux, macOS, or Windows with WSL2
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: Minimum 5GB free space
- **Network**: Internet connection for API services

### Required Software

1. **Docker & Docker Compose**
   - Docker 20.10+
   - Docker Compose 2.0+

2. **Git** (for cloning the repository)

3. **Text Editor** (VS Code, nano, vim, etc.)

### Required Services & API Keys

1. **Google Cloud Text-to-Speech API Key**
2. **SIP Provider Account** (Twilio, Vonage, Bandwidth, etc.)
3. **MongoDB** (included in Docker setup)

## Quick Start

If you want to get up and running quickly:

```bash
# 1. Clone the repository
git clone https://github.com/your-username/opensipapi.git
cd opensipapi

# 2. Set environment variables
export API_KEY="your-strong-api-key-here"
export GOOGLE_API_KEY="your-google-api-key-here"
export SIP_PROVIDER_HOST="sip.yourprovider.com"
export SIP_USERNAME="your_sip_username"
export SIP_PASSWORD="your_sip_password"

# 3. Deploy
chmod +x deploy.sh
./deploy.sh

# 4. Test
curl http://localhost:3000/health
```

## Detailed Installation

### Step 1: Install Docker

#### On Ubuntu/Debian:
```bash
# Update package list
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker-compose --version
```

#### On CentOS/RHEL:
```bash
# Install Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

#### On macOS:
```bash
# Install Docker Desktop from https://www.docker.com/products/docker-desktop
# Or using Homebrew:
brew install --cask docker

# Start Docker Desktop application
```

#### On Windows:
1. Install Docker Desktop from https://www.docker.com/products/docker-desktop
2. Enable WSL2 integration
3. Restart system if required

### Step 2: Clone the Repository

```bash
# Clone from GitHub (replace with your repository URL)
git clone https://github.com/your-username/opensipapi.git
cd opensipapi

# Or if starting from scratch, create the directory structure
mkdir opensipapi
cd opensipapi
```

### Step 3: Get Required API Keys

#### Google Cloud Text-to-Speech API Key

1. **Create Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable the Text-to-Speech API

2. **Create API Key**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key
   - Optionally restrict the key to Text-to-Speech API

#### SIP Provider Setup

Choose one of these providers:

##### Option A: Twilio
1. Sign up at [twilio.com](https://www.twilio.com)
2. Get your Account SID and Auth Token
3. Purchase a phone number
4. SIP settings:
   - Host: `sip.twilio.com`
   - Username: Your Account SID
   - Password: Your Auth Token

##### Option B: Vonage (Nexmo)
1. Sign up at [vonage.com](https://www.vonage.com)
2. Get API Key and Secret
3. SIP settings:
   - Host: `sip.nexmo.com`
   - Username: Your API Key
   - Password: Your API Secret

##### Option C: Bandwidth
1. Sign up at [bandwidth.com](https://www.bandwidth.com)
2. Get account credentials
3. SIP settings provided by Bandwidth

## Configuration

### Step 1: Environment Variables

Create your environment configuration:

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file
nano .env
```

Configure the following variables:

```bash
# API Configuration
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://mongo:27017/voiceapi

# Authentication
API_KEY=your-very-strong-api-key-at-least-32-characters-long

# Google Text-to-Speech
GOOGLE_API_KEY=AIzaSyC-your-google-api-key-here

# SIP Provider Configuration
SIP_PROVIDER_HOST=sip.yourprovider.com
SIP_PROVIDER_PORT=5060
SIP_USERNAME=your_sip_username
SIP_PASSWORD=your_sip_password
```

### Step 2: OpenSIPS Configuration

Update the OpenSIPS configuration with your SIP provider details:

```bash
# Edit the OpenSIPS configuration
nano config/opensips/opensips-pstn.cfg
```

Update these lines with your actual provider details:

```
define PSTN_GATEWAY "sip.yourprovider.com:5060"
define PSTN_USERNAME "your_username"
define PSTN_PASSWORD "your_password"
```

### Step 3: Security Configuration

Generate a strong API key:

```bash
# Generate a random API key
openssl rand -hex 32

# Or use Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Deployment

### Method 1: Automated Deployment (Recommended)

```bash
# Set your environment variables
export API_KEY="your-generated-api-key"
export GOOGLE_API_KEY="your-google-api-key"
export SIP_PROVIDER_HOST="sip.yourprovider.com"
export SIP_USERNAME="your_sip_username"
export SIP_PASSWORD="your_sip_password"

# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### Method 2: Manual Deployment

```bash
# 1. Create .env file manually
cat > .env << EOF
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://mongo:27017/voiceapi
API_KEY=your-generated-api-key
GOOGLE_API_KEY=your-google-api-key
SIP_PROVIDER_HOST=sip.yourprovider.com
SIP_PROVIDER_PORT=5060
SIP_USERNAME=your_sip_username
SIP_PASSWORD=your_sip_password
EOF

# 2. Build and start services
docker-compose up -d --build

# 3. Check status
docker-compose ps

# 4. View logs
docker-compose logs -f
```

### Method 3: Development Deployment

```bash
# Install Node.js dependencies
npm install

# Start MongoDB manually (or use existing instance)
docker run -d --name mongo -p 27017:27017 mongo:6.0

# Start the application in development mode
npm run dev
```

## Testing

### Step 1: Health Check

```bash
# Test API health
curl http://localhost:3000/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

### Step 2: API Information

```bash
# Get API information
curl http://localhost:3000/api/auth/info

# Expected response:
{
  "name": "OpenSIP Voice API",
  "version": "1.0.0",
  "description": "API for voice calls with TTS integration",
  "authentication": "API Key required in X-API-Key header or Authorization: Bearer <api_key>",
  "endpoints": { ... }
}
```

### Step 3: API Key Validation

```bash
# Test API key authentication
curl -H "X-API-Key: your-api-key" http://localhost:3000/api/auth/validate

# Expected response:
{
  "success": true,
  "message": "API key is valid",
  "apiKey": "your-api..."
}
```

### Step 4: Text-to-Speech Test

```bash
# Test TTS functionality
curl -X POST http://localhost:3000/api/tts/synthesize \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, this is a test of the text to speech system.",
    "audioFormat": "MP3"
  }'

# Expected response:
{
  "success": true,
  "filename": "audio_1234567890.mp3",
  "path": "/usr/src/app/uploads/audio_1234567890.mp3"
}
```

### Step 5: Outbound Call Test

```bash
# Test outbound call (replace with real numbers)
curl -X POST http://localhost:3000/api/calls/initiate \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "fromNumber": "+1234567890",
    "toNumber": "+1987654321",
    "text": "Hello, this is a test call from the OpenSIP Voice API."
  }'

# Expected response:
{
  "success": true,
  "message": "Call initiated successfully to PSTN number",
  "callId": "507f1f77bcf86cd799439011",
  "callType": "PSTN",
  "opensipsId": "dialog_id_123",
  "audioFile": "tts_1234567890.mp3"
}
```

## Troubleshooting

### Common Issues

#### 1. Docker Issues

**Problem**: "Cannot connect to the Docker daemon"
```bash
# Solution: Start Docker service
sudo systemctl start docker

# Or on macOS/Windows: Start Docker Desktop
```

**Problem**: "Permission denied"
```bash
# Solution: Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

#### 2. API Issues

**Problem**: "API key is required"
```bash
# Solution: Check API key format
curl -H "X-API-Key: your-actual-api-key" http://localhost:3000/api/auth/validate
```

**Problem**: "Google API Error"
```bash
# Solution: Verify Google API key
curl "https://texttospeech.googleapis.com/v1/voices?key=YOUR_API_KEY"
```

#### 3. SIP Issues

**Problem**: "Call failed"
```bash
# Solution: Check SIP provider settings
docker-compose logs opensips

# Verify SIP connectivity
telnet sip.yourprovider.com 5060
```

#### 4. Database Issues

**Problem**: "MongoDB connection error"
```bash
# Solution: Check MongoDB status
docker-compose ps mongo
docker-compose logs mongo

# Restart MongoDB
docker-compose restart mongo
```

### Debug Commands

```bash
# Check all service status
docker-compose ps

# View application logs
docker-compose logs api

# View OpenSIPS logs
docker-compose logs opensips

# View MongoDB logs
docker-compose logs mongo

# Check disk space
df -h

# Check memory usage
free -h

# Check network connectivity
curl -I http://localhost:3000/health
```

### Performance Monitoring

```bash
# Monitor container resources
docker stats

# Check API response time
time curl http://localhost:3000/health

# Monitor call logs
tail -f docker-compose logs api | grep "Call"
```

## Production Deployment

### Security Hardening

1. **Firewall Configuration**:
```bash
# Allow only necessary ports
sudo ufw allow 22     # SSH
sudo ufw allow 3000   # API
sudo ufw allow 5060   # SIP
sudo ufw enable
```

2. **SSL/TLS Setup**:
```bash
# Install Nginx for SSL termination
sudo apt install nginx certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Configure Nginx proxy (create /etc/nginx/sites-available/opensip-api)
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

3. **Rate Limiting**:
```bash
# Add to docker-compose.yml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

### Monitoring Setup

1. **Health Monitoring**:
```bash
# Create health check script
cat > health-check.sh << 'EOF'
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)
if [ "$response" != "200" ]; then
    echo "API health check failed: $response"
    docker-compose restart api
fi
EOF

chmod +x health-check.sh

# Add to crontab
echo "*/5 * * * * /path/to/health-check.sh" | crontab -
```

2. **Log Rotation**:
```bash
# Configure log rotation
sudo nano /etc/logrotate.d/opensip-api

# Add configuration:
/var/log/opensip-api/*.log {
    daily
    rotate 30
    compress
    delaycompress
    create 644 root root
    postrotate
        docker-compose restart api
    endscript
}
```

### Backup Strategy

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/opensip-api"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MongoDB
docker exec opensipapi_mongo_1 mongodump --out /backup/mongo_$DATE

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz uploads/

# Backup configuration
tar -czf $BACKUP_DIR/config_$DATE.tar.gz config/ .env

echo "Backup completed: $DATE"
EOF

chmod +x backup.sh

# Schedule daily backups
echo "0 2 * * * /path/to/backup.sh" | crontab -
```

### Scaling Considerations

1. **Load Balancing**:
```yaml
# docker-compose-prod.yml
version: '3.8'
services:
  api:
    build: .
    deploy:
      replicas: 3
    depends_on:
      - mongo
      - opensips
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - api
```

2. **Database Scaling**:
```yaml
  mongo:
    image: mongo:6.0
    command: mongod --replSet rs0
    deploy:
      replicas: 3
```

### Maintenance

```bash
# Regular maintenance script
cat > maintenance.sh << 'EOF'
#!/bin/bash

# Update containers
docker-compose pull
docker-compose up -d

# Clean up old images
docker image prune -f

# Clean up old uploads (older than 30 days)
find uploads/ -type f -mtime +30 -delete

# Check disk space
df -h

# Check service health
curl -f http://localhost:3000/health || echo "Health check failed"

echo "Maintenance completed: $(date)"
EOF

chmod +x maintenance.sh

# Schedule weekly maintenance
echo "0 3 * * 0 /path/to/maintenance.sh" | crontab -
```

## Support & Documentation

- **API Documentation**: Check `/api/auth/info` endpoint
- **PSTN Guide**: See `PSTN-CALLING-GUIDE.md`
- **Logs**: Use `docker-compose logs` for debugging
- **Health Check**: Monitor `/health` endpoint

## Conclusion

Your OpenSIP Voice API server is now ready for production use. The system provides:

- ✅ Outbound PSTN calling
- ✅ Text-to-Speech integration
- ✅ Call management and tracking
- ✅ Enterprise-grade security
- ✅ Docker-based deployment
- ✅ Comprehensive monitoring

For additional support or customization, refer to the individual component documentation or contact your system administrator.
