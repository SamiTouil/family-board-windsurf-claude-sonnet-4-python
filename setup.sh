#!/bin/bash

# Family Task Planner Setup Script
echo "🚀 Setting up Family Task Planner..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please review and update the values as needed."
else
    echo "✅ .env file already exists."
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install E2E test dependencies
echo "🎭 Installing E2E test dependencies..."
cd e2e-tests
npm install
npx playwright install chromium
cd ..

# Build and start services
echo "🐳 Building and starting Docker services..."
docker compose up --build -d

# Wait for services to be ready with a simple loop
echo "⏳ Waiting for services to be ready..."

# Function to check if a URL is responding
check_url() {
    curl -f "$1" > /dev/null 2>&1
}

# Wait for frontend (max 2 minutes)
echo "Waiting for frontend..."
for i in {1..60}; do
    if check_url "http://localhost:3000"; then
        echo "✅ Frontend is ready!"
        break
    fi
    if [ $i -eq 60 ]; then
        echo "❌ Frontend service failed to start"
        docker compose logs frontend
        exit 1
    fi
    sleep 2
done

# Wait for backend (max 2 minutes)
echo "Waiting for backend..."
for i in {1..60}; do
    if check_url "http://localhost:8000/health"; then
        echo "✅ Backend is ready!"
        break
    fi
    if [ $i -eq 60 ]; then
        echo "❌ Backend service failed to start"
        docker compose logs backend
        exit 1
    fi
    sleep 2
done

echo ""
echo "🎉 Setup complete! Your Family Task Planner is ready."
echo ""
echo "📍 Access your application:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8000"
echo "   API Docs:  http://localhost:8000/docs"
echo "   Adminer:   http://localhost:8080"
echo ""
echo "🧪 To run tests:"
echo "   Backend:   cd backend && pytest tests/ -v"
echo "   Frontend:  cd frontend && npm test"
echo "   E2E:       cd e2e-tests && npm test"
echo "   CI Local:  act --container-daemon-socket -"
echo ""
echo "🛑 To stop services:"
echo "   docker compose down"
