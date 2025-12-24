"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Upload, Terminal, Cpu, Zap, Menu, X, MessageCircle } from "lucide-react"

// Telegram icon component
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  )
}

export function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-14 sm:h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="relative">
            <Terminal className="h-5 w-5 sm:h-6 sm:w-6 text-primary glow" />
            <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-accent absolute -top-1 -right-1 animate-pulse" />
          </div>
          <span className="font-bold text-base sm:text-lg tracking-wider">
            <span className="text-primary glow">VIBE</span>
            <span className="text-muted-foreground hidden sm:inline">_</span>
            <span className="text-foreground hidden sm:inline">CODERS</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/"
            className={cn(
              "transition-all hover:text-primary hover:glow",
              pathname === "/"
                ? "text-primary glow"
                : "text-muted-foreground"
            )}
          >
            {">"} leaderboard
          </Link>
          <Link
            href="/models"
            className={cn(
              "transition-all hover:text-primary hover:glow",
              pathname === "/models"
                ? "text-primary glow"
                : "text-muted-foreground"
            )}
          >
            <span className="flex items-center gap-1">
              <Cpu className="h-4 w-4" />
              models
            </span>
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <a
            href="https://t.me/CURSORVIBES"
            target="_blank"
            rel="noopener noreferrer"
            title="Join Telegram: Exchange vibes, share insights, connect with the community!"
            className="hidden sm:block"
          >
            <Button size="sm" className="gap-1 glow-box hover:glow transition-all">
              <TelegramIcon className="h-4 w-4" />
              <span>Telegram</span>
            </Button>
          </a>
          <Link href="/upload" className="hidden sm:block">
            <Button size="sm" className="gap-1 glow-box hover:glow transition-all">
              <Upload className="h-4 w-4" />
              <span>Join Leaders</span>
            </Button>
          </Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-primary/20 bg-background/95 backdrop-blur-xl">
          <nav className="container py-4 space-y-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "block py-2 px-3 rounded transition-all font-mono text-sm",
                pathname === "/"
                  ? "text-primary bg-primary/10 glow"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              )}
            >
              {">"} leaderboard
            </Link>
            <Link
              href="/models"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "block py-2 px-3 rounded transition-all font-mono text-sm",
                pathname === "/models"
                  ? "text-primary bg-primary/10 glow"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              )}
            >
              <span className="flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                models
              </span>
            </Link>
            <div className="flex gap-2 pt-2">
              <a
                href="https://t.me/CURSORVIBES"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1"
              >
                <Button size="sm" className="w-full gap-2 glow-box">
                  <TelegramIcon className="h-4 w-4" />
                  Telegram
                </Button>
              </a>
              <Link
                href="/upload"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1"
              >
                <Button size="sm" className="w-full gap-2 glow-box">
                  <Upload className="h-4 w-4" />
                  Join Leaders
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
