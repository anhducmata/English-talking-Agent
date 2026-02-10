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
  currentUserTranscript?: string
  currentAITranscript?: string
  isAISpeaking?: boolean
  language: "en" | "vi"
  translationsData: Record<string, string>
  loadingTranslations: Record<string, boolean>
  onTranslateMessage: (messageId: string, text: string) => void
  /** @deprecated kept for backward compat */
  currentTranscript?: string
  /** @deprecated kept for backward compat */
  isRecording?: boolean
  /** @deprecated kept for backward compat */
  isProcessing?: boolean
  /** @deprecated kept for backward compat */
  isAIThinking?: boolean
}

const translations = {
  en: {
    you: "You",
    ai: "AI Teacher",
    speaking: "Speaking...",
    processing: "Processing...",
    aiThinking: "AI is thinking...",
    aiSpeaking: "AI is speaking...",
  },
  vi: {
    you: "Ban",
    ai: "AI Giao Vien",
    speaking: "Dang Noi...",
    processing: "Dang Xu Ly...",
    aiThinking: "AI dang suy nghi...",
    aiSpeaking: "AI dang noi...",
  },
}

export const ConversationDisplay = forwardRef<HTMLDivElement, ConversationDisplayProps>(
  (
    {
      conversation,
      currentUserTranscript = "",
      currentAITranscript = "",
      isAISpeaking = false,
      language,
      translationsData,
      loadingTranslations,
      onTranslateMessage,
      // Legacy props (still accepted but realtime flow uses new props)
      currentTranscript,
      isRecording,
      isProcessing,
      isAIThinking,
    },
    ref,
  ) => {
    const t = translations[language]

    // Support legacy props or new realtime props
    const userTranscriptText = currentUserTranscript || currentTranscript || ""
    const showUserTranscript = !!userTranscriptText && userTranscriptText !== ""
    const showAITranscript = !!currentAITranscript && currentAITranscript !== ""
    const showProcessing = isProcessing || isAIThinking

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
                      <span>dich</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Live AI transcript while speaking */}
          {showAITranscript && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-gray-700/50 border border-blue-500/40">
                <div className="text-xs font-bold mb-1 text-blue-300">
                  {t.ai} ({t.aiSpeaking})
                </div>
                <p className="text-xs font-medium text-gray-200">{currentAITranscript}</p>
              </div>
            </div>
          )}

          {/* Live user transcription while speaking */}
          {showUserTranscript && (
            <div className="flex justify-end">
              <div className="max-w-[80%] p-3 rounded-lg bg-emerald-600/50 border border-emerald-500">
                <div className="text-xs font-bold mb-1 text-emerald-200">
                  {t.you} ({t.speaking})
                </div>
                <p className="text-xs font-medium text-white">{userTranscriptText}</p>
              </div>
            </div>
          )}

          {/* General processing/AI thinking indicator (legacy) */}
          {showProcessing && (
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
