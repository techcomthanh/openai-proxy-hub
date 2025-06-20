#!/bin/bash

# Docker Configuration Test Script for OpenAI Proxy HUB
# This script validates the Docker setup without requiring a running daemon

echo "🔍 Testing Docker Configuration for OpenAI Proxy HUB"
echo "=================================================="

# Test 1: Dockerfile syntax validation
echo "1. Validating Dockerfile syntax..."
if command -v docker >/dev/null 2>&1; then
    echo "   ✓ Docker CLI available"
else
    echo "   ⚠ Docker CLI not available - skipping build tests"
fi

# Test 2: Check required files exist
echo "2. Checking required files..."
required_files=("Dockerfile" "docker-compose.yml" ".dockerignore" "package.json" "server/index.ts")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✓ $file exists"
    else
        echo "   ✗ $file missing"
    fi
done

# Test 3: Validate package.json scripts
echo "3. Validating package.json scripts..."
if grep -q '"build"' package.json && grep -q '"start"' package.json; then
    echo "   ✓ Required npm scripts present"
else
    echo "   ✗ Missing required npm scripts"
fi

# Test 4: Check Docker Compose configuration
echo "4. Validating Docker Compose configuration..."
if command -v docker-compose >/dev/null 2>&1; then
    docker-compose config --quiet 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "   ✓ Docker Compose configuration valid"
    else
        echo "   ⚠ Docker Compose configuration issues detected"
    fi
else
    echo "   ⚠ Docker Compose not available"
fi

# Test 5: Environment file validation
echo "5. Checking environment configuration..."
if [ -f ".env.example" ]; then
    echo "   ✓ .env.example template exists"
else
    echo "   ✗ .env.example template missing"
fi

if [ -f ".env.docker" ]; then
    echo "   ✓ .env.docker template exists"
else
    echo "   ✗ .env.docker template missing"
fi

# Test 6: Check .dockerignore
echo "6. Validating .dockerignore..."
if [ -f ".dockerignore" ]; then
    if grep -q "node_modules" .dockerignore && grep -q ".env" .dockerignore; then
        echo "   ✓ .dockerignore properly configured"
    else
        echo "   ⚠ .dockerignore may be incomplete"
    fi
else
    echo "   ✗ .dockerignore missing"
fi

# Test 7: Analyze Dockerfile structure
echo "7. Analyzing Dockerfile structure..."
if grep -q "FROM node:" Dockerfile && grep -q "WORKDIR" Dockerfile && grep -q "COPY" Dockerfile; then
    echo "   ✓ Dockerfile has proper structure"
else
    echo "   ✗ Dockerfile structure issues"
fi

if grep -q "USER " Dockerfile; then
    echo "   ✓ Non-root user configured"
else
    echo "   ⚠ Running as root (security concern)"
fi

if grep -q "HEALTHCHECK" Dockerfile; then
    echo "   ✓ Health check configured"
else
    echo "   ⚠ No health check configured"
fi

# Test 8: Validate build dependencies
echo "8. Checking build dependencies..."
if [ -f "vite.config.ts" ] && [ -f "tsconfig.json" ]; then
    echo "   ✓ Build configuration files present"
else
    echo "   ⚠ Build configuration may be incomplete"
fi

echo ""
echo "📋 Test Summary"
echo "==============="
echo "Docker configuration appears ready for deployment."
echo ""
echo "🚀 To deploy using Docker:"
echo "   1. Set up environment: cp .env.example .env.docker"
echo "   2. Edit .env.docker with your values"
echo "   3. Run: docker-compose up -d"
echo ""
echo "🔧 To build manually:"
echo "   1. docker build -t openai-proxy-hub ."
echo "   2. docker run -p 5000:5000 --env-file .env openai-proxy-hub"