"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { generateHiddenImage, getAnimalHint } from "@/lib/quiz-utils"

interface AnimalQuizDisplayProps {
  animal: string
  hidePercentage: number
  difficulty?: "easy" | "medium" | "hard"
  onGuess?: (guess: string, correct: boolean) => void
}

export function AnimalQuizDisplay({
  animal,
  hidePercentage,
  difficulty = "medium",
  onGuess,
}: AnimalQuizDisplayProps) {
  const [hiddenImage, setHiddenImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userGuess, setUserGuess] = useState("")
  const [guessSubmitted, setGuessSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true)
        // Use Unsplash API to get animal images
        const imageUrl = `https://api.unsplash.com/search/photos?query=${animal}&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_API_KEY || "demo"}&per_page=1`

        const response = await fetch(imageUrl)
        const data = await response.json()

        if (data.results && data.results.length > 0) {
          const photoUrl = data.results[0].urls.regular

          // Generate hidden version
          const result = await generateHiddenImage(photoUrl, hidePercentage, getAnimalHint(animal))

          setHiddenImage(result.hiddenImage)
        } else {
          // Fallback: use a placeholder
          setError(`Could not load image for ${animal}`)
        }
      } catch (err) {
        console.error("Error loading image:", err)
        setError("Failed to load image for the quiz")
      } finally {
        setIsLoading(false)
      }
    }

    loadImage()
  }, [animal, hidePercentage])

  const handleSubmitGuess = () => {
    const correct = userGuess.toLowerCase().trim() === animal.toLowerCase()
    setIsCorrect(correct)
    setGuessSubmitted(true)
    onGuess?.(userGuess, correct)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto" />
          <p className="text-gray-600">Loading your quiz...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-6 bg-red-50 rounded-xl">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
      {/* Hidden Image Display */}
      <div className="flex flex-col items-center space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Guess the animal! Can you see {hidePercentage}% of it?</h3>
        {hiddenImage && (
          <div className="relative w-full max-w-sm h-72 bg-gray-200 rounded-lg overflow-hidden shadow-md">
            <img
              src={hiddenImage}
              alt="Hidden animal quiz"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Difficulty Indicator */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm font-medium text-gray-600">Difficulty:</span>
        <div className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-2 h-6 rounded ${
                i <= (difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3)
                  ? "bg-purple-600"
                  : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Hint */}
      <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">Hint: </span>
          {getAnimalHint(animal)}
        </p>
      </div>

      {/* Input Area */}
      {!guessSubmitted ? (
        <div className="space-y-3">
          <input
            type="text"
            value={userGuess}
            onChange={(e) => setUserGuess(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSubmitGuess()}
            placeholder="Type your guess here..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleSubmitGuess}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Submit Guess
          </button>
        </div>
      ) : (
        <div
          className={`p-4 rounded-lg text-center font-semibold ${
            isCorrect
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          {isCorrect ? (
            <div>
              <p className="text-lg">🎉 Correct! It&apos;s a {animal}!</p>
              <p className="text-sm mt-2">Great job guessing the animal!</p>
            </div>
          ) : (
            <div>
              <p className="text-lg">Not quite! The answer was: {animal}</p>
              <p className="text-sm mt-2">Your guess: {userGuess}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
