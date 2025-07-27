# SpeakEasy

SpeakEasy is an AI-powered English language practice application designed to help users improve their speaking skills through interactive conversations.

## Features

- **AI Conversations**: Engage in dynamic conversations with an AI, tailored to various topics and difficulties.
- **Speaking Practice Mode**: Receive real-time feedback and corrections on pronunciation, grammar, and vocabulary.
- **Interview Simulation**: Prepare for job interviews with AI-generated questions and targeted feedback.
- **Conversation History**: Review past conversations and analysis results to track progress.
- **Text-to-Speech & Speech-to-Text**: Seamless voice interaction for a natural speaking experience.
- **Translation**: Translate messages to and from Vietnamese for better understanding.
- **Cloud Storage Integration**: Optional AWS S3 and database integration for scalable audio and conversation storage.

## Storage Options

### Local Storage (Default)
- Conversations stored in browser localStorage
- Audio files stored as blob URLs/base64
- No external dependencies

### Cloud Storage (Optional)
- **Audio Files**: Stored in AWS S3 with secure signed URLs
- **Conversation Data**: Stored in MongoDB or PostgreSQL
- **Benefits**: Scalable, persistent across devices, backup capabilities
- **Setup**: See [Cloud Storage Guide](./CLOUD_STORAGE_GUIDE.md) for detailed instructions

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- (Optional) AWS S3 account and MongoDB/PostgreSQL for cloud storage

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/your-username/speakeasy.git
   cd speakeasy
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`
3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your API keys:
   
   **Basic Setup (Local Storage Only):**
   \`\`\`env
   OPENAI_API_KEY=your_openai_api_key
   \`\`\`
   
   **Cloud Storage Setup (Optional):**
   \`\`\`env
   OPENAI_API_KEY=your_openai_api_key
   
   # AWS S3 Configuration
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=your-english-app-bucket
   
   # Database (choose one)
   MONGODB_URI=mongodb://localhost:27017/english-talking-agent
   # OR
   DATABASE_URL="postgresql://username:password@localhost:5432/english_talking_agent?schema=public"
   
   # Enable cloud storage
   NEXT_PUBLIC_USE_CLOUD_STORAGE=true
   \`\`\`

4. (Optional) Set up cloud storage:
   If you want to use cloud storage, follow the [Cloud Storage Guide](./CLOUD_STORAGE_GUIDE.md).

5. (Optional) Initialize database:
   For PostgreSQL with Prisma:
   \`\`\`bash
   npx prisma generate
   npx prisma db push
   \`\`\`

### Running the Application

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `app/`: Next.js App Router pages and API routes.
  - `api/`: API routes for AI interactions (generate-prompt, speech-to-text, text-to-speech, translate, analyze-conversation, chat, prepare-interview).
  - `history/`: Page for viewing conversation history.
  - `practice/`: Main practice page.
- `components/`: Reusable React components, including Shadcn UI components.
- `hooks/`: Custom React hooks for audio recording and speech recognition.
- `lib/`: Utility functions, including conversation storage.
- `public/`: Static assets.
- `styles/`: Global CSS.

## API Endpoints

### Core Features
- `/api/generate-prompt`: Generates conversation prompts.
- `/api/speech-to-text`: Converts speech audio to text.
- `/api/text-to-speech`: Converts text to speech audio (supports cloud storage).
- `/api/translate`: Translates text between languages.
- `/api/analyze-conversation`: Analyzes conversation for feedback.
- `/api/chat`: Handles AI chat interactions.
- `/api/prepare-interview`: Prepares interview context.
- `/api/generate-lesson-content`: Generates lesson content.

### Cloud Storage (Optional)
- `/api/conversations`: CRUD operations for conversation data.
- `/api/audio`: Generates signed URLs for audio files.
- `/api/migration`: Data migration utilities and configuration testing.

### Admin Panel
- `/admin`: Cloud storage configuration and data migration interface.

## Configuration

The application can be configured to use either:

1. **Local Storage Mode** (default): All data stored in browser localStorage
2. **Cloud Storage Mode**: Audio files in S3, conversation data in database

Use the admin panel at `/admin` to:
- Verify cloud storage configuration
- Test connections
- Migrate existing data from local to cloud storage

## Contributing

Feel free to fork this project, make improvements, and submit pull requests.

## License

This project is open-source and available under the [MIT License](LICENSE).
\`\`\`
