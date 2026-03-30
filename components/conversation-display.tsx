"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Volume2, Loader2, Sparkles, Mic, Languages } from "lucide-react"
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
    liveChat: "Live Chat",
  },
  vi: {
    you: "Bạn",
    ai: "AI Giáo Viên",
    speaking: "Đang Nói...",
    processing: "Đang Xử Lý...",
    aiThinking: "AI đang suy nghĩ...",
    liveChat: "Trò Chuyện Trực Tiếp",
  },
}

const createTTSContent = (content: string): string => {
  const hasCodeBlocks = /```[\s\S]*?```/.test(content)
  const hasInlineCode = /`[^`]+`/.test(content)
  const isLong = content.length > 200

  if (hasCodeBlocks || (hasInlineCode && isLong)) {
    const mainText = content
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`[^`]+`/g, "")
      .trim()

    if (mainText.length > 50) {
      const firstSentence = mainText.split(/[.!?]/)[0]
      const summary = firstSentence.length > 100 ? mainText.substring(0, 100) + "..." : firstSentence

      if (hasCodeBlocks) {
        return `${summary}. I've also included some code examples for you to review.`
      } else {
        return `${summary}. Please check the details in the message.`
      }
    } else {
      if (hasCodeBlocks) {
        return "I've shared some code examples for you to review."
      } else {
        return "I've shared some technical details for you to check."
      }
    }
  }

  return content
}

// Rotating fun colors for AI bubbles to keep it lively
const aiBubbleColors = [
  "bg-sky-100 border-2 border-sky-300 text-sky-900",
  "bg-violet-100 border-2 border-violet-300 text-violet-900",
  "bg-emerald-100 border-2 border-emerald-300 text-emerald-900",
  "bg-amber-100 border-2 border-amber-300 text-amber-900",
  "bg-pink-100 border-2 border-pink-300 text-pink-900",
]

