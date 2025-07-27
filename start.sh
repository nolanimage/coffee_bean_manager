#!/bin/bash

echo "☕ Starting Coffee Bean Management System..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

echo "🐳 Starting services with Docker Compose..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."

# Check backend
if curl -s http://localhost:5001/api/health > /dev/null; then
    echo "✅ Backend API is running on http://localhost:5001"
else
    echo "❌ Backend API is not responding"
fi

# Check frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running on http://localhost:3000"
else
    echo "❌ Frontend is not responding"
fi

# Check Supabase Studio
if curl -s http://localhost:54324 > /dev/null; then
    echo "✅ Supabase Studio is running on http://localhost:54324"
else
    echo "❌ Supabase Studio is not responding"
fi

echo ""
echo "🎉 Coffee Bean Management System is ready!"
echo ""
echo "📱 Access your application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5001"
echo "   Supabase Studio: http://localhost:54324"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo "" 