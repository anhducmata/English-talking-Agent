"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Mic } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuickChatModalProps {
  isOpen: boolean
  onClose: () => void
  onStartChat: (config: {
    topic: string
    conversationMode: string
    voice: string
    timeLimit: string
  }) => void
  language?: "en" | "vi"
}

const topics = {
  en: [
    { key: "my-favorite-animals", label: "My Favorite Animals", icon: "🐶", color: "bg-sky-100 border-sky-300 hover:border-sky-400", iconBg: "bg-sky-200", selectedBorder: "border-sky-500 bg-sky-50" },
    { key: "superheroes", label: "Superheroes", icon: "🦸", color: "bg-violet-100 border-violet-300 hover:border-violet-400", iconBg: "bg-violet-200", selectedBorder: "border-violet-500 bg-violet-50" },
    { key: "my-favorite-foods", label: "Yummy Foods", icon: "🍕", color: "bg-orange-100 border-orange-300 hover:border-orange-400", iconBg: "bg-orange-200", selectedBorder: "border-orange-500 bg-orange-50" },
    { key: "space-and-planets", label: "Space & Planets", icon: "🚀", color: "bg-indigo-100 border-indigo-300 hover:border-indigo-400", iconBg: "bg-indigo-200", selectedBorder: "border-indigo-500 bg-indigo-50" },
    { key: "my-family", label: "My Family", icon: "👨‍👩‍👧", color: "bg-pink-100 border-pink-300 hover:border-pink-400", iconBg: "bg-pink-200", selectedBorder: "border-pink-500 bg-pink-50" },
    { key: "school-and-friends", label: "School & Friends", icon: "🏫", color: "bg-yellow-100 border-yellow-300 hover:border-yellow-400", iconBg: "bg-yellow-200", selectedBorder: "border-yellow-500 bg-yellow-50" },
    { key: "games-and-toys", label: "Games & Toys", icon: "🎮", color: "bg-green-100 border-green-300 hover:border-green-400", iconBg: "bg-green-200", selectedBorder: "border-green-500 bg-green-50" },
    { key: "dinosaurs", label: "Dinosaurs", icon: "🦕", color: "bg-emerald-100 border-emerald-300 hover:border-emerald-400", iconBg: "bg-emerald-200", selectedBorder: "border-emerald-500 bg-emerald-50" },
    { key: "magic-and-fairytales", label: "Magic & Fairytales", icon: "🧙", color: "bg-purple-100 border-purple-300 hover:border-purple-400", iconBg: "bg-purple-200", selectedBorder: "border-purple-500 bg-purple-50" },
    { key: "sports-and-games", label: "Sports & Games", icon: "⚽", color: "bg-cyan-100 border-cyan-300 hover:border-cyan-400", iconBg: "bg-cyan-200", selectedBorder: "border-cyan-500 bg-cyan-50" },
    { key: "cartoons-and-movies", label: "Cartoons & Movies", icon: "🎬", color: "bg-rose-100 border-rose-300 hover:border-rose-400", iconBg: "bg-rose-200", selectedBorder: "border-rose-500 bg-rose-50" },
    { key: "nature-and-weather", label: "Nature & Weather", icon: "🌈", color: "bg-teal-100 border-teal-300 hover:border-teal-400", iconBg: "bg-teal-200", selectedBorder: "border-teal-500 bg-teal-50" },
  ],
  vi: [
    { key: "my-favorite-animals", label: "Con Vật Yêu Thích", icon: "🐶", color: "bg-sky-100 border-sky-300 hover:border-sky-400", iconBg: "bg-sky-200", selectedBorder: "border-sky-500 bg-sky-50" },
    { key: "superheroes", label: "Siêu Anh Hùng", icon: "🦸", color: "bg-violet-100 border-violet-300 hover:border-violet-400", iconBg: "bg-violet-200", selectedBorder: "border-violet-500 bg-violet-50" },
    { key: "my-favorite-foods", label: "Món Ăn Ngon", icon: "🍕", color: "bg-orange-100 border-orange-300 hover:border-orange-400", iconBg: "bg-orange-200", selectedBorder: "border-orange-500 bg-orange-50" },
    { key: "space-and-planets", label: "Vũ Trụ & Hành Tinh", icon: "🚀", color: "bg-indigo-100 border-indigo-300 hover:border-indigo-400", iconBg: "bg-indigo-200", selectedBorder: "border-indigo-500 bg-indigo-50" },
    { key: "my-family", label: "Gia Đình Tôi", icon: "👨‍👩‍👧", color: "bg-pink-100 border-pink-300 hover:border-pink-400", iconBg: "bg-pink-200", selectedBorder: "border-pink-500 bg-pink-50" },
    { key: "school-and-friends", label: "Trường Học & Bạn Bè", icon: "🏫", color: "bg-yellow-100 border-yellow-300 hover:border-yellow-400", iconBg: "bg-yellow-200", selectedBorder: "border-yellow-500 bg-yellow-50" },
    { key: "games-and-toys", label: "Trò Chơi & Đồ Chơi", icon: "🎮", color: "bg-green-100 border-green-300 hover:border-green-400", iconBg: "bg-green-200", selectedBorder: "border-green-500 bg-green-50" },
    { key: "dinosaurs", label: "Khủng Long", icon: "🦕", color: "bg-emerald-100 border-emerald-300 hover:border-emerald-400", iconBg: "bg-emerald-200", selectedBorder: "border-emerald-500 bg-emerald-50" },
    { key: "magic-and-fairytales", label: "Phép Thuật & Cổ Tích", icon: "🧙", color: "bg-purple-100 border-purple-300 hover:border-purple-400", iconBg: "bg-purple-200", selectedBorder: "border-purple-500 bg-purple-50" },
    { key: "sports-and-games", label: "Thể Thao & Vận Động", icon: "⚽", color: "bg-cyan-100 border-cyan-300 hover:border-cyan-400", iconBg: "bg-cyan-200", selectedBorder: "border-cyan-500 bg-cyan-50" },
    { key: "cartoons-and-movies", label: "Hoạt Hình & Phim", icon: "🎬", color: "bg-rose-100 border-rose-300 hover:border-rose-400", iconBg: "bg-rose-200", selectedBorder: "border-rose-500 bg-rose-50" },
    { key: "nature-and-weather", label: "Thiên Nhiên & Thời Tiết", icon: "🌈", color: "bg-teal-100 border-teal-300 hover:border-teal-400", iconBg: "bg-teal-200", selectedBorder: "border-teal-500 bg-teal-50" },
  ],
}

