import { Navigation } from "@/components/Navigation"
import { UploadForm } from "@/components/UploadForm"
import { ExternalLink, Terminal, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function UploadPage() {
  return (
    <>
      <Navigation />
      <main className="container py-6 sm:py-8 relative">
        <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-10 text-center">
            <div className="hidden sm:flex items-center justify-center gap-2 text-xs text-muted-foreground font-mono">
              <span className="text-primary">$</span>
              <span>./join_leaderboard.sh</span>
              <span className="animate-pulse">_</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              <span className="text-primary glow">JOIN</span>
              <span className="text-muted-foreground">_</span>
              <span>THE</span>
              <span className="text-primary hidden sm:inline">::</span>
              <br className="sm:hidden" />
              <span className="text-accent">MATRIX</span>
            </h1>
            <p className="text-muted-foreground font-mono text-xs sm:text-sm">
              {"// Upload your Cursor CSV to compete (monthly stats)"}
            </p>
            <div className="mt-3 sm:mt-4 inline-block bg-primary/10 border border-primary/30 rounded-lg px-4 py-2">
              <p className="text-primary font-mono text-xs sm:text-sm font-bold">
                {"// EARN XP: 100 + 10/req + 1/1M tokens"}
              </p>
            </div>
          </div>

          {/* Instructions Card */}
          <div className="mb-6 sm:mb-8 rounded-lg border border-primary/20 bg-card/50 p-4 sm:p-6 glow-border">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Terminal className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="font-mono text-primary text-sm sm:text-base">HOW_TO_EXPORT</h2>
            </div>

            <div className="space-y-3 sm:space-y-4 font-mono text-xs sm:text-sm">
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-primary font-bold w-5 sm:w-6 shrink-0">[1]</span>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground">Sign in to Cursor Dashboard</p>
                  <Link
                    href="https://cursor.com/dashboard?tab=usage"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-accent hover:text-primary transition-colors mt-1 text-[10px] sm:text-xs break-all"
                  >
                    cursor.com/dashboard
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-primary font-bold w-5 sm:w-6 shrink-0">[2]</span>
                <div className="flex-1">
                  <p className="text-foreground">Go to Usage tab</p>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-primary font-bold w-5 sm:w-6 shrink-0">[3]</span>
                <div className="flex-1">
                  <p className="text-foreground">Click &quot;Download CSV&quot;</p>
                  <p className="text-muted-foreground text-[10px] sm:text-xs mt-0.5">{"// Default period is 1 month"}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-primary font-bold w-5 sm:w-6 shrink-0">[4]</span>
                <div className="flex-1">
                  <p className="text-foreground">Upload below with your name</p>
                </div>
              </div>
            </div>

            {/* Screenshot */}
            <div className="mt-4 sm:mt-6 rounded-lg overflow-hidden border border-primary/20">
              <Image
                src="/how_to_export.png"
                alt="How to export CSV from Cursor Dashboard"
                width={800}
                height={400}
                className="w-full h-auto"
              />
            </div>

            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-primary/10">
              <Link
                href="https://cursor.com/dashboard?tab=usage"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs sm:text-sm bg-primary/10 hover:bg-primary/20 text-primary px-3 sm:px-4 py-2 rounded transition-colors font-mono"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <UploadForm />

          <div className="mt-6 sm:mt-8 text-center space-y-1">
            <p className="text-[10px] sm:text-xs text-muted-foreground font-mono">
              {"// Cursor only (for now). Claude Code & others coming soon."}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-mono">
              {"// Data processed locally. Only aggregates stored."}
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
