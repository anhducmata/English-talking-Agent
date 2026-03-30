/**
 * Known STT hallucinations for Whisper / OpenAI Realtime models
 * when audio is silent, noisy, or near-threshold.
 *
 * Ported from meet/agent/rules/hallucinations.py
 * Used in both the Whisper REST route and the Realtime WebRTC hook.
 */

const HALLUCINATION_PHRASES = new Set([
  // English — common Whisper ghost outputs
  "thank you",
  "thanks for watching",
  "subscribe to my channel",
  "please subscribe",
  "amen",
  "ammen",
  "bye",
  "you",
  // Vietnamese equivalents
  "cảm ơn các bạn đã theo dõi",
  "cảm ơn các bạn đã xem",
  "chúc các bạn vui vẻ",
  "hẹn gặp lại",
  "xin chào và hẹn gặp lại",
  "xin chào các bạn",
  "cảm ơn",
  "cám ơn",
  "hẹn gặp lại các bạn",
])

/** Normalise: strip punctuation, lowercase, trim — mirrors the Python implementation. */
function normalise(text: string): string {
  return text.replace(/[^\w\s]/g, "").toLowerCase().trim()
}

/**
 * Returns true if the transcript is empty, punctuation-only,
 * or matches a known Whisper hallucination phrase.
 */
export function isHallucination(text: string): boolean {
  const cleaned = normalise(text)
  if (!cleaned) return true
  return HALLUCINATION_PHRASES.has(cleaned)
}
