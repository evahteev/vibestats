import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LukaWidget } from "@/components/LukaWidget"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Vibe Coders Leaderboard",
  description: "See who's vibing the hardest with AI coding tools",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          {children}
        </div>
        <LukaWidget />
      </body>
    </html>
  )
}
