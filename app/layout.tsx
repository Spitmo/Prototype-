import type React from "react"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

export const metadata = {
  title: "MindCare Campus - Digital Psychological Intervention System",
  description: "Confidential, culturally-sensitive mental health support for college students",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
      <head>
        {/* ✅ Favicon for browser tab */}
        <link rel="icon" href="/favicon (1).ico" />
      </head>
      <body>{children}</body>
    </html>
  )
}
