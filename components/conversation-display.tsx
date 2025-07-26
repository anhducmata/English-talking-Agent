"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Volume2, Loader2 } from "lucide-react"
import { forwardRef } from "react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"

export interface ConversationMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  audioUrl?: string
}

interface ConversationDisplayProps {
  conversation: ConversationMessage[]
  currentTranscript: string
  isRecording: boolean
  isProcessing: boolean
  isAIThinking: boolean
  language: "en" | "vi"
  translationsData: Record<string, string>
  loadingTranslations: Record<string, boolean>
  onTranslateMessage: (messageId: string, text: string) => void
}

const translations = {
  en: {
    you: "You",
    ai: "AI Teacher",
    speaking: "Speaking...",
    processing: "Processing...",
    aiThinking: "AI is thinking...",
  },
  vi: {
    you: "Bạn",
    ai: "AI Giáo Viên",
    speaking: "Đang Nói...",
    processing: "Đang Xử Lý...",
    aiThinking: "AI đang suy nghĩ...",
  },
}

const createTTSContent = (content: string): string => {
  // Check if content is too long (more than 200 characters) or contains code
  const hasCodeBlocks = /```[\s\S]*?```/.test(content)
  const hasInlineCode = /`[^`]+`/.test(content)
  const isLong = content.length > 200

  if (hasCodeBlocks || (hasInlineCode && isLong)) {
    // Extract the main text without code blocks
    const mainText = content
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`[^`]+`/g, "")
      .trim()

    // If there's still substantial text after removing code
    if (mainText.length > 50) {
      // Take first sentence or first 100 characters
      const firstSentence = mainText.split(/[.!?]/)[0]
      const summary = firstSentence.length > 100 ? mainText.substring(0, 100) + "..." : firstSentence

      if (hasCodeBlocks) {
        return `${summary}. I've also included some code examples for you to review.`
      } else {
        return `${summary}. Please check the details in the message.`
      }
    } else {
      // Mostly code with little text
      if (hasCodeBlocks) {
        return "I've shared some code examples for you to review."
      } else {
        return "I've shared some technical details for you to check."
      }
    }
  }

  // For normal length content without code, return as is
  return content
}

export const ConversationDisplay = forwardRef<HTMLDivElement, ConversationDisplayProps>(
  (
    {
      conversation,
      currentTranscript,
      isRecording,
      isProcessing,
      isAIThinking,
      language,
      translationsData,
      loadingTranslations,
      onTranslateMessage,
    },
    ref,
  ) => {
    const t = translations[language]

    return (
      <Card className="border border-gray-800 bg-black/50 backdrop-blur-sm min-h-[400px]">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-white">
            <Volume2 className="w-5 h-5 text-emerald-500" />
            Live Conversation
          </CardTitle>
        </CardHeader>
        <CardContent ref={ref} className="space-y-4 max-h-[350px] overflow-y-auto">
          {conversation.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === "user" ? "bg-emerald-600 text-white" : "bg-gray-700 text-gray-100"
                }`}
              >
                <div className="text-xs font-bold mb-1 opacity-70">{message.role === "user" ? t.you : t.ai}</div>
                <div className="text-xs font-medium leading-relaxed prose prose-invert prose-xs max-w-none">
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "")
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                            className="text-xs rounded-md"
                            {...props}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        ) : (
                          <code className="bg-gray-600 px-1 py-0.5 rounded text-xs" {...props}>
                            {children}
                          </code>
                        )
                      },
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                      li: ({ children }) => <li className="mb-1">{children}</li>,
                      h1: ({ children }) => <h1 className="text-sm font-bold mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-sm font-bold mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-xs font-bold mb-1">{children}</h3>,
                      strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>

                {/* Translation section */}
                {translationsData[message.id] && (
                  <div className="mt-2 pt-2 border-t border-gray-500/30">
                    <p className="text-xs text-gray-300 italic leading-relaxed">{translationsData[message.id]}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-2">
                  {/* Audio playback button */}
                  {message.audioUrl && (
                    <button
                      onClick={() => {
                        if (message.audioUrl) {
                          const audio = new Audio(message.audioUrl)
                          audio.play()
                        } else if (message.role === "assistant") {
                          // For AI messages without audio, generate TTS with summarized content
                          const ttsContent = createTTSContent(message.content)
                          // You can add TTS generation logic here if needed
                        }
                      }}
                      className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                      title={message.role === "user" ? "Play your recording" : "Play AI voice"}
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>{message.role === "user" ? "play" : "play AI"}</span>
                    </button>
                  )}

                  {/* Translate button */}
                  <button
                    onClick={() => onTranslateMessage(message.id, message.content)}
                    disabled={loadingTranslations[message.id]}
                    className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    {loadingTranslations[message.id] ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>...</span>
                      </>
                    ) : (
                      <>
                        <span>🌐</span>
                        <span>dịch</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Live transcription while recording */}
          {isRecording && currentTranscript && (
            <div className="flex justify-end">
              <div className="max-w-[80%] p-3 rounded-lg bg-emerald-600/50 border border-emerald-500">
                <div className="text-xs font-bold mb-1 text-emerald-200">
                  {t.you} ({t.speaking})
                </div>
                <p className="text-xs font-medium text-white">{currentTranscript}</p>
              </div>
            </div>
          )}

          {/* General processing/AI thinking indicator */}
          {(isProcessing || isAIThinking) && (
            <div className="flex justify-center">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                {isProcessing && !isRecording ? t.processing : isAIThinking ? t.aiThinking : null}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  },
)

ConversationDisplay.displayName = "ConversationDisplay"
