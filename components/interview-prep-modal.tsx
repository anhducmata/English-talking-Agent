"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Loader2, Briefcase } from "lucide-react"

export interface InterviewData {
  jobTitle: string
  company?: string
  experienceLevel: string
  jobDescription?: string
  interviewContext: string
}

interface InterviewPrepModalProps {
  isOpen: boolean
  onClose: () => void
  onPrepComplete: (data: InterviewData) => void
  language: "en" | "vi"
}

const translations = {
  en: {
    interviewPrep: "Interview Preparation",
    jobTitle: "Job Title / Position",
    jobTitlePlaceholder: "e.g., Software Engineer, Marketing Manager, Teacher...",
    company: "Company (Optional)",
    companyPlaceholder: "e.g., Google, Microsoft, Local School...",
    experienceLevel: "Experience Level",
    jobDescription: "Job Description (Optional)",
    jobDescriptionPlaceholder: "Paste the job description or key requirements...",
    experienceLevels: {
      entry: "Entry Level (0-2 years)",
      mid: "Mid Level (3-5 years)",
      senior: "Senior Level (6+ years)",
      executive: "Executive/Leadership",
    },
    preparing: "Preparing interview...",
    startInterview: "Start Interview",
    error: "Failed to prepare interview. Please try again.",
    description: "Provide some details about the position to get relevant interview questions and practice scenarios.",
  },
  vi: {
    interviewPrep: "Chuẩn Bị Phỏng Vấn",
    jobTitle: "Chức Danh / Vị Trí",
    jobTitlePlaceholder: "ví dụ: Kỹ sư phần mềm, Quản lý Marketing, Giáo viên...",
    company: "Công Ty (Tùy chọn)",
    companyPlaceholder: "ví dụ: Google, Microsoft, Trường học địa phương...",
    experienceLevel: "Mức Độ Kinh Nghiệm",
    jobDescription: "Mô Tả Công Việc (Tùy chọn)",
    jobDescriptionPlaceholder: "Dán mô tả công việc hoặc yêu cầu chính...",
    experienceLevels: {
      entry: "Mới Vào Nghề (0-2 năm)",
      mid: "Trung Cấp (3-5 năm)",
      senior: "Cao Cấp (6+ năm)",
      executive: "Điều Hành/Lãnh Đạo",
    },
    preparing: "Đang chuẩn bị phỏng vấn...",
    startInterview: "Bắt Đầu Phỏng Vấn",
    error: "Không thể chuẩn bị phỏng vấn. Vui lòng thử lại.",
    description: "Cung cấp một số chi tiết về vị trí để nhận được câu hỏi phỏng vấn phù hợp và kịch bản luyện tập.",
  },
}

export function InterviewPrepModal({ isOpen, onClose, onPrepComplete, language }: InterviewPrepModalProps) {
  const [jobTitle, setJobTitle] = useState("")
  const [company, setCompany] = useState("")
  const [experienceLevel, setExperienceLevel] = useState("mid")
  const [jobDescription, setJobDescription] = useState("")
  const [isPreparing, setIsPreparing] = useState(false)
  const [error, setError] = useState("")

  const t = translations[language]

  const handlePrepare = async () => {
    if (!jobTitle.trim()) return

    setIsPreparing(true)
    setError("")

    try {
      const response = await fetch("/api/prepare-interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobTitle,
          company,
          experienceLevel,
          jobDescription,
          language,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to prepare interview")
      }

      const data = await response.json()

      const interviewData: InterviewData = {
        jobTitle,
        company,
        experienceLevel,
        jobDescription,
        interviewContext: data.interviewContext,
      }

      onPrepComplete(interviewData)
    } catch (err) {
      setError(t.error)
    } finally {
      setIsPreparing(false)
    }
  }

  const handleClose = () => {
    if (!isPreparing) {
      setJobTitle("")
      setCompany("")
      setExperienceLevel("mid")
      setJobDescription("")
      setError("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-white border border-gray-300 shadow-lg rounded-lg p-0">
        <DialogHeader className="p-4 pb-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-gray-700" />
              <DialogTitle className="text-lg font-semibold text-black">{t.interviewPrep}</DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose} className="h-5 w-5 p-0" disabled={isPreparing}>
              <X className="w-3 h-3 text-gray-500" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-600">{t.description}</p>

          {/* Job Title */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1 block">{t.jobTitle}</Label>
            <Input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder={t.jobTitlePlaceholder}
              className="border-gray-300 focus:border-black focus:ring-black text-sm"
              disabled={isPreparing}
            />
          </div>

          {/* Company */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1 block">{t.company}</Label>
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder={t.companyPlaceholder}
              className="border-gray-300 focus:border-black focus:ring-black text-sm"
              disabled={isPreparing}
            />
          </div>

          {/* Experience Level */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1 block">{t.experienceLevel}</Label>
            <Select value={experienceLevel} onValueChange={setExperienceLevel} disabled={isPreparing}>
              <SelectTrigger className="border-gray-300 focus:border-black focus:ring-0 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry" className="text-sm">
                  {t.experienceLevels.entry}
                </SelectItem>
                <SelectItem value="mid" className="text-sm">
                  {t.experienceLevels.mid}
                </SelectItem>
                <SelectItem value="senior" className="text-sm">
                  {t.experienceLevels.senior}
                </SelectItem>
                <SelectItem value="executive" className="text-sm">
                  {t.experienceLevels.executive}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Job Description */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1 block">{t.jobDescription}</Label>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder={t.jobDescriptionPlaceholder}
              className="border-gray-300 focus:border-black focus:ring-black min-h-[80px] resize-none text-sm"
              disabled={isPreparing}
            />
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 flex justify-end border-t">
          <Button
            onClick={handlePrepare}
            disabled={!jobTitle.trim() || isPreparing}
            className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md font-medium text-sm h-8 disabled:opacity-50"
          >
            {isPreparing ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                {t.preparing}
              </>
            ) : (
              t.startInterview
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
