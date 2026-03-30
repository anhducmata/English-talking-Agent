import { moderateContent, moderateAIOutput, getSafeRedirect } from './content-moderation'
import type { ModerationResult } from './content-moderation'

export interface GuardrailsConfig {
  enableInputModeration: boolean
  enableOutputModeration: boolean
  strictMode: boolean // Extra strict for younger children
  language: 'en' | 'vi'
  logAttempts: boolean
}

export const DEFAULT_GUARDRAILS_CONFIG: GuardrailsConfig = {
  enableInputModeration: true,
  enableOutputModeration: true,
  strictMode: true, // Always strict for children
  language: 'en',
  logAttempts: true,
}

export interface GuardrailsResult {
  passed: boolean
  originalText: string
  processedText: string
  moderation: ModerationResult | null
  wasModified: boolean
}

// Process user input through guardrails
export async function processUserInput(
  text: string,
  config: Partial<GuardrailsConfig> = {}
): Promise<GuardrailsResult> {
  const finalConfig = { ...DEFAULT_GUARDRAILS_CONFIG, ...config }

  if (!finalConfig.enableInputModeration) {
    return {
      passed: true,
      originalText: text,
      processedText: text,
      moderation: null,
      wasModified: false,
    }
  }

  const moderation = await moderateContent(text, finalConfig.language)

  if (finalConfig.logAttempts && !moderation.isSafe) {
    console.log('[Guardrails] Blocked user input:', {
      timestamp: new Date().toISOString(),
      categories: moderation.flaggedCategories,
      action: moderation.action,
    })
  }

  if (!moderation.isSafe) {
    return {
      passed: false,
      originalText: text,
      processedText: moderation.redirectMessage || getSafeRedirect(finalConfig.language),
      moderation,
      wasModified: true,
    }
  }

  return {
    passed: true,
    originalText: text,
    processedText: text,
    moderation,
    wasModified: false,
  }
}

// Process AI output through guardrails
export async function processAIOutput(
  text: string,
  config: Partial<GuardrailsConfig> = {}
): Promise<GuardrailsResult> {
  const finalConfig = { ...DEFAULT_GUARDRAILS_CONFIG, ...config }

  if (!finalConfig.enableOutputModeration) {
    return {
      passed: true,
      originalText: text,
      processedText: text,
      moderation: null,
      wasModified: false,
    }
  }

  const moderation = await moderateAIOutput(text, finalConfig.language)

  if (finalConfig.logAttempts && !moderation.isSafe) {
    console.log('[Guardrails] Blocked AI output:', {
      timestamp: new Date().toISOString(),
      categories: moderation.flaggedCategories,
    })
  }

  if (!moderation.isSafe) {
    // For AI output, provide a generic safe response
    const safeResponse = finalConfig.language === 'en'
      ? "I'd love to help you practice English! What would you like to talk about?"
      : "Toi rat vui duoc giup con luyen tieng Anh! Con muon noi ve gi?"

    return {
      passed: false,
      originalText: text,
      processedText: safeResponse,
      moderation,
      wasModified: true,
    }
  }

  return {
    passed: true,
    originalText: text,
    processedText: text,
    moderation,
    wasModified: false,
  }
}

// Child-safe system prompt wrapper
export function wrapWithChildSafeInstructions(
  systemPrompt: string,
  language: 'en' | 'vi' = 'en'
): string {
  const safetyInstructions = language === 'en' 
    ? `
CHILD SAFETY RULES (CRITICAL - NEVER VIOLATE):
- You are speaking with a child aged 6-12 years old
- Your OVERALL TONE must be: super cheerful, bubbly, warm, playful, and enthusiastic - like the coolest, friendliest teacher ever!
- Use short, simple sentences with fun, positive words. Celebrate everything!
- NEVER discuss violence, weapons, fighting, or harmful acts
- NEVER discuss adult content, dating, or romantic relationships
- NEVER discuss drugs, alcohol, smoking, or substance use
- NEVER give medical, legal, or financial advice
- NEVER share or ask for personal information (address, phone, school name, etc.)
- NEVER discuss scary topics, horror, ghosts, or nightmares
- NEVER use sarcasm, complex irony, or humor that children won't understand
- NEVER teach or encourage any dangerous, illegal, or harmful activities
- If asked about inappropriate topics, ALWAYS redirect with enthusiasm: "Ooooh let's talk about something super fun instead! What's your favorite animal/color/game?"
- Keep language simple, friendly, and age-appropriate
- Be encouraging, patient, and supportive at all times - cheer them on!
- Focus on education, learning English, and positive topics

` : `
QUY TAC AN TOAN CHO TRE EM (QUAN TRONG - KHONG BAO GIO VI PHAM):
- Ban dang noi chuyen voi tre em tu 6-12 tuoi
- GIONG DIEU TONG THE phai la: cuc ky vui ve, nhiet tinh, am ap, vui nhon - nhu nguoi thay than thien nhat the gioi!
- Dung cau ngan, don gian voi nhung tu vui ve, tich cuc. Chuc mung moi thu!
- KHONG BAO GIO thao luan ve bao luc, vu khi, danh nhau
- KHONG BAO GIO thao luan ve noi dung nguoi lon, hen ho
- KHONG BAO GIO thao luan ve ma tuy, ruou bia, thuoc la
- KHONG BAO GIO dua ra loi khuyen y te, phap ly, tai chinh
- KHONG BAO GIO chia se hoac hoi thong tin ca nhan
- KHONG BAO GIO thao luan ve chu de kinh di, ma quy
- KHONG BAO GIO su dung mai mia, hai huoc phuc tap
- Neu duoc hoi ve chu de khong phu hop, LUON LUON chuyen huong nhiet tinh: "Ooooh hay noi ve dieu gi do vui hon nhe! Con thich con vat/mau sac/tro choi nao?"
- Giu ngon ngu don gian, than thien va phu hop voi lua tuoi
- Luon khuyen khich, kien nhan va ho tro - co vu cac em!
- Tap trung vao giao duc, hoc tieng Anh va cac chu de tich cuc

`

  return safetyInstructions + systemPrompt
}
