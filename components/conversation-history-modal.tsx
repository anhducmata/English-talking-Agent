"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Volume2, Loader2 } from "lucide-react"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"

const markdownComponents = {
  code({ node, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || "")
    return !inline && match ? (
      <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" className="rounded-md text-sm" {...props}>
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code className="bg-gray-600 px-1 py-0.5 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    )
  },
  p: ({ children }: any) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }: any) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
  li: ({ children }: any) => <li className="text-sm">{children}</li>,
  h1: ({ children }: any) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-base font-bold mb-2">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
  strong: ({ children }: any) => <strong className="font-bold">{children}</strong>,
  em: ({ children }: any) => <em className="italic">{children}</em>,
}

interface ConversationMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  audioUrl?: string
}

interface ConversationHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  conversation: ConversationMessage[]
  language: "en" | "vi"
  translateMessage: (messageId: string, text: string) => void
  translationsData: Record<string, string>
  loadingTranslations: Record<string, boolean>
}

export function ConversationHistoryModal({
  isOpen,
  onClose,
  conversation,
  language,
  translateMessage,
  translationsData = {},
  loadingTranslations = {},
}: ConversationHistoryModalProps) {
  const translations = {
    en: {
      title: "Conversation History",
      description: "Review the full transcript of your practice session.",
      you: "You",
      ai: "AI Teacher",
      close: "Close",
      playUser: "Play Your Voice",
      playAI: "Play AI Voice",
      translate: "translate",
    },
    vi: {
      title: "Lịch Sử Hội Thoại",
      description: "Xem lại toàn bộ bản ghi của buổi luyện tập.",
      you: "Bạn",
      ai: "AI Giáo Viên",
      close: "Đóng",
      playUser: "Phát giọng của bạn",
      playAI: "Phát giọng AI",
      translate: "dịch",
    },
  }

  const t = translations[language]

  const [currentPlayingAudio, setCurrentPlayingAudio] = useState<HTMLAudioElement | null>(null)

  const playAudio = (url: string) => {
    if (currentPlayingAudio) {
      currentPlayingAudio.pause()
      currentPlayingAudio.currentTime = 0
    }

    const audio = new Audio(url)
    audio.play()
    setCurrentPlayingAudio(audio)

    audio.onended = () => {
      setCurrentPlayingAudio(null)
    }
    audio.onerror = (e) => {
      console.error("Audio playback error:", e)
      setCurrentPlayingAudio(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col bg-black text-white border-gray-800 font-sf-mono">
        <DialogHeader>
          <DialogTitle className="text-white">{t.title}</DialogTitle>
          <DialogDescription className="text-gray-400">{t.description}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4 py-4">
            {conversation.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === "user" ? "bg-emerald-700 text-white" : "bg-gray-700 text-gray-100"
                  }`}
                >
                  <div className="text-xs font-bold mb-1 opacity-70">{message.role === "user" ? t.you : t.ai}</div>
                  <ReactMarkdown
                    components={markdownComponents}
                    className="text-sm font-medium leading-relaxed font-sf-mono prose prose-invert max-w-none"
                  >
                    {message.content}
                  </ReactMarkdown>
                  <div className="text-right text-xs text-gray-300 mt-1 opacity-60">
                    {message.timestamp.toLocaleTimeString()}
                  </div>

                  {/* Translation section */}
                  {translationsData?.[message.id] && (
                    <div className="mt-2 pt-2 border-t border-gray-500/30">
                      <p className="text-xs text-gray-300 italic leading-relaxed font-sf-mono">
                        {translationsData?.[message.id]}
                      </p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex justify-end gap-2 mt-2">
                    {/* Audio playback button */}
                    {message.audioUrl && (
                      <button
                        onClick={() => playAudio(message.audioUrl!)}
                        className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-600/50"
                        title={message.role === "user" ? t.playUser : t.playAI}
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{message.role === "user" ? t.playUser : t.playAI}</span>
                      </button>
                    )}

                    {/* Translate button */}
                    <button
                      onClick={() => translateMessage(message.id, message.content)}
                      disabled={loadingTranslations?.[message.id]}
                      className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-600/50"
                    >
                      {loadingTranslations?.[message.id] ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>...</span>
                        </>
                      ) : (
                        <>
                          <span>🌐</span>
                          <span>{t.translate}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter className="pt-4">
          <Button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white">
            {t.close}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
