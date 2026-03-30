import type { Metadata, Viewport } from "next"
import { Fredoka, Nunito } from 'next/font/google'
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { NavigationProgress } from "@/components/navigation-progress"

const fredoka = Fredoka({ 
  subsets: ["latin"],
  variable: '--font-fredoka',
  weight: ['300', '400', '500', '600', '700'],
})

const nunito = Nunito({ 
  subsets: ["latin", "vietnamese"],
  variable: '--font-nunito',
})

export const metadata: Metadata = {
  title: "Mata - Learn English with Fun!",
  description: "Practice English speaking with Mata the Owl - a friendly AI companion for kids aged 6-12",
  generator: 'v0.dev'
}

export const viewport: Viewport = {
  themeColor: '#4FC3F7',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fredoka.variable} ${nunito.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <NavigationProgress />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
