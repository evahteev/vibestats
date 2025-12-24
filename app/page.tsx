import { Navigation } from "@/components/Navigation"
import { LeaderboardTable } from "@/components/LeaderboardTable"

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="container py-6 sm:py-8 relative">
        <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
        <div className="relative z-10">
          <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-10">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span className="text-primary">$</span>
              <span>cat /var/log/vibe_coders.log</span>
              <span className="animate-pulse">_</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              <span className="text-primary glow">VIBE</span>
              <span className="text-muted-foreground">_</span>
              <span>CODERS</span>
              <span className="text-primary hidden sm:inline">::</span>
              <br className="sm:hidden" />
              <span className="text-accent">LEADERBOARD</span>
            </h1>
            <p className="text-muted-foreground font-mono text-xs sm:text-sm">
              {"// Monthly leaderboard - See who's vibing the hardest"}
              <br className="hidden sm:block" />
              <span className="hidden sm:inline">{" // Cursor stats only (for now)"}</span>
            </p>
          </div>
          <LeaderboardTable />
        </div>
      </main>
    </>
  )
}
