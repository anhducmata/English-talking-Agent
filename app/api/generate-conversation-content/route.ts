import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { rawTopic, conversationMode, language } = await request.json()

    if (!rawTopic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 })
    }

    let systemPrompt = ""

    switch (conversationMode) {
      case "casual-chat":
        systemPrompt = `You are creating a casual conversation setup. Based on the user's topic, generate a structured conversation framework for natural, relaxed English practice.

Conversation Mode: Casual Chat
Language: ${language}

Generate a JSON response with these fields:
- topic: A refined, engaging topic title for casual conversation
- goal: What the conversation aims to achieve (1-2 sentences, focus on natural communication)
- rules: How the conversation will flow (1-2 sentences, emphasize natural dialogue)
- expectations: What participants should experience (1-2 sentences, focus on comfort and fluency)

Make the content suitable for relaxed, everyday English conversation practice.`
        break

      case "speaking-practice":
        systemPrompt = `You are creating a structured speaking practice session. Based on the user's topic, generate a comprehensive practice framework for focused English improvement.

Conversation Mode: Speaking Practice
Language: ${language}

Generate a JSON response with these fields:
- topic: A clear, specific topic title for focused practice
- goal: What skills will be developed (1-2 sentences, focus on specific language skills)
- rules: How practice will be guided (1-2 sentences, mention feedback and corrections)
- expectations: What improvements to expect (1-2 sentences, focus on measurable progress)

Make the content appropriate for structured language practice with feedback and improvement focus.`
        break

      case "interview":
        systemPrompt = `You are creating an interview simulation setup. Based on the user's topic, generate a professional interview practice framework.

Conversation Mode: Interview Simulation
Language: ${language}

Generate a JSON response with these fields:
- topic: A professional topic title for interview practice
- goal: What interview skills will be practiced (1-2 sentences, focus on professional communication)
- rules: How the interview simulation will proceed (1-2 sentences, mention realistic interview format)
- expectations: What interview readiness to expect (1-2 sentences, focus on confidence and professionalism)

Make the content appropriate for job interview preparation and professional communication practice.`
        break

      default:
        systemPrompt = `You are creating a general conversation practice setup. Generate a structured framework for English conversation practice.

Generate a JSON response with these fields:
- topic: A clear topic title
- goal: What the conversation aims to achieve
- rules: How the conversation will flow
- expectations: What participants should experience`
    }

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: `Create a conversation setup for: "${rawTopic}"`,
      maxTokens: 500,
    })

    // Try to parse as JSON, fallback to structured text parsing
    let conversationContent
    try {
      conversationContent = JSON.parse(text)
    } catch {
      // Fallback: create structured content based on conversation mode
      const modeSpecificContent = getDefaultContentByMode(conversationMode, rawTopic)
      conversationContent = {
        topic: rawTopic,
        ...modeSpecificContent,
      }
    }

    return NextResponse.json(conversationContent)
  } catch (error) {
    console.error("Error generating conversation content:", error)
    return NextResponse.json({ error: "Failed to generate conversation content" }, { status: 500 })
  }
}

function getDefaultContentByMode(mode: string, topic: string) {
  switch (mode) {
    case "casual-chat":
      return {
        goal: `Have a natural, relaxed conversation about ${topic.toLowerCase()}, focusing on comfortable communication and expressing personal thoughts.`,
        rules: `We'll chat naturally about the topic, with gentle guidance to keep the conversation flowing and engaging.`,
        expectations: `You'll feel more comfortable discussing ${topic.toLowerCase()} in English and gain confidence in casual conversation.`,
      }

    case "speaking-practice":
      return {
        goal: `Practice structured speaking about ${topic.toLowerCase()}, improving vocabulary, grammar, and fluency with focused feedback.`,
        rules: `I'll provide corrections, suggest improvements, and guide you through various aspects of the topic with detailed feedback.`,
        expectations: `You'll develop stronger speaking skills and receive specific feedback to improve your English proficiency.`,
      }

    case "interview":
      return {
        goal: `Simulate a professional interview scenario related to ${topic.toLowerCase()}, practicing formal communication and interview skills.`,
        rules: `I'll conduct a realistic interview with relevant questions, professional tone, and constructive feedback on your responses.`,
        expectations: `You'll gain confidence in interview situations and improve your professional English communication skills.`,
      }

    default:
      return {
        goal: `Practice English conversation about ${topic.toLowerCase()}, improving communication skills and confidence.`,
        rules: `We'll have a guided conversation with helpful feedback and encouragement.`,
        expectations: `You'll feel more confident discussing this topic in English.`,
      }
  }
}
