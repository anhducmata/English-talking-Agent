import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { jobTitle, company, experienceLevel, jobDescription, language } = await request.json()

    if (!jobTitle) {
      return NextResponse.json({ error: "Job title is required" }, { status: 400 })
    }

    const systemPrompt = `You are an expert career coach and interview specialist. Create a comprehensive interview preparation context based on the provided job information.

Generate realistic interview questions and context that would be relevant for this position. Focus on:
- Common questions for this role and industry
- Behavioral and situational questions
- Technical or skill-based questions relevant to the position
- Company culture and fit questions
- Questions about experience and background

Language: ${language}

Provide a structured interview context that includes:
1. Key areas likely to be covered
2. Types of questions to expect
3. Important skills/qualities to highlight
4. Relevant industry context

Make this practical and actionable for interview preparation.`

    const prompt = `Create interview preparation context for:
Job Title: ${jobTitle}
${company ? `Company: ${company}` : ""}
Experience Level: ${experienceLevel}
${jobDescription ? `Job Description: ${jobDescription}` : ""}

Focus on creating realistic interview scenarios and questions that would help someone prepare effectively for this type of position.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: prompt,
      maxTokens: 800,
    })

    return NextResponse.json({
      interviewContext: text,
      jobTitle,
      company,
      experienceLevel,
    })
  } catch (error) {
    console.error("Error preparing interview:", error)
    return NextResponse.json({ error: "Failed to prepare interview context" }, { status: 500 })
  }
}