const aiLabelColors = [
  "text-sky-600",
  "text-violet-600",
  "text-emerald-600",
  "text-amber-600",
  "text-pink-600",
]

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
      <Card className="border-2 border-sky-200 bg-white shadow-lg rounded-2xl overflow-hidden min-h-[400px]">
        {/* Colorful header */}
        <CardHeader className="pb-3 pt-4 px-4 bg-gradient-to-r from-sky-400 via-violet-400 to-pink-400">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-white">
            <Sparkles className="w-5 h-5 text-yellow-200 animate-bounce-gentle" />
            {t.liveChat}
            <span className="ml-auto text-sm font-normal text-white/80">
              {conversation.length > 0 && `${conversation.length} messages`}
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent
          ref={ref}
          className="space-y-4 max-h-[350px] overflow-y-auto p-5 bg-gradient-to-b from-sky-50/50 to-white"
        >
          {conversation.length === 0 && !isAIThinking && !isProcessing && (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-300 to-violet-400 flex items-center justify-center shadow-md">
                <Mic className="w-7 h-7 text-white" />
              </div>
              <p className="text-base font-semibold text-sky-600">
                {language === "en" ? "Start speaking to begin!" : "Hãy bắt đầu nói!"}
              </p>
              <p className="text-sm text-slate-400">
                {language === "en" ? "Your conversation will appear here" : "Cuộc trò chuyện sẽ hiện ở đây"}
              </p>
            </div>
          )}

          {conversation.map((message, index) => {
            const colorIdx = index % aiBubbleColors.length
            const isUser = message.role === "user"

            return (
              <div
                key={message.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                {/* AI avatar dot */}
                {!isUser && (
                  <div
                    className={`w-7 h-7 rounded-full flex-shrink-0 mr-2 mt-1 flex items-center justify-center shadow-sm ${
                      ["bg-sky-400", "bg-violet-400", "bg-emerald-400", "bg-amber-400", "bg-pink-400"][colorIdx]
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[78%] px-4 py-3 rounded-2xl shadow-sm ${
                    isUser
                      ? "bg-gradient-to-br from-sky-500 to-sky-600 text-white rounded-br-sm"
                      : `${aiBubbleColors[colorIdx]} rounded-bl-sm`
                  }`}
                >
                  {/* Role label */}
                  <div
                    className={`text-xs font-bold mb-2 ${
                      isUser ? "text-sky-100" : aiLabelColors[colorIdx]
                    }`}
                  >
                    {isUser ? t.you : t.ai}
                  </div>

                  {/* Message content */}
                  <div
                    className={`text-sm font-medium leading-relaxed prose prose-sm max-w-none ${
                      isUser ? "prose-invert" : ""
                    }`}
                  >
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
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
                            <code
                              className={`px-1 py-0.5 rounded text-xs ${
                                isUser ? "bg-sky-400/40" : "bg-slate-200"
                              }`}
                              {...props}
                            >
                              {children}
                            </code>
                          )
                        },
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        h1: ({ children }) => <h1 className="text-base font-bold mb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>

                  {/* Translation section */}
                  {translationsData[message.id] && (
                    <div
                      className={`mt-3 pt-3 border-t ${
                        isUser ? "border-sky-400/40" : "border-current/20"
                      }`}
                    >
                      <p className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                        <Languages className="w-3.5 h-3.5" />
                        {language === "en" ? "Translation" : "Dịch"}
                      </p>
                      <p
                        className={`text-sm italic leading-relaxed ${
                          isUser ? "text-sky-100" : "text-slate-600"
                        }`}
                      >
                        {translationsData[message.id]}
                      </p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex justify-end gap-2 mt-3">
                    {message.audioUrl && (
                      <button
                        onClick={() => {
                          if (message.audioUrl) {
                            const audio = new Audio(message.audioUrl)
                            audio.play()
                          }
                        }}
                        className={`text-xs flex items-center gap-1.5 px-3 py-1 rounded-full transition-colors ${
                          isUser
                            ? "text-sky-100 hover:bg-sky-400/30"
                            : "text-slate-600 hover:bg-slate-200"
                        }`}
                        title={message.role === "user" ? "Play your recording" : "Play AI voice"}
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>{message.role === "user" ? "Play" : "Play AI"}</span>
                      </button>
                    )}

                    <button
                      onClick={() => onTranslateMessage(message.id, message.content)}
                      disabled={loadingTranslations[message.id]}
                      className={`text-xs flex items-center gap-1.5 px-3 py-1 rounded-full transition-colors ${
                        isUser
                          ? "text-sky-100 hover:bg-sky-400/30"
                          : "text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {loadingTranslations[message.id] ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{language === "en" ? "Translating" : "Dịch"}</span>
                        </>
                      ) : (
                        <>
                          <Languages className="w-4 h-4" />
                          <span>{language === "en" ? "Translate" : "Dịch"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* User avatar dot */}
                {isUser && (
                  <div className="w-7 h-7 rounded-full flex-shrink-0 ml-2 mt-1 bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-sm">
                    <span className="text-[10px] font-bold text-white">You</span>
                  </div>
                )}
              </div>
            )
          })}

          {/* Live transcription while recording */}
          {isRecording && currentTranscript && (
            <div className="flex justify-end">
              <div className="max-w-[78%] px-4 py-3 rounded-2xl rounded-br-sm bg-sky-400/20 border-2 border-sky-300 border-dashed">
                <div className="text-xs font-bold mb-2 text-sky-600">
                  {t.you} ({t.speaking})
                </div>
                <p className="text-sm font-medium text-sky-800">{currentTranscript}</p>
              </div>
            </div>
          )}

          {/* AI thinking indicator */}
          {(isProcessing || isAIThinking) && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full flex-shrink-0 mr-2 mt-1 bg-violet-400 flex items-center justify-center shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-violet-100 border-2 border-violet-300">
                <div className="flex items-center gap-2 text-sm font-semibold text-violet-700">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isProcessing && !isRecording ? t.processing : t.aiThinking}
                </div>
                {/* Typing dots animation */}
                <div className="flex gap-1.5 mt-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  },
)

ConversationDisplay.displayName = "ConversationDisplay"
