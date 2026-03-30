# English Talking Agent

An AI-powered English speaking practice app for children, built with Next.js, OpenAI, content moderation, and kid-friendly guardrails.

The product is designed around short, playful voice conversations. Kids can jump into a quick chat, let the app generate a fun topic, or create their own guided practice session. The app also supports interview practice, lesson generation, post-session feedback, bilingual English/Vietnamese flows, and optional cloud storage.

## Highlights

- Real-time AI voice conversations for English speaking practice
- Kid-friendly modes such as quick chat, AI adventure, and custom topics
- Built-in English/Vietnamese support
- Conversation analysis with feedback on fluency, grammar, vocabulary, and pronunciation
- Optional AWS S3 + MongoDB/PostgreSQL storage
- Child-focused moderation and prompt guardrails

## Screenshots

<p align="center">
  <img src="https://github.com/user-attachments/assets/b511d7c3-e1d4-4df5-b50d-dd1ffae4352c" alt="Topic selection screen" width="700" />
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/53cbde81-f86a-493d-a3c2-65130be9be5a" alt="Practice experience screen" width="700" />
</p>

## Core Experience

### Practice modes

- **Quick Chat**: Start fast with a preset kid-safe topic
- **AI Adventure**: Let the app generate a playful conversation theme
- **My Own Topic**: Build a custom conversation with topic, goal, rules, and expectations
- **Interview Prep**: Generate interview context and questions for structured practice
- **Lesson Builder**: Generate AI-assisted lesson content

### Voice workflow

1. The learner chooses a mode and topic
2. Audio is captured in the browser
3. Speech is transcribed with OpenAI
4. The app sends conversation context to the chat endpoint
5. The AI response is moderated and returned
6. Text-to-speech turns the reply into audio
7. A session summary can be generated at the end

## Architecture

```mermaid
flowchart TD
    A[Next.js App Router UI] --> B[Client Hooks and Components]
    B --> C[API Routes]
    C --> D[OpenAI Chat and Realtime APIs]
    C --> E[Speech-to-Text and Text-to-Speech]
    C --> F[Translation and Analysis]
    C --> G[Guardrails and Moderation]
    C --> H[Storage Layer]
    H --> I[Browser localStorage]
    H --> J[AWS S3]
    H --> K[MongoDB or PostgreSQL]
```

### Frontend

- **Home page** (`app/page.tsx`)
  - language toggle
  - practice mode selection
  - AI adventure launch flow
- **Practice page** (`app/practice/page.tsx`)
  - voice conversation experience
  - playback and recording controls
  - timer, history, and analysis
- **Admin page** (`app/admin/page.tsx`)
  - cloud storage configuration checks
  - migration and connectivity testing

### Backend

The app uses Next.js API routes under `app/api`:

- `chat`: conversation generation
- `generate-prompt`: prompt creation for sessions
- `generate-conversation-content`: topic, goal, rules, and expectations generation
- `generate-lesson-content`: lesson creation
- `prepare-interview`: interview setup
- `speech-to-text`: audio transcription
- `text-to-speech`: response audio generation
- `translate`: English/Vietnamese translation
- `analyze-conversation`: end-of-session feedback
- `realtime/session`: ephemeral token generation for realtime voice sessions
- `audio`: signed audio URL access
- `migration`: cloud setup verification and migration utilities

### Storage model

#### Local-first mode

By default, the app works without external storage:

- conversations are stored in browser localStorage
- audio is handled locally in the browser flow
- useful for quick local development and demos

#### Optional cloud mode

When cloud storage is enabled:

- **AWS S3** stores generated audio files
- **MongoDB** or **PostgreSQL with Prisma** stores conversation data
- the app uses a unified storage layer to fall back gracefully when cloud services are unavailable

Related files:

- `lib/unified-storage-service.ts`
- `lib/conversation-storage.ts`
- `lib/s3-service.ts`
- `lib/cloud-storage-service.ts`
- `lib/mongodb-service.ts`
- `lib/prisma-service.ts`

## Guardrails

This app is built for children, so safety is part of the runtime architecture, not just the UI.

### What is enforced

- input moderation for learner messages
- output moderation for AI responses
- child-safe system prompt wrapping
- blocked word filtering in English and Vietnamese
- safe topic redirection when a message is not appropriate
- stricter thresholds for categories such as sexual content, violence, hate, and self-harm

### Guardrail flow

1. User text is checked against blocked-word lists
2. The content moderation layer evaluates the message
3. Unsafe content is replaced with a safe redirect
4. Child-safe instructions are injected into system prompts
5. AI responses are moderated before being shown or spoken back

### Key files

- `lib/guardrails.ts`
- `lib/content-moderation.ts`
- `lib/constants/blocked-words.ts`
- `app/api/realtime/session/route.ts`

### Current guardrail behavior

- strict mode is enabled by default
- logging is available for blocked attempts
- unsafe user prompts are redirected to safe kid-friendly topics
- unsafe AI output is replaced with a safe fallback response

## Tech Stack

- **Framework**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI, shadcn/ui
- **AI**: OpenAI chat, moderation, speech-to-text, text-to-speech, realtime voice
- **Storage**: localStorage, AWS S3, MongoDB, PostgreSQL, Prisma

## Repository Structure

```text
app/
  admin/                 Admin tools for storage setup and migration
  api/                   Server routes for chat, audio, analysis, translation, and realtime
  practice/              Main speaking practice experience
components/              UI building blocks and modal flows
hooks/                   Audio, speech, API, and realtime client hooks
lib/                     Storage, moderation, guardrails, and shared services
prompts/                 Prompt templates for conversations, lessons, and interviews
prisma/                  Prisma schema for PostgreSQL storage
public/                  Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- OpenAI API key

Optional for cloud mode:

- AWS S3 bucket
- MongoDB or PostgreSQL database

### Installation

```bash
git clone https://github.com/anhducmata/English-talking-Agent.git
cd English-talking-Agent
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

### Minimum environment variables

```env
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Optional cloud configuration

```env
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-english-app-bucket

MONGODB_URI=mongodb://localhost:27017/english-talking-agent
# or
DATABASE_URL="postgresql://username:password@localhost:5432/english_talking_agent?schema=public"

NEXT_PUBLIC_USE_CLOUD_STORAGE=true
```

### Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Available Scripts

- `npm run dev` - start the development server
- `npm run build` - create a production build
- `npm run start` - start the production server
- `npm run lint` - run the Next.js lint command; the repository may prompt for initial ESLint setup on first use

## Cloud Setup

For full cloud storage instructions, see:

- [`CLOUD_STORAGE_GUIDE.md`](./CLOUD_STORAGE_GUIDE.md)

If you use PostgreSQL with Prisma, initialize the schema with:

```bash
npx prisma generate
npx prisma db push
```

The admin UI at `/admin` can help verify configuration and test storage connections.

## Notes for Maintainers

- The repository currently relies on Google-hosted fonts in `app/layout.tsx`, which can affect offline or restricted-network builds. Consider self-hosting fonts or documenting that limitation for restricted environments.
- `next lint` currently prompts for initial ESLint setup if lint configuration has not been added yet.
- Documentation and architecture should stay aligned with the guardrail implementation because safety is a core product feature.

## License

This project is available under the MIT License.
