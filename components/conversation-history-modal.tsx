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

interface ConversationMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  audioUrl?: string // Added audioUrl for both user and AI messages
}

interface ConversationHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  conversation: ConversationMessage[]
  language: "en" | "vi"
  // Props for translation
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
      playOriginal: "Play Original",
      playAI: "Play AI Voice", // New translation for AI voice playback
      translate: "translate",
    },
    vi: {
      title: "Lịch Sử Hội Thoại",
      description: "Xem lại toàn bộ bản ghi của buổi luyện tập.",
      you: "Bạn",
      ai: "AI Giáo Viên",
      close: "Đóng",
      playOriginal: "Phát bản gốc",
      playAI: "Phát giọng AI", // New translation for AI voice playback
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
                  <p className="text-sm font-medium leading-relaxed font-sf-mono">{message.content}</p>
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

                  <div className="flex justify-end gap-2 mt-2">
                    {/* Play Original Audio Button (for user messages) */}
                    {message.role === "user" && message.audioUrl && (
                      <button
                        onClick={() => playAudio(message.audioUrl!)}
                        className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                        title={t.playOriginal}
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{t.playOriginal}</span>
                      </button>
                    )}

                    {/* Play AI Voice Button (for AI messages) */}
                    {message.role === "assistant" && message.audioUrl && (
                      <button
                        onClick={() => playAudio(message.audioUrl!)}
                        className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                        title={t.playAI}
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{t.playAI}</span>
                      </button>
                    )}

                    {/* Translate button */}
                    <button
                      onClick={() => translateMessage(message.id, message.content)}
                      disabled={loadingTranslations?.[message.id]}
                      className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
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
