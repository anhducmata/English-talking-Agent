import type { Metadata, Viewport } from "next"
import { Nunito, Nunito_Sans } from 'next/font/google'
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const nunito = Nunito({ 
  subsets: ["latin", "vietnamese"],
  variable: '--font-nunito',
})

const nunitoSans = Nunito_Sans({ 
  subsets: ["latin", "vietnamese"],
  variable: '--font-nunito-sans',
})

export const metadata: Metadata = {
  title: "Ollie - Learn English with Fun!",
  description: "Practice English speaking with Ollie the Owl - a friendly AI companion for kids aged 6-12",
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
      <body className={`${nunito.variable} ${nunitoSans.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
