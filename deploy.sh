#!/bin/bash

# Enterprise OpenSIP API Deployment Script

set -e

echo "🚀 Starting OpenSIP API deployment..."

# Check if required environment variables are set
required_vars=("API_KEY" "GOOGLE_API_KEY")

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Environment variable $var is not set"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Create .env file from environment variables
cat > .env << EOF
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://mongo:27017/voiceapi
API_KEY=${API_KEY}
GOOGLE_API_KEY=${GOOGLE_API_KEY}
EOF

echo "✅ Environment configuration created"

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Pull latest images
echo "📥 Pulling latest images..."
docker-compose pull

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check API health
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ API is healthy and running"
else
    echo "❌ API health check failed"
    docker-compose logs api
    exit 1
fi

echo "🎉 Deployment completed successfully!"
echo "📊 API is running at http://localhost:3000"
echo "📋 Health check: http://localhost:3000/health"
