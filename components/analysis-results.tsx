"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle,
  AlertCircle,
  MessageSquare,
  TrendingUp,
  Languages,
  Brain,
  Target,
  Lightbulb,
  History,
} from "lucide-react"

interface AnalysisResultsProps {
  isAnalyzing: boolean
  analysisResult: any
  language: "en" | "vi"
  analysisTranslations: Record<string, string>
  loadingAnalysisTranslations: Record<string, boolean>
  onTranslateAllAnalysis: () => void
  onViewHistory: () => void
}

export function AnalysisResults({
  isAnalyzing,
  analysisResult,
  language,
  analysisTranslations,
  loadingAnalysisTranslations,
  onTranslateAllAnalysis,
  onViewHistory,
}: AnalysisResultsProps) {
  if (isAnalyzing) {
    return (
      <Card className="bg-gray-900 border-gray-700 mt-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-400" />
            {language === "en" ? "Analyzing Your Performance..." : "Đang phân tích hiệu suất của bạn..."}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
              <span className="text-gray-300">
                {language === "en"
                  ? "Processing your conversation and generating insights..."
                  : "Đang xử lý cuộc trò chuyện và tạo thông tin chi tiết..."}
              </span>
            </div>
            <Progress value={65} className="w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analysisResult) {
    return null
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-400"
    if (score >= 6) return "text-yellow-400"
    return "text-red-400"
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 8) return "bg-green-500/20 text-green-400"
    if (score >= 6) return "bg-yellow-500/20 text-yellow-400"
    return "bg-red-500/20 text-red-400"
  }

  const renderSkillBreakdown = () => {
    if (analysisResult.mode === "interview" && analysisResult.interviewSkills) {
      return (
        <div className="space-y-3">
          <h4 className="font-semibold text-white flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-400" />
            {language === "en" ? "Interview Skills" : "Kỹ năng phỏng vấn"}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(analysisResult.interviewSkills).map(([skill, score]) => (
              <div key={skill} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                <span className="text-gray-300 capitalize">
                  {skill === "technicalKnowledge" ? "Technical Knowledge" : skill}
                </span>
                <Badge className={getScoreBadgeColor(score as number)}>{score}/10</Badge>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (analysisResult.mode === "speaking-practice" && analysisResult.languageSkills) {
      return (
        <div className="space-y-3">
          <h4 className="font-semibold text-white flex items-center gap-2">
            <Languages className="h-4 w-4 text-blue-400" />
            {language === "en" ? "Language Skills" : "Kỹ năng ngôn ngữ"}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(analysisResult.languageSkills).map(([skill, score]) => (
              <div key={skill} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                <span className="text-gray-300 capitalize">{skill}</span>
                <Badge className={getScoreBadgeColor(score as number)}>{score}/10</Badge>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <Card className="bg-gray-900 border-gray-700 mt-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-400" />
            {language === "en" ? "Performance Analysis" : "Phân tích hiệu suất"}
          </CardTitle>
          <div className="flex items-center gap-2">
            {language === "en" && (
              <Button
                variant="outline"
                size="sm"
                onClick={onTranslateAllAnalysis}
                disabled={loadingAnalysisTranslations.all}
                className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
              >
                {loadingAnalysisTranslations.all ? "Translating..." : "Translate to Vietnamese"}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onViewHistory}
              className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
            >
              <History className="h-4 w-4 mr-1" />
              {language === "en" ? "View History" : "Xem lịch sử"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Score */}
        {analysisResult.overallScore && (
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-blue-400" />
              <div>
                <h3 className="font-semibold text-white">
                  {language === "en" ? "Overall Performance" : "Hiệu suất tổng thể"}
                </h3>
                <p className="text-gray-400 text-sm">
                  {language === "en" ? "Your session score" : "Điểm phiên của bạn"}
                </p>
              </div>
            </div>
            <Badge className={`${getScoreBadgeColor(analysisResult.overallScore)} text-lg px-3 py-1`}>
              {analysisResult.overallScore}/10
            </Badge>
          </div>
        )}

        {/* Skill Breakdown */}
        {renderSkillBreakdown()}

        {/* Strengths */}
        {analysisResult.strengths && analysisResult.strengths.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              {language === "en" ? "Strengths" : "Điểm mạnh"}
            </h4>
            <div className="space-y-2">
              {analysisResult.strengths.map((strength: string, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 bg-green-500/10 rounded border-l-2 border-green-500"
                >
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">
                    {analysisTranslations.strengths && analysisTranslations.all
                      ? analysisTranslations.strengths.split(". ")[index]
                      : strength}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Areas for Improvement */}
        {analysisResult.improvements && analysisResult.improvements.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              {language === "en" ? "Areas for Improvement" : "Lĩnh vực cần cải thiện"}
            </h4>
            <div className="space-y-2">
              {analysisResult.improvements.map((improvement: string, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 bg-yellow-500/10 rounded border-l-2 border-yellow-500"
                >
                  <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">
                    {analysisTranslations.improvements && analysisTranslations.all
                      ? analysisTranslations.improvements.split(". ")[index]
                      : improvement}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Feedback */}
        {analysisResult.feedback && (
          <div className="space-y-3">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-400" />
              {language === "en" ? "Detailed Feedback" : "Phản hồi chi tiết"}
            </h4>
            <div className="p-4 bg-gray-800 rounded-lg">
              <p className="text-gray-300 leading-relaxed">
                {analysisTranslations.feedback && analysisTranslations.all
                  ? analysisTranslations.feedback
                  : analysisResult.feedback}
              </p>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-purple-400" />
              {language === "en" ? "Suggestions" : "Đề xuất"}
            </h4>
            <div className="space-y-3">
              {analysisResult.suggestions.map((suggestion: any, index: number) => (
                <div key={index} className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="text-purple-400 border-purple-400 text-xs">
                      {suggestion.category}
                    </Badge>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-red-300 text-sm">
                      <span className="font-medium">Original:</span> "{suggestion.original}"
                    </p>
                    <p className="text-green-300 text-sm">
                      <span className="font-medium">Better:</span> "{suggestion.alternative}"
                    </p>
                    <p className="text-gray-400 text-xs">{suggestion.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator className="bg-gray-700" />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={onViewHistory}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
          >
            <History className="h-4 w-4 mr-2" />
            {language === "en" ? "View Full History" : "Xem toàn bộ lịch sử"}
          </Button>
          <Button onClick={() => (window.location.href = "/")} className="bg-blue-600 hover:bg-blue-700 text-white">
            {language === "en" ? "Start New Session" : "Bắt đầu phiên mới"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
