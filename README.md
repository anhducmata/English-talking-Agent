# SpeakEasy

SpeakEasy is an AI-powered English language practice application designed to help users improve their speaking skills through interactive conversations.

## Features

- **AI Conversations**: Engage in dynamic conversations with an AI, tailored to various topics and difficulties.
- **Speaking Practice Mode**: Receive real-time feedback and corrections on pronunciation, grammar, and vocabulary.
- **Interview Simulation**: Prepare for job interviews with AI-generated questions and targeted feedback.
- **Conversation History**: Review past conversations and analysis results to track progress.
- **Text-to-Speech & Speech-to-Text**: Seamless voice interaction for a natural speaking experience.
- **Translation**: Translate messages to and from Vietnamese for better understanding.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

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
   \`\`\`
   OPENAI_API_KEY=your_openai_api_key
   \`\`\`
   (Note: Other environment variables like `JWT_SECRET`, `BCRYPT_SALT_ROUNDS`, `POSTGRES_URL`, etc., are listed in the v0 environment but may not be directly used by this specific application's current features. `OPENAI_API_KEY` is crucial for AI functionalities.)

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

- `/api/generate-prompt`: Generates conversation prompts.
- `/api/speech-to-text`: Converts speech audio to text.
- `/api/text-to-speech`: Converts text to speech audio.
- `/api/translate`: Translates text between languages.
- `/api/analyze-conversation`: Analyzes conversation for feedback.
- `/api/chat`: Handles AI chat interactions.
- `/api/prepare-interview`: Prepares interview context.
- `/api/generate-lesson-content`: Generates lesson content.

## Contributing

Feel free to fork this project, make improvements, and submit pull requests.

## License

This project is open-source and available under the [MIT License](LICENSE).
\`\`\`
