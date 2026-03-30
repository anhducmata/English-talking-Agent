"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

interface AnalysisResult {
  componentScores?: {
    fluency: number
    pronunciation: number
    grammar: number
    vocabulary: number
    contentRichness: number
  }
  baseScore?: number
  lengthBonus?: number
  rawScore?: number
  finalScore?: number
  expectationScore: number
  metExpectations?: boolean
  speakingMetrics?: {
    totalWords: number
    estimatedSeconds: number
    idealSeconds: number
    speakingRatio: number
  }
  strengths: string[]
  improvements: string[]
  feedback: string
  suggestions?: Array<{
    type: "sentence" | "vocabulary" | "grammar" | "expression"
    original: string
    alternative: string
    explanation: string
    category: "Grammar" | "Vocabulary" | "Natural Expression" | "Pronunciation Guide"
  }>
}

interface AnalysisResultsProps {
  isAnalyzing: boolean
  analysisResult: AnalysisResult | null
  language: "en" | "vi"
  analysisTranslations: Record<string, string>
  loadingAnalysisTranslations: Record<string, boolean>
  onTranslateAllAnalysis: () => void
  onViewHistory: () => void
}

const translations = {
  en: {
    analyzing: "Analyzing conversation...",
    comprehensiveAnalysis: "Comprehensive Practice Analysis",
    finalScore: "Final Score",
    lengthBonus: "Length Bonus",
    metExpectations: "Met Expectations",
    exceededExpectations: "Exceeded Expectations",
    belowExpectations: "Below Expectations",
    componentBreakdown: "Component Breakdown",
    fluency: "Fluency:",
    pronunciation: "Pronunciation:",
    grammar: "Grammar:",
    vocabulary: "Vocabulary:",
    contentRichness: "Content Richness:",
    speakingMetrics: "Speaking Metrics",
    wordsSpoken: "Words Spoken:",
    speakingTime: "Speaking Time:",
    speakingRatio: "Speaking Ratio:",
    strengths: "Strengths",
    areasToImprove: "Areas to Improve",
    detailedFeedback: "Detailed Feedback",
    improvementSuggestions: "Improvement Suggestions",
    original: "Original:",
    better: "Better:",
    why: "Why:",
    viewHistory: "View Full Conversation",
  },
  vi: {
    analyzing: "Đang phân tích hội thoại...",
    comprehensiveAnalysis: "Phân Tích Luyện Tập Toàn Diện",
    finalScore: "Điểm Cuối",
    lengthBonus: "Thưởng Độ Dài",
    metExpectations: "Đạt Kỳ Vọng",
    exceededExpectations: "Vượt Kỳ Vọng",
    belowExpectations: "Chưa Đạt Kỳ Vọng",
    componentBreakdown: "Phân Tích Chi Tiết",
    fluency: "Lưu loát:",
    pronunciation: "Phát âm:",
    grammar: "Ngữ pháp:",
    vocabulary: "Từ vựng:",
    contentRichness: "Nội dung phong phú:",
    speakingMetrics: "Thống Kê Nói",
    wordsSpoken: "Số từ nói:",
    speakingTime: "Thời gian nói:",
    speakingRatio: "Tỷ lệ nói:",
    strengths: "Điểm Mạnh",
    areasToImprove: "Cần Cải Thiện",
    detailedFeedback: "Nhận Xét Chi Tiết",
    improvementSuggestions: "Gợi Ý Cải Thiện",
    original: "Gốc:",
    better: "Tốt hơn:",
    why: "Tại sao:",
    viewHistory: "Xem Toàn Bộ Hội Thoại",
  },
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
  const t = translations[language]

  const getComponentScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400"
    if (score >= 60) return "text-yellow-400"
    if (score >= 40) return "text-orange-400"
    return "text-red-400"
  }

  const getExpectationStatus = (expectationScore: number, metExpectations?: boolean) => {
    if (expectationScore >= 8) {
      return {
        text: t.exceededExpectations,
        color: "text-emerald-400",
        icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
      }
    } else if (expectationScore >= 6 || metExpectations) {
      return {
        text: t.metExpectations,
        color: "text-blue-400",
        icon: <CheckCircle className="w-4 h-4 text-blue-400" />,
      }
    } else {
      return {
        text: t.belowExpectations,
        color: "text-orange-400",
        icon: <XCircle className="w-4 h-4 text-orange-400" />,
      }
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Grammar":
        return "bg-blue-900/20 border-blue-800/30 text-blue-300"
      case "Vocabulary":
        return "bg-green-900/20 border-green-800/30 text-green-300"
      case "Natural Expression":
        return "bg-purple-900/20 border-purple-800/30 text-purple-300"
      case "Pronunciation Guide":
        return "bg-orange-900/20 border-orange-800/30 text-orange-300"
      default:
        return "bg-gray-900/20 border-gray-800/30 text-gray-300"
    }
  }

  if (isAnalyzing && !analysisResult) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center min-h-[200px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
        <p className="text-lg font-bold text-gray-300">{t.analyzing}</p>
      </div>
    )
  }

  if (!analysisResult) return null

  return (
    <div className="mt-8 space-y-4">
      <Card className="border border-gray-800 bg-black backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-white">{t.comprehensiveAnalysis}</CardTitle>
            <button
              onClick={onTranslateAllAnalysis}
              disabled={loadingAnalysisTranslations["all"]}
              className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              {loadingAnalysisTranslations["all"] ? (
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
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enhanced Scoring Display */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">
                {analysisResult.finalScore
                  ? `${analysisResult.finalScore}/100`
                  : `${analysisResult.expectationScore}/10`}
              </div>
              <div className="text-xs text-gray-400">{t.finalScore}</div>
              {analysisResult.lengthBonus && (
                <div className="text-xs text-blue-300 mt-1">
                  {t.lengthBonus}: {analysisResult.lengthBonus.toFixed(2)}x
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                {getExpectationStatus(analysisResult.expectationScore, analysisResult.metExpectations).icon}
                <div
                  className={`text-2xl font-bold ${getExpectationStatus(analysisResult.expectationScore, analysisResult.metExpectations).color
                    }`}
                >
                  {analysisResult.expectationScore}/10
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {getExpectationStatus(analysisResult.expectationScore, analysisResult.metExpectations).text}
              </div>
            </div>
          </div>

          {/* Component Scores Breakdown */}
          {analysisResult.componentScores && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-purple-400">{t.componentBreakdown}</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex justify-start gap-2">
                  <span className="text-gray-300">{t.fluency}</span>
                  <span className={`font-bold ${getComponentScoreColor(analysisResult.componentScores.fluency)}`}>
                    {analysisResult.componentScores.fluency}/100
                  </span>
                </div>
                <div className="flex justify-start gap-2">
                  <span className="text-gray-300">{t.pronunciation}</span>
                  <span className={`font-bold ${getComponentScoreColor(analysisResult.componentScores.pronunciation)}`}>
                    {analysisResult.componentScores.pronunciation}/100
                  </span>
                </div>
                <div className="flex justify-start gap-2">
                  <span className="text-gray-300">{t.grammar}</span>
                  <span className={`font-bold ${getComponentScoreColor(analysisResult.componentScores.grammar)}`}>
                    {analysisResult.componentScores.grammar}/100
                  </span>
                </div>
                <div className="flex justify-start gap-2">
                  <span className="text-gray-300">{t.vocabulary}</span>
                  <span className={`font-bold ${getComponentScoreColor(analysisResult.componentScores.vocabulary)}`}>
                    {analysisResult.componentScores.vocabulary}/100
                  </span>
                </div>
                <div className="flex justify-start gap-2 col-span-2">
                  <span className="text-gray-300">{t.contentRichness}</span>
                  <span
                    className={`font-bold ${getComponentScoreColor(analysisResult.componentScores.contentRichness)}`}
                  >
                    {analysisResult.componentScores.contentRichness}/100
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Speaking Metrics */}
          {analysisResult.speakingMetrics && (
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-cyan-400">{t.speakingMetrics}</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex justify-start gap-2">
                  <span className="text-gray-300">{t.wordsSpoken}</span>
                  <span className="text-white font-bold">{analysisResult.speakingMetrics.totalWords}</span>
                </div>
                <div className="flex justify-start gap-2">
                  <span className="text-gray-300">{t.speakingTime}</span>
                  <span className="text-white font-bold">{analysisResult.speakingMetrics.estimatedSeconds}s</span>
                </div>
                <div className="flex justify-start gap-2 col-span-2">
                  <span className="text-gray-300">{t.speakingRatio}</span>
                  <span
                    className={`font-bold ${analysisResult.speakingMetrics.speakingRatio >= 0.8
                        ? "text-emerald-400"
                        : analysisResult.speakingMetrics.speakingRatio >= 0.5
                          ? "text-yellow-400"
                          : "text-orange-400"
                      }`}
                  >
                    {(analysisResult.speakingMetrics.speakingRatio * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-sm text-emerald-400 mb-2">{t.strengths}</h4>
              <ul className="text-xs text-gray-300 space-y-1">
                {analysisResult.strengths.map((strength, index) => (
                  <li key={index}>• {strength}</li>
                ))}
              </ul>
              {analysisTranslations["strengths"] && (
                <div className="mt-2 pt-2 border-t border-gray-500/30">
                  <p className="text-xs text-gray-300 italic leading-relaxed">{analysisTranslations["strengths"]}</p>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-bold text-sm text-orange-400 mb-2">{t.areasToImprove}</h4>
              <ul className="text-xs text-gray-300 space-y-1">
                {analysisResult.improvements.map((improvement, index) => (
                  <li key={index}>• {improvement}</li>
                ))}
              </ul>
              {analysisTranslations["improvements"] && (
                <div className="mt-2 pt-2 border-t border-gray-500/30">
                  <p className="text-xs text-gray-300 italic leading-relaxed">{analysisTranslations["improvements"]}</p>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-bold text-sm text-blue-400 mb-2">{t.detailedFeedback}</h4>
              <p className="text-xs text-gray-300 leading-relaxed">{analysisResult.feedback}</p>
              {analysisTranslations["feedback"] && (
                <div className="mt-2 pt-2 border-t border-gray-500/30">
                  <p className="text-xs text-gray-300 italic leading-relaxed">{analysisTranslations["feedback"]}</p>
                </div>
              )}
            </div>

            {/* Enhanced Suggestions Section */}
            {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
              <div>
                <h4 className="font-bold text-sm text-purple-400 mb-3">{t.improvementSuggestions}</h4>
                <div className="space-y-3">
                  {analysisResult.suggestions.map((suggestion, index) => {
                    const translatedSuggestion = Array.isArray(analysisTranslations["suggestions"])
                      ? analysisTranslations["suggestions"].find((ts: any) => ts.index === index)
                      : null;

                    return (
                      <div key={index} className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold border ${getCategoryColor(suggestion.category)}`}
                          >
                            {translatedSuggestion?.category || suggestion.category}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">{suggestion.type}</span>
                        </div>

                        <div className="space-y-1">
                          <div className="text-xs">
                            <span className="text-red-400 font-semibold">{t.original}</span>
                            <span className="text-gray-300 ml-2">"{suggestion.original}"</span>
                            {translatedSuggestion && (
                              <div className="mt-1 ml-4 text-gray-400 italic">
                                "{translatedSuggestion.original}"
                              </div>
                            )}
                          </div>
                          <div className="text-xs">
                            <span className="text-emerald-400 font-semibold">{t.better}</span>
                            <span className="text-white ml-2 font-medium">"{suggestion.alternative}"</span>
                            {translatedSuggestion && (
                              <div className="mt-1 ml-4 text-gray-200 italic font-medium">
                                "{translatedSuggestion.alternative}"
                              </div>
                            )}
                          </div>
                          <div className="text-xs">
                            <span className="text-blue-400 font-semibold">{t.why}</span>
                            <span className="text-gray-300 ml-2">{suggestion.explanation}</span>
                            {translatedSuggestion && (
                              <div className="mt-1 ml-4 text-gray-400 italic">
                                {translatedSuggestion.explanation}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button
          onClick={onViewHistory}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 bg-transparent"
        >
          {t.viewHistory}
        </Button>
      </div>
    </div>
  )
}
