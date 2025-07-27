# Cloud Storage Setup Script for English Talking Agent
# PowerShell version for Windows

Write-Host "🎯 English Talking Agent - Cloud Storage Setup" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

try {
    node --version | Out-Null
    Write-Host "✅ Node.js is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

try {
    npm --version | Out-Null
    Write-Host "✅ npm is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm first." -ForegroundColor Red
    exit 1
}

# Check if .env.local exists
if (-Not (Test-Path ".env.local")) {
    Write-Host "📝 Creating .env.local from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
    Write-Host "⚠️  Please edit .env.local with your actual credentials" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env.local already exists" -ForegroundColor Green
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Choose database type
Write-Host ""
Write-Host "🗄️  Database Setup" -ForegroundColor Cyan
Write-Host "Choose your database:"
Write-Host "1) MongoDB"
Write-Host "2) PostgreSQL"
Write-Host "3) Skip database setup"
$db_choice = Read-Host "Enter your choice (1-3)"

switch ($db_choice) {
    "1" {
        Write-Host "🍃 MongoDB selected" -ForegroundColor Green
        Write-Host "Please ensure MongoDB is running and update MONGODB_URI in .env.local" -ForegroundColor Yellow
    }
    "2" {
        Write-Host "🐘 PostgreSQL selected" -ForegroundColor Green
        Write-Host "🔧 Setting up Prisma..." -ForegroundColor Yellow
        npx prisma generate
        Write-Host "⚠️  Please update DATABASE_URL in .env.local, then run: npx prisma db push" -ForegroundColor Yellow
    }
    "3" {
        Write-Host "⏭️  Database setup skipped" -ForegroundColor Yellow
    }
    default {
        Write-Host "❌ Invalid choice" -ForegroundColor Red
        exit 1
    }
}

# AWS S3 setup instructions
Write-Host ""
Write-Host "☁️  AWS S3 Setup Instructions" -ForegroundColor Cyan
Write-Host "1. Create an S3 bucket in AWS console"
Write-Host "2. Create an IAM user with S3 permissions"
Write-Host "3. Update AWS credentials in .env.local"
Write-Host "4. Visit /admin in your app to test the setup"

# Final instructions
Write-Host ""
Write-Host "🚀 Setup Complete!" -ForegroundColor Green
Write-Host "================="
Write-Host "Next steps:"
Write-Host "1. Edit .env.local with your credentials"
Write-Host "2. Start the development server: npm run dev"
Write-Host "3. Visit http://localhost:3000/admin to configure cloud storage"
Write-Host "4. Test the configuration and migrate existing data if needed"
Write-Host ""
Write-Host "📚 For detailed instructions, see: CLOUD_STORAGE_GUIDE.md" -ForegroundColor Cyan