const ui = {
  en: {
    heading: "What do you want to talk about?",
    subheading: "Pick a topic and let's chat!",
    startBtn: "Start Talking!",
  },
  vi: {
    heading: "Bạn muốn nói về chủ đề gì?",
    subheading: "Chọn một chủ đề và bắt đầu nói chuyện!",
    startBtn: "Bắt Đầu Nào!",
  },
}

export function QuickChatModal({ isOpen, onClose, onStartChat, language = "en" }: QuickChatModalProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>("my-favorite-animals")
  const t = ui[language]
  const topicList = topics[language]

  const handleStartChat = () => {
    const topic = topicList.find((t) => t.key === selectedTopic)
    if (topic) {
      onStartChat({
        topic: topic.label,
        conversationMode: "casual-chat",
        voice: "nova",
        timeLimit: "5",
      })
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full rounded-3xl p-0 border-0 shadow-2xl overflow-hidden bg-white font-sans">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-400 via-violet-400 to-pink-400 px-6 pt-6 pb-5 text-white">
          <DialogTitle className="text-xl font-extrabold tracking-tight text-white text-balance">
            {t.heading}
          </DialogTitle>
          <p className="text-sm font-semibold text-white/80 mt-1">{t.subheading}</p>
        </div>

        {/* Topic grid */}
        <div className="px-5 py-4 max-h-[52vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-3">
            {topicList.map((topic) => {
              const isSelected = selectedTopic === topic.key
              return (
                <button
                  key={topic.key}
                  onClick={() => setSelectedTopic(topic.key)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-400",
                    isSelected
                      ? cn(topic.selectedBorder, "shadow-md scale-[1.04] border-2")
                      : cn(topic.color, "border-2 hover:scale-[1.02] hover:shadow-sm")
                  )}
                  aria-pressed={isSelected}
                >
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-sm", topic.iconBg)}>
                    {topic.icon}
                  </div>
                  <span className="text-xs font-bold text-foreground leading-tight text-center text-balance">
                    {topic.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-5 pb-5 pt-1">
          <Button
            onClick={handleStartChat}
            className="w-full h-12 rounded-2xl text-base font-extrabold bg-gradient-to-r from-sky-500 to-violet-500 hover:from-sky-600 hover:to-violet-600 text-white shadow-lg shadow-sky-200 hover:shadow-xl transition-all duration-150 hover:scale-[1.01] active:scale-[0.98] border-0"
          >
            <Mic className="w-5 h-5 mr-2" />
            {t.startBtn}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
