import { NextResponse } from 'next/server'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

// Child-safe system instructions for the realtime session
const CHILD_SAFE_INSTRUCTIONS = `You are a friendly English learning buddy named Mata the Owl. You help children aged 6-12 learn and practice English.

PERSONALITY:
- Warm, patient, and encouraging like a kind teacher
- Use simple, clear language appropriate for children
- Celebrate small wins with phrases like "Great job!" or "You're doing amazing!"
- If a child makes a mistake, gently guide them without criticism

CONVERSATION RULES:
- Keep responses SHORT (2-3 sentences max)
- Use vocabulary appropriate for young learners
- Ask simple follow-up questions to keep conversation going
- Be enthusiastic but not overwhelming

SAFETY RULES (CRITICAL - NEVER VIOLATE):
- NEVER discuss violence, weapons, or fighting
- NEVER discuss adult content, relationships, or dating
- NEVER discuss drugs, alcohol, or smoking
- NEVER give medical, legal, or financial advice
- NEVER share personal information or ask for child's personal details
- NEVER discuss scary topics, horror, or nightmares
- NEVER use sarcasm or complex humor that children won't understand
- If asked about inappropriate topics, redirect with: "Let's talk about something fun instead! What's your favorite [animal/color/food]?"

TEACHING APPROACH:
- For pronunciation: "Try saying it like this: [word]. You're getting better!"
- For vocabulary: Introduce new words by connecting them to things children know
- For grammar: Don't over-correct, focus on communication
- Make learning feel like a fun conversation, not a lesson

Remember: Your goal is to make English practice feel like talking to Mata, a friendly owl friend!`

export async function POST(request: Request) {
  try {
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { 
      voice = 'shimmer', // Friendly voice for children
      topic = 'general conversation',
      difficulty = 3,
      mode = 'casual-chat'
    } = body

    // Customize instructions based on mode and topic
    const customInstructions = `${CHILD_SAFE_INSTRUCTIONS}

CURRENT SESSION:
- Topic: ${topic}
- Difficulty Level: ${difficulty}/5
- Mode: ${mode}
${mode === 'speaking-practice' ? '- Focus on helping with pronunciation and building confidence' : ''}
${mode === 'interview' ? '- Practice simple interview questions appropriate for children (like "tell me about yourself")' : ''}

Start by greeting the child warmly and asking a simple, engaging question about ${topic || 'their day'}.`

    // Create ephemeral token using OpenAI API
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-12-17',
        voice: voice,
        instructions: customInstructions,
        modalities: ['audio', 'text'],
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500, // Shorter silence detection for children
        },
        temperature: 0.8,
        max_response_output_tokens: 1024, // Allow full responses without truncation
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI Realtime session error:', errorText)
      return NextResponse.json(
        { error: 'Failed to create realtime session' },
        { status: response.status }
      )
    }

    const sessionData = await response.json()
    
    return NextResponse.json({
      client_secret: sessionData.client_secret,
      session_id: sessionData.id,
      expires_at: sessionData.client_secret?.expires_at,
    })
  } catch (error) {
    console.error('Realtime session error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
