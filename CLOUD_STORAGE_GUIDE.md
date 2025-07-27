# Cloud Storage Integration Guide

This guide explains how to integrate AWS S3 and database storage with your English Talking Agent application.

## Overview

The application now supports both local storage (original) and cloud storage:

- **Audio Files**: Stored in AWS S3 with signed URLs for secure access
- **Conversation Data**: Stored in MongoDB or PostgreSQL
- **Fallback**: Gracefully falls back to local storage if cloud services are unavailable

## Prerequisites

### AWS S3 Setup

1. **Create an S3 Bucket**:
   ```bash
   aws s3 mb s3://your-english-app-bucket --region us-east-1
   ```

2. **Configure CORS** (for browser uploads):
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
       "ExposeHeaders": []
     }
   ]
   ```

3. **Create IAM User** with S3 permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::your-english-app-bucket",
           "arn:aws:s3:::your-english-app-bucket/*"
         ]
       }
     ]
   }
   ```

### Database Setup

Choose one of the following:

#### Option 1: MongoDB
```bash
# Install MongoDB locally
# Or use MongoDB Atlas (cloud)

# Connection string example:
mongodb://localhost:27017/english-talking-agent
# or
mongodb+srv://user:password@cluster.mongodb.net/english-talking-agent
```

#### Option 2: PostgreSQL
```bash
# Install PostgreSQL locally
# Or use services like Supabase, Railway, or AWS RDS

# Connection string example:
postgresql://username:password@localhost:5432/english_talking_agent
```

## Configuration

### Environment Variables

Create a `.env.local` file in your project root:

```env
# OpenAI API (required)
OPENAI_API_KEY=your_openai_api_key

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-english-app-bucket

# Database Configuration (choose one)
# Option 1: MongoDB
MONGODB_URI=mongodb://localhost:27017/english-talking-agent

# Option 2: PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/english_talking_agent?schema=public"

# Feature Flags
NEXT_PUBLIC_USE_CLOUD_STORAGE=true
DATABASE_TYPE=mongodb # or postgresql
```

### Database Setup

#### For PostgreSQL (using Prisma):
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Open Prisma Studio
npx prisma studio
```

#### For MongoDB:
No additional setup needed. Collections will be created automatically.

## Installation & Setup

1. **Install Dependencies** (already done):
   ```bash
   npm install aws-sdk @aws-sdk/client-s3 @aws-sdk/s3-request-presigner mongodb mongoose prisma @prisma/client
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and fill in your values.

3. **Test Configuration**:
   Navigate to `/admin` in your application to test the configuration.

4. **Migrate Existing Data** (optional):
   Use the admin panel to migrate existing localStorage conversations to cloud storage.

## Usage

### Automatic Cloud Storage

Once configured, the application will automatically:

1. **Save audio files** to S3 when users record or AI generates speech
2. **Store conversation data** in your chosen database
3. **Generate signed URLs** for secure audio playback
4. **Fall back to local storage** if cloud services are unavailable

### Manual Operations

#### Save Conversation
```typescript
import { UnifiedStorageService } from '@/lib/unified-storage-service'

await UnifiedStorageService.saveConversation(conversationData)
```

#### Get Conversation History
```typescript
const conversations = await UnifiedStorageService.getConversationHistory()
```

#### Get Audio URL
```typescript
const audioUrl = await UnifiedStorageService.getAudioUrl(s3Key)
```

## API Endpoints

### Conversations
- `POST /api/conversations` - Save conversation
- `GET /api/conversations` - Get conversation history
- `GET /api/conversations?id=<id>` - Get specific conversation
- `DELETE /api/conversations?id=<id>` - Delete conversation

### Audio
- `GET /api/audio?key=<s3Key>` - Get signed URL for audio file

### Migration
- `POST /api/migration` - Migration utilities
  - `{ action: 'verify' }` - Check configuration
  - `{ action: 'test' }` - Test cloud storage
  - `{ action: 'migrate' }` - Migrate local data to cloud

## Architecture

### Storage Flow

1. **User records audio** → Blob → S3 upload → S3 key stored in database
2. **AI generates speech** → TTS API → S3 upload → Signed URL returned
3. **Conversation data** → Database (MongoDB/PostgreSQL)
4. **Audio playback** → Generate signed URL from S3 key

### Fallback Strategy

```
Cloud Storage Available? 
├── Yes → Use S3 + Database
└── No → Use Local Storage
```

### Security

- **Audio files**: Private S3 bucket with signed URLs (1-hour expiry)
- **API endpoints**: Server-side only, no direct S3 access from client
- **Database**: Standard database security practices

## Monitoring & Maintenance

### S3 Costs
- Monitor S3 usage and costs via AWS Console
- Consider lifecycle policies for old audio files
- Typical usage: ~1MB per minute of conversation

### Database
- Monitor database size and performance
- Consider data retention policies for old conversations
- Backup database regularly

### Troubleshooting

1. **Configuration Issues**: Use `/admin` panel to verify setup
2. **S3 Access Issues**: Check IAM permissions and bucket CORS
3. **Database Connection**: Verify connection strings and network access
4. **Fallback Behavior**: Check browser console for error messages

## Production Deployment

### Environment Variables
Ensure all environment variables are set in your production environment.

### Database Migrations
For PostgreSQL, run migrations in production:
```bash
npx prisma migrate deploy
```

### S3 Bucket Security
- Enable versioning for backup
- Configure bucket notifications for monitoring
- Set up CloudWatch alarms for unusual activity

### Performance Optimization
- Use CloudFront CDN for S3 (optional)
- Enable database connection pooling
- Monitor API response times

## Cost Estimation

### AWS S3
- Storage: ~$0.023/GB/month
- Requests: ~$0.0004/1000 requests
- Data transfer: First 1GB free/month

### Database
- MongoDB Atlas: Starting at $9/month
- PostgreSQL (managed): $7-20/month depending on provider

### Example Monthly Cost (1000 conversations, 10 minutes each)
- S3 Storage: ~$0.25
- S3 Requests: ~$0.10
- Database: $7-20
- **Total: ~$7-21/month**
