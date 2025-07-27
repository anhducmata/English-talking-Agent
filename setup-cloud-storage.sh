#!/bin/bash

# Cloud Storage Setup Script for English Talking Agent

echo "🎯 English Talking Agent - Cloud Storage Setup"
echo "============================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm not found. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your actual credentials"
else
    echo "✅ .env.local already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Choose database type
echo ""
echo "🗄️  Database Setup"
echo "Choose your database:"
echo "1) MongoDB"
echo "2) PostgreSQL"
echo "3) Skip database setup"
read -p "Enter your choice (1-3): " db_choice

case $db_choice in
    1)
        echo "🍃 MongoDB selected"
        echo "Please ensure MongoDB is running and update MONGODB_URI in .env.local"
        ;;
    2)
        echo "🐘 PostgreSQL selected"
        echo "🔧 Setting up Prisma..."
        npx prisma generate
        echo "⚠️  Please update DATABASE_URL in .env.local, then run: npx prisma db push"
        ;;
    3)
        echo "⏭️  Database setup skipped"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

# AWS S3 setup instructions
echo ""
echo "☁️  AWS S3 Setup Instructions"
echo "1. Create an S3 bucket in AWS console"
echo "2. Create an IAM user with S3 permissions"
echo "3. Update AWS credentials in .env.local"
echo "4. Visit /admin in your app to test the setup"

# Final instructions
echo ""
echo "🚀 Setup Complete!"
echo "================="
echo "Next steps:"
echo "1. Edit .env.local with your credentials"
echo "2. Start the development server: npm run dev"
echo "3. Visit http://localhost:3000/admin to configure cloud storage"
echo "4. Test the configuration and migrate existing data if needed"
echo ""
echo "📚 For detailed instructions, see: CLOUD_STORAGE_GUIDE.md"
