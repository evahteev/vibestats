"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Navigation } from "@/components/Navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Share2, User, Cpu, Activity, Clock, Zap } from "lucide-react"
import { formatNumber, formatCurrency, timeAgo } from "@/lib/utils"

interface UserData {
  displayName: string
  slug: string
  sourceTool: string
  mostUsedModel: string
  totalRequests: number
  totalTokens: number
  totalXp: number
  totalCostUsd?: number
  xHandle?: string | null
  topModels: {
    model: string
    tokens: number
    requests: number
    cost?: number
  }[]
  createdAt: string
  updatedAt: string
}

export default function UserPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`/api/user/${resolvedParams.slug}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError("User not found")
          } else {
            setError("Failed to load user")
          }
          return
        }
        const data = await response.json()
        setUser(data)
      } catch {
        setError("Failed to load user")
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [resolvedParams.slug])

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: `${user?.displayName} on Vibe Coders`, url })
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getToolBadge = (tool: string) => {
    const colors: Record<string, string> = {
      cursor: "border-purple-500/50 bg-purple-500/10 text-purple-400",
      claude: "border-orange-500/50 bg-orange-500/10 text-orange-400",
      codex: "border-green-500/50 bg-green-500/10 text-green-400",
      other: "border-gray-500/50 bg-gray-500/10 text-gray-400",
    }
    return (
      <Badge variant="outline" className={colors[tool] || colors.other}>
        {tool}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className="container py-6 sm:py-8">
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-3">
            <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-primary" />
            <span className="font-mono text-muted-foreground text-sm">Loading user data...</span>
          </div>
        </main>
      </>
    )
  }

  if (error || !user) {
    return (
      <>
        <Navigation />
        <main className="container py-6 sm:py-8">
          <div className="text-center py-16 sm:py-20">
            <p className="text-destructive font-mono mb-4 text-sm sm:text-base">[ERROR] {error || "User not found"}</p>
            <Link href="/">
              <Button className="glow-box">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Leaderboard
              </Button>
            </Link>
          </div>
        </main>
      </>
    )
  }

  const maxTokens = Math.max(...user.topModels.map((m) => m.tokens), 1)

  return (
    <>
      <Navigation />
      <main className="container py-6 sm:py-8 relative">
        <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
        <div className="relative z-10">
          <div className="mb-4 sm:mb-6">
            <Link href="/" className="text-xs sm:text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 font-mono transition-colors">
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              cd ../leaderboard
            </Link>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {/* Main Info Card */}
            <Card className="md:col-span-2 border-primary/20 bg-card/50">
              <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0 p-4 sm:p-6">
                <div>
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground font-mono mb-2">
                    <User className="h-3 w-3 text-primary" />
                    USER_PROFILE
                  </div>
                  <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-mono break-all">
                    <span className="text-primary">@</span>{user.displayName}
                  </CardTitle>
                  <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3 flex-wrap">
                    {getToolBadge(user.sourceTool)}
                    {user.xHandle && (
                      <a
                        href={`https://x.com/${user.xHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm text-primary hover:underline font-mono"
                      >
                        @{user.xHandle}
                      </a>
                    )}
                    <span className="text-xs sm:text-sm text-muted-foreground font-mono">
                      joined {timeAgo(user.createdAt)}
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleShare} className="border-primary/30 hover:border-primary/50 font-mono text-xs w-full sm:w-auto">
                  {copied ? "Copied!" : <><Share2 className="h-4 w-4 mr-1" /> share</>}
                </Button>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div className="space-y-1">
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-mono flex items-center gap-1">
                      <Zap className="h-3 w-3" /> total_tokens
                    </p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-accent">{formatNumber(user.totalTokens)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-mono flex items-center gap-1">
                      <Activity className="h-3 w-3" /> total_requests
                    </p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{formatNumber(user.totalRequests)}</p>
                  </div>
                  <div className="space-y-1">
                    <Link href="/xp" className="text-[10px] sm:text-xs text-muted-foreground font-mono flex items-center gap-1 hover:text-primary transition-colors">
                      <Zap className="h-3 w-3" /> total_xp
                    </Link>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">{formatNumber(user.totalXp)}</p>
                  </div>
                  {user.totalCostUsd !== undefined && (
                    <div className="space-y-1">
                      <p className="text-[10px] sm:text-xs text-muted-foreground font-mono">total_spend</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{formatCurrency(user.totalCostUsd)}</p>
                    </div>
                  )}
                </div>

                <div className="bg-primary/5 rounded-lg p-3 sm:p-4 border border-primary/20">
                  <p className="text-[10px] sm:text-xs text-muted-foreground font-mono mb-1 sm:mb-2 flex items-center gap-1">
                    <Cpu className="h-3 w-3" /> most_used_model
                  </p>
                  <code className="text-base sm:text-lg lg:text-xl text-primary glow break-all">
                    {user.mostUsedModel || "unknown"}
                  </code>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="border-primary/20 bg-card/50">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-mono text-primary flex items-center gap-2">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  QUICK_STATS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 font-mono text-xs sm:text-sm p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">last_updated</span>
                  <span className="text-foreground">{timeAgo(user.updatedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">avg_tokens/req</span>
                  <span className="text-accent">
                    {formatNumber(Math.round(user.totalTokens / Math.max(user.totalRequests, 1)))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">models_used</span>
                  <span className="text-foreground">{user.topModels.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Model Breakdown */}
            <Card className="md:col-span-3 border-primary/20 bg-card/50">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-mono text-primary flex items-center gap-2">
                  <Cpu className="h-3 w-3 sm:h-4 sm:w-4" />
                  MODEL_BREAKDOWN
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="space-y-3 sm:space-y-4">
                  {user.topModels.map((model, index) => (
                    <div key={model.model} className="space-y-1.5 sm:space-y-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm font-mono gap-0.5 sm:gap-0">
                        <span className="flex items-center gap-1 sm:gap-2">
                          {index === 0 && <span className="text-yellow-400 glow">*</span>}
                          <span className={`${index === 0 ? "text-primary" : "text-foreground"} break-all`}>{model.model}</span>
                        </span>
                        <span className="text-muted-foreground text-[10px] sm:text-sm">
                          {formatNumber(model.tokens)} tokens | {formatNumber(model.requests)} req
                        </span>
                      </div>
                      <div className="h-1.5 sm:h-2 bg-primary/10 rounded-full overflow-hidden border border-primary/20">
                        <div
                          className={`h-full rounded-full transition-all ${index === 0 ? "bg-primary glow" : "bg-primary/50"}`}
                          style={{ width: `${(model.tokens / maxTokens) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
