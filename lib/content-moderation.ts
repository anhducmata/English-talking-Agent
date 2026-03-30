import OpenAI from 'openai'
import { 
  BLOCKED_WORDS_EN, 
  BLOCKED_WORDS_VI, 
  SAFE_REDIRECTS 
} from './constants/blocked-words'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ModerationResult {
  isSafe: boolean
  flaggedCategories: string[]
  confidence: number
  action: 'allow' | 'block' | 'redirect'
  redirectMessage?: string
}

// Quick check for blocked words (fast, runs first)
export function quickWordCheck(text: string, language: 'en' | 'vi' = 'en'): boolean {
  const lowerText = text.toLowerCase()
  const blockedWords = language === 'vi' ? BLOCKED_WORDS_VI : BLOCKED_WORDS_EN
  
  for (const word of blockedWords) {
    if (lowerText.includes(word.toLowerCase())) {
      return false // Not safe
    }
  }
  return true // Safe
}

// Get a random safe redirect message
export function getSafeRedirect(language: 'en' | 'vi' = 'en'): string {
  const redirects = SAFE_REDIRECTS[language]
  return redirects[Math.floor(Math.random() * redirects.length)]
}

// Full moderation using OpenAI Moderation API
export async function moderateContent(
  text: string,
  language: 'en' | 'vi' = 'en'
): Promise<ModerationResult> {
  try {
    // First, do quick word check
    if (!quickWordCheck(text, language)) {
      return {
        isSafe: false,
        flaggedCategories: ['blocked_word'],
        confidence: 1.0,
        action: 'redirect',
        redirectMessage: getSafeRedirect(language),
      }
    }

    // Then, use OpenAI Moderation API for deeper analysis
    const response = await openai.moderations.create({
      input: text,
      model: 'omni-moderation-latest',
    })

    const result = response.results[0]
    
    if (result.flagged) {
      const flaggedCategories = Object.entries(result.categories)
        .filter(([_, flagged]) => flagged)
        .map(([category]) => category)

      // For children, we're extra strict
      const isViolent = result.category_scores.violence > 0.3
      const isSexual = result.category_scores.sexual > 0.1 // Very low threshold for children
      const isHate = result.category_scores.hate > 0.3
      const isSelfHarm = result.category_scores['self-harm'] > 0.2

      if (isViolent || isSexual || isHate || isSelfHarm) {
        return {
          isSafe: false,
          flaggedCategories,
          confidence: Math.max(
            result.category_scores.violence,
            result.category_scores.sexual,
            result.category_scores.hate,
            result.category_scores['self-harm']
          ),
          action: 'redirect',
          redirectMessage: getSafeRedirect(language),
        }
      }
    }

    return {
      isSafe: true,
      flaggedCategories: [],
      confidence: 0,
      action: 'allow',
    }
  } catch (error) {
    console.error('Moderation API error:', error)
    // On error, do quick check only and be cautious
    const isQuickSafe = quickWordCheck(text, language)
    return {
      isSafe: isQuickSafe,
      flaggedCategories: isQuickSafe ? [] : ['error_fallback'],
      confidence: 0.5,
      action: isQuickSafe ? 'allow' : 'redirect',
      redirectMessage: isQuickSafe ? undefined : getSafeRedirect(language),
    }
  }
}

// Moderate output from AI (less strict, mainly catching mistakes)
export async function moderateAIOutput(
  text: string,
  language: 'en' | 'vi' = 'en'
): Promise<ModerationResult> {
  // Quick word check for AI output
  if (!quickWordCheck(text, language)) {
    return {
      isSafe: false,
      flaggedCategories: ['ai_output_blocked_word'],
      confidence: 1.0,
      action: 'block',
    }
  }

  // For AI output, we trust the model more but still check
  try {
    const response = await openai.moderations.create({
      input: text,
      model: 'omni-moderation-latest',
    })

    const result = response.results[0]
    
    if (result.flagged) {
      return {
        isSafe: false,
        flaggedCategories: Object.entries(result.categories)
          .filter(([_, flagged]) => flagged)
          .map(([category]) => category),
        confidence: 0.8,
        action: 'block',
      }
    }

    return {
      isSafe: true,
      flaggedCategories: [],
      confidence: 0,
      action: 'allow',
    }
  } catch (error) {
    console.error('AI output moderation error:', error)
    // On error, use quick check
    return {
      isSafe: quickWordCheck(text, language),
      flaggedCategories: [],
      confidence: 0.5,
      action: 'allow',
    }
  }
}
