import { Navigation } from "@/components/Navigation"
import { Zap, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export default function XpPage() {
  return (
    <>
      <Navigation />
      <main className="container py-6 sm:py-8 relative">
        <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-10 text-center">
            <div className="hidden sm:flex items-center justify-center gap-2 text-xs text-muted-foreground font-mono">
              <span className="text-primary">$</span>
              <span>cat /docs/xp_system.md</span>
              <span className="animate-pulse">_</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              <span className="text-primary glow">XP</span>
              <span className="text-primary hidden sm:inline">::</span>
              <br className="sm:hidden" />
              <span className="text-accent">SYSTEM</span>
            </h1>
            <p className="text-muted-foreground font-mono text-xs sm:text-sm">
              {"// Experience points for vibe coders"}
            </p>
          </div>

          {/* Formula Section */}
          <div className="mb-6 sm:mb-8 rounded-lg border border-primary/20 bg-card/50 p-4 sm:p-6 glow-border">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-primary" />
              <h2 className="font-mono text-primary text-sm sm:text-base">XP_FORMULA</h2>
            </div>

            <div className="bg-background/50 rounded-lg p-4 border border-primary/10 mb-4">
              <code className="text-sm sm:text-base text-primary font-mono">
                XP = 100 + (requests * 10) + floor(tokens / 1M)
              </code>
            </div>

            <div className="space-y-3 font-mono text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold w-6 shrink-0">[+]</span>
                <div>
                  <span className="text-accent font-bold">100 XP</span>
                  <span className="text-muted-foreground"> - Join bonus for uploading</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold w-6 shrink-0">[+]</span>
                <div>
                  <span className="text-accent font-bold">10 XP</span>
                  <span className="text-muted-foreground"> - Per request made</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold w-6 shrink-0">[+]</span>
                <div>
                  <span className="text-accent font-bold">1 XP</span>
                  <span className="text-muted-foreground"> - Per 1,000,000 tokens used</span>
                </div>
              </div>
            </div>
          </div>

          {/* Examples Section */}
          <div className="mb-6 sm:mb-8 rounded-lg border border-primary/20 bg-card/50 p-4 sm:p-6">
            <h2 className="font-mono text-primary text-sm sm:text-base mb-4">EXAMPLES</h2>

            <div className="space-y-3 font-mono text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 p-3 bg-background/30 rounded-lg">
                <span className="text-muted-foreground">450M tokens, 1200 req</span>
                <ArrowRight className="hidden sm:block h-4 w-4 text-primary/50" />
                <span className="text-accent font-bold">12,550 XP</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 p-3 bg-background/30 rounded-lg">
                <span className="text-muted-foreground">280M tokens, 890 req</span>
                <ArrowRight className="hidden sm:block h-4 w-4 text-primary/50" />
                <span className="text-accent font-bold">9,280 XP</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 p-3 bg-background/30 rounded-lg">
                <span className="text-muted-foreground">3.5M tokens, 42 req</span>
                <ArrowRight className="hidden sm:block h-4 w-4 text-primary/50" />
                <span className="text-accent font-bold">523 XP</span>
              </div>
            </div>
          </div>

          {/* TBD Notice */}
          <div className="mb-6 sm:mb-8 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <h2 className="font-mono text-yellow-500 text-sm sm:text-base">SYSTEM_STATUS</h2>
            </div>
            <p className="font-mono text-sm text-muted-foreground mb-4">
              {"// Points system details are TBD and coming soon!"}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {"// Current formula is preliminary. Final XP mechanics,"}
              <br />
              {"// rewards, and benefits will be announced later."}
            </p>
          </div>

          {/* Coming Soon Section */}
          <div className="mb-6 sm:mb-8 rounded-lg border border-accent/20 bg-accent/5 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-accent" />
              <h2 className="font-mono text-accent text-sm sm:text-base">PLANNED_FEATURES</h2>
            </div>
            <ul className="space-y-2 font-mono text-xs sm:text-sm text-muted-foreground">
              <li>{"// XP bonuses for streaks"}</li>
              <li>{"// Model-specific multipliers"}</li>
              <li>{"// Weekly challenges"}</li>
              <li>{"// Achievement badges"}</li>
              <li>{"// Leaderboard rewards"}</li>
            </ul>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors font-mono text-sm sm:text-base border border-primary/30"
            >
              <span>./join_and_earn_xp</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
