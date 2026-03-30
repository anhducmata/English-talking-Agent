/**
 * Quiz utilities for generating partially hidden images
 * Used for animal guessing games and other visual puzzles
 */

export interface HiddenImageResult {
  originalImage: string
  hiddenImage: string
  hidePercentage: number
  hint?: string
}

/**
 * Hides a portion of an image by covering it with a blur or overlay effect
 * @param imageUrl - The URL of the image to hide
 * @param hidePercentage - Percentage of image to hide (25 = 1/4, 50 = 1/2)
 * @param hint - Optional hint text for the quiz
 * @returns Promise with the original image and hidden version
 */
export async function generateHiddenImage(
  imageUrl: string,
  hidePercentage: number = 50,
  hint?: string
): Promise<HiddenImageResult> {
  // Check if we're in a browser environment
  if (typeof document === "undefined" || typeof window === "undefined") {
    throw new Error("generateHiddenImage can only be called on the client side")
  }

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      reject(new Error("Could not get canvas context"))
      return
    }

    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      // Draw original image
      ctx.drawImage(img, 0, 0)

      // Create hidden version - apply blur effect to random sections
      const hiddenCanvas = document.createElement("canvas")
      const hiddenCtx = hiddenCanvas.getContext("2d")

      if (!hiddenCtx) {
        reject(new Error("Could not get hidden canvas context"))
        return
      }

      hiddenCanvas.width = img.width
      hiddenCanvas.height = img.height

      // Draw the image on the hidden canvas
      hiddenCtx.drawImage(img, 0, 0)

      // Calculate hide area based on percentage
      const hideArea = hidePercentage / 100
      const numSections = hidePercentage <= 25 ? 4 : hidePercentage <= 50 ? 2 : 1

      if (hidePercentage === 25) {
        // Hide 1/4 - hide bottom right corner
        const width = img.width / 2
        const height = img.height / 2
        hiddenCtx.fillStyle = "rgba(200, 200, 200, 0.9)"
        hiddenCtx.fillRect(width, height, width, height)
        // Add blur effect
        hiddenCtx.filter = "blur(15px)"
        hiddenCtx.fillRect(width, height, width, height)
        hiddenCtx.filter = "none"
      } else if (hidePercentage === 50) {
        // Hide 1/2 - hide right half
        const width = img.width / 2
        hiddenCtx.fillStyle = "rgba(200, 200, 200, 0.9)"
        hiddenCtx.fillRect(width, 0, width, img.height)
        // Add blur effect
        hiddenCtx.filter = "blur(20px)"
        hiddenCtx.fillRect(width, 0, width, img.height)
        hiddenCtx.filter = "none"
      } else if (hidePercentage === 75) {
        // Hide 3/4 - hide everything except top left
        const width = img.width / 2
        const height = img.height / 2
        hiddenCtx.fillStyle = "rgba(200, 200, 200, 0.9)"
        // Right half
        hiddenCtx.fillRect(width, 0, width, img.height)
        // Bottom half
        hiddenCtx.fillRect(0, height, img.width, height)
        // Add blur effect
        hiddenCtx.filter = "blur(20px)"
        hiddenCtx.fillRect(width, 0, width, img.height)
        hiddenCtx.fillRect(0, height, img.width, height)
        hiddenCtx.filter = "none"
      }

      const originalDataUrl = canvas.toDataURL("image/png")
      const hiddenDataUrl = hiddenCanvas.toDataURL("image/png")

      resolve({
        originalImage: imageUrl,
        hiddenImage: hiddenDataUrl,
        hidePercentage,
        hint,
      })
    }

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${imageUrl}`))
    }

    img.src = imageUrl
  })
}

/**
 * Generate a random animal for quiz
 * Used by AI to create animal guessing games
 */
export interface AnimalQuizData {
  animal: string
  hiddenImage: string
  hint: string
  hidePercentage: number
}

export function getRandomAnimal(): string {
  const animals = [
    "lion",
    "elephant",
    "giraffe",
    "zebra",
    "monkey",
    "tiger",
    "bear",
    "penguin",
    "dolphin",
    "eagle",
    "rabbit",
    "fox",
    "deer",
    "owl",
    "snake",
    "crocodile",
    "panda",
    "kangaroo",
    "flamingo",
    "turtle",
  ]

  return animals[Math.floor(Math.random() * animals.length)]
}

/**
 * Get a hint for an animal based on characteristics
 */
export function getAnimalHint(animal: string): string {
  const hints: Record<string, string> = {
    lion: "I am the king of the jungle and I have a big mane!",
    elephant: "I am the biggest land animal and I have a long trunk!",
    giraffe: "I am the tallest animal and I have a very long neck!",
    zebra: "I have black and white stripes!",
    monkey: "I love bananas and I swing on trees!",
    tiger: "I have orange fur with black stripes!",
    bear: "I am big and strong and I like honey!",
    penguin: "I am black and white and I live in Antarctica!",
    dolphin: "I am a smart marine animal that loves to play!",
    eagle: "I am a big bird and I can fly very high!",
    rabbit: "I have long ears and I hopping!",
    fox: "I am clever and I have a fluffy tail!",
    deer: "I have antlers and I run very fast!",
    owl: "I am a night bird and I can see in the dark!",
    snake: "I have no legs and I slither on the ground!",
    crocodile: "I have big teeth and I live in water!",
    panda: "I am black and white and I eat bamboo!",
    kangaroo: "I hop on my strong back legs!",
    flamingo: "I am pink and I stand on one leg!",
    turtle: "I am slow and I have a hard shell!",
  }

  return hints[animal.toLowerCase()] || "Can you guess what animal I am?"
}

