"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, ChevronLeft, ChevronRight, Loader2, Crown, Award, Star, Zap } from "lucide-react"
import { formatNumber, timeAgo } from "@/lib/utils"
import type { LeaderboardEntry } from "@/lib/types"

interface LeaderboardData {
  entries: LeaderboardEntry[]
  total: number
  totalXp: number
  models: string[]
  filters: {
    hasMore: boolean
    offset: number
    limit: number
  }
}

export function LeaderboardTable() {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [model, setModel] = useState<string>("")
  const [sort, setSort] = useState<string>("tokens")
  const [offset, setOffset] = useState(0)
  const limit = 20

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("q", search)
      if (model && model !== "all") params.set("model", model)
      params.set("sort", sort)
      params.set("limit", limit.toString())
      params.set("offset", offset.toString())

      const response = await fetch(`/api/leaderboard?${params}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error)
    } finally {
      setIsLoading(false)
    }
  }, [search, model, sort, offset])

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchLeaderboard()
    }, 300)
    return () => clearTimeout(debounce)
  }, [fetchLeaderboard])

  const handleSearch = (value: string) => {
    setSearch(value)
    setOffset(0)
  }

  const handleModelChange = (value: string) => {
    setModel(value)
    setOffset(0)
  }

  const handleSortChange = (value: string) => {
    setSort(value)
    setOffset(0)
  }

  const getRankDisplay = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex items-center gap-1">
          <Crown className="h-5 w-5 text-yellow-400 glow" />
          <span className="text-yellow-400 font-bold">#1</span>
        </div>
      )
    }
    if (rank === 2) {
      return (
        <div className="flex items-center gap-1">
          <Award className="h-5 w-5 text-gray-300" />
          <span className="text-gray-300 font-bold">#2</span>
        </div>
      )
    }
    if (rank === 3) {
      return (
        <div className="flex items-center gap-1">
          <Star className="h-5 w-5 text-amber-500" />
          <span className="text-amber-500 font-bold">#3</span>
        </div>
      )
    }
    return <span className="text-muted-foreground font-mono">#{rank}</span>
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

  return (
    <div className="space-y-6">
      {/* Total XP Banner */}
      {data && data.totalXp > 0 && (
        <Link
          href="/xp"
          className="block rounded-lg border border-primary/30 bg-primary/5 p-4 hover:bg-primary/10 transition-colors glow-border"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground font-mono">TOTAL_XP_EARNED</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary">{formatNumber(data.totalXp)}</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground font-mono hidden sm:block">{"// click to learn more →"}</span>
          </div>
        </Link>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60" />
          <Input
            placeholder="grep -i 'username'..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-background/50 border-primary/20 focus:border-primary/50 focus:glow-border font-mono"
          />
        </div>
        <Select value={model} onValueChange={handleModelChange}>
          <SelectTrigger className="w-full sm:w-[200px] bg-background/50 border-primary/20">
            <SelectValue placeholder="--model=*" />
          </SelectTrigger>
          <SelectContent className="bg-card border-primary/20">
            <SelectItem value="all">--model=*</SelectItem>
            {data?.models.map((m) => (
              <SelectItem key={m} value={m} className="font-mono">
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-primary/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-primary/20">
            <SelectItem value="xp">--sort=xp</SelectItem>
            <SelectItem value="tokens">--sort=tokens</SelectItem>
            <SelectItem value="requests">--sort=requests</SelectItem>
            <SelectItem value="cost">--sort=cost</SelectItem>
            <SelectItem value="recent">--sort=recent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-primary/20 glow-border overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow className="border-primary/20 bg-primary/5">
              <TableHead className="w-16 sm:w-20 text-primary font-mono text-xs sm:text-sm">RANK</TableHead>
              <TableHead className="text-primary font-mono text-xs sm:text-sm min-w-[100px]">USER</TableHead>
              <TableHead className="hidden md:table-cell text-primary font-mono text-xs sm:text-sm">X</TableHead>
              <TableHead className="hidden lg:table-cell text-primary font-mono text-xs sm:text-sm">TOOL</TableHead>
              <TableHead className="text-primary font-mono text-xs sm:text-sm whitespace-nowrap">MOST USED MODEL</TableHead>
              <TableHead className="text-right text-primary font-mono text-xs sm:text-sm">TOKENS</TableHead>
              <TableHead className="text-right text-primary font-mono text-xs sm:text-sm">
                <Link href="/xp" className="hover:underline">XP</Link>
              </TableHead>
              <TableHead className="hidden sm:table-cell text-right text-primary font-mono text-xs sm:text-sm">REQ</TableHead>
              <TableHead className="hidden md:table-cell text-right text-primary font-mono text-xs sm:text-sm">UPDATED</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-muted-foreground font-mono text-sm">Loading data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data?.entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12">
                  <div className="text-muted-foreground font-mono">
                    <p className="text-lg mb-2">{"// No entries found"}</p>
                    <p className="text-sm">Be the first to ./upload your stats</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data?.entries.map((entry, index) => (
                <TableRow
                  key={entry.id}
                  className={`
                    border-primary/10 transition-all
                    hover:bg-primary/5 hover:glow-border
                    ${index === 0 ? "bg-yellow-500/5" : ""}
                    ${index === 1 ? "bg-gray-500/5" : ""}
                    ${index === 2 ? "bg-amber-500/5" : ""}
                  `}
                >
                  <TableCell className="font-medium text-xs sm:text-sm">
                    {getRankDisplay(entry.rank)}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    <Link
                      href={`/u/${entry.slug}`}
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      @{entry.display_name}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs sm:text-sm">
                    {entry.x_handle ? (
                      <a
                        href={`https://x.com/${entry.x_handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-mono"
                      >
                        @{entry.x_handle}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {getToolBadge(entry.source_tool)}
                  </TableCell>
                  <TableCell>
                    <code className="text-[10px] sm:text-xs bg-primary/10 text-primary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-primary/20 whitespace-nowrap">
                      {entry.most_used_model || "unknown"}
                    </code>
                  </TableCell>
                  <TableCell className="text-right font-mono text-accent text-xs sm:text-sm">
                    {formatNumber(entry.total_tokens)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs sm:text-sm">
                    <Link href="/xp" className="text-primary hover:underline">
                      {formatNumber(entry.total_xp)}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-right font-mono text-muted-foreground text-xs sm:text-sm">
                    {formatNumber(entry.total_requests)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right text-muted-foreground text-xs sm:text-sm">
                    {timeAgo(entry.updated_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.total > limit && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs sm:text-sm">
          <p className="text-muted-foreground">
            [{offset + 1}-{Math.min(offset + limit, data.total)}] of {data.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className="border-primary/20 hover:border-primary/50 hover:bg-primary/10 text-xs"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">prev</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOffset(offset + limit)}
              disabled={!data.filters.hasMore}
              className="border-primary/20 hover:border-primary/50 hover:bg-primary/10 text-xs"
            >
              <span className="hidden sm:inline">next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
