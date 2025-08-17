import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ConnectionStatus } from "./components/connection-status"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MedAI Platform - AI-Powered Medical Predictions",
  description: "Advanced symptom analysis using Django, React, MongoDB, and Groq AI integration",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <ConnectionStatus />
      </body>
    </html>
  )
}
