"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Clock, Target, MessageSquare, Briefcase, User, Building, Calendar } from "lucide-react"
import type { InterviewData } from "@/components/interview-prep-modal"
import { OwlMascot } from "@/components/owl-mascot"

const translations = {
  en: {
    readyToStart: "Ready to Learn!",
    topic: "Topic",
    difficulty: "Level",
    timeLimit: "Time",
    minutes: "minutes",
    startCall: "Start Talking!",
    casualChat: "Fun Chat",
    speakingPractice: "Practice",
    interview: "Interview",
    interviewDetails: "Interview Details",
    position: "Position",
    company: "Company",
    experienceLevel: "Experience Level",
    interviewType: "Interview Type",
    owlGreeting: "Hi! I am Mata!",
    owlReady: "Ready to practice English together?",
    difficultyLevels: {
      1: "Easy",
      2: "Simple",
      3: "Medium",
      4: "Challenging",
      5: "Expert",
    },
  },
  vi: {
    readyToStart: "San Sang Hoc!",
    topic: "Chu De",
    difficulty: "Cap Do",
    timeLimit: "Thoi Gian",
    minutes: "phut",
    startCall: "Bat Dau Noi!",
    casualChat: "Tro Chuyen Vui",
    speakingPractice: "Luyen Tap",
    interview: "Phong Van",
    interviewDetails: "Chi Tiet Phong Van",
    position: "Vi Tri",
    company: "Cong Ty",
    experienceLevel: "Cap Do Kinh Nghiem",
    interviewType: "Loai Phong Van",
    owlGreeting: "Chao ban! Toi la Mata!",
    owlReady: "San sang luyen tieng Anh cung nhau chua?",
    difficultyLevels: {
      1: "De",
      2: "Don Gian",
      3: "Trung Binh",
      4: "Thach Thuc",
      5: "Chuyen Gia",
    },
  },
}

interface CallStartScreenProps {
  topic: string
  difficulty: number
  actualTimeLimit: number
  language: "en" | "vi"
  onStartCall: () => void
  mode: "casual-chat" | "speaking-practice" | "interview"
  interviewData?: InterviewData | null
}

export function CallStartScreen({
  topic,
  difficulty,
  actualTimeLimit,
  language,
  onStartCall,
  mode,
  interviewData,
}: CallStartScreenProps) {
  const t = translations[language]

  const getModeIcon = () => {
    switch (mode) {
      case "casual-chat":
        return <MessageSquare className="w-5 h-5 text-primary" />
      case "speaking-practice":
        return <Target className="w-5 h-5 text-success" />
      case "interview":
        return <Briefcase className="w-5 h-5 text-secondary" />
      default:
        return <MessageSquare className="w-5 h-5 text-primary" />
    }
  }

  const getModeTitle = () => {
    switch (mode) {
      case "casual-chat":
        return t.casualChat
      case "speaking-practice":
        return t.speakingPractice
      case "interview":
        return t.interview
      default:
        return t.speakingPractice
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-2xl bg-transparent border-none shadow-none rounded-lg text-card-foreground">
        <CardHeader className="text-center pb-4">
          {/* Owl Mascot */}
          <div className="flex justify-center mb-4">
            <OwlMascot 
              state="waving" 
              size="xl" 
              showSpeechBubble 
              speechText={t.owlGreeting}
            />
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            {getModeIcon()}
            <Badge variant="secondary" className="bg-accent text-accent-foreground font-semibold">
              {getModeTitle()}
            </Badge>
          </div>
          <CardTitle className="text-2xl text-foreground font-bold">{t.readyToStart}</CardTitle>
          <p className="text-muted-foreground mt-1">{t.owlReady}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Session Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary/10 rounded-2xl border-2 border-primary/20">
              <MessageSquare className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-sm text-muted-foreground mb-1 font-medium">{t.topic}</div>
              <div className="text-foreground font-bold text-lg">{topic}</div>
            </div>

            <div className="text-center p-4 bg-success/10 rounded-2xl border-2 border-success/20">
              <Target className="w-8 h-8 text-success mx-auto mb-2" />
              <div className="text-sm text-muted-foreground mb-1 font-medium">{t.difficulty}</div>
              <div className="text-foreground font-bold text-lg">
                {t.difficultyLevels[difficulty as keyof typeof t.difficultyLevels]}
              </div>
            </div>

            <div className="text-center p-4 bg-accent/30 rounded-2xl border-2 border-accent/40">
              <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <div className="text-sm text-muted-foreground mb-1 font-medium">{t.timeLimit}</div>
              <div className="text-foreground font-bold text-lg">
                {actualTimeLimit} {t.minutes}
              </div>
            </div>
          </div>

          {/* Interview Details */}
          {mode === "interview" && interviewData && (
            <Card className="bg-secondary/10 border-2 border-secondary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground text-lg flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-secondary" />
                  {t.interviewDetails}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">{t.position}</div>
                      <div className="text-foreground text-sm font-semibold">{interviewData.position}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">{t.company}</div>
                      <div className="text-foreground text-sm font-semibold">{interviewData.company}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">{t.experienceLevel}</div>
                      <div className="text-foreground text-sm font-semibold">{interviewData.experienceLevel}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">{t.interviewType}</div>
                      <div className="text-foreground text-sm font-semibold">{interviewData.interviewType}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Start Button */}
          <div className="text-center pt-4">
            <Button
              onClick={onStartCall}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-6 text-xl font-bold rounded-full shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-6 h-6 mr-2" />
              {t.startCall}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
