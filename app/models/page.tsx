"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/Navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2, Crown, Award, Star, Cpu } from "lucide-react"
import { formatNumber } from "@/lib/utils"

interface ModelEntry {
  rank: number
  modelName: string
  totalUsers: number
  totalRequests: number
  totalTokens: number
}

export default function ModelsPage() {
  const [models, setModels] = useState<ModelEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch("/api/models")
        const data = await response.json()
        setModels(data.models || [])
      } catch (error) {
        console.error("Failed to fetch models:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchModels()
  }, [])

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

  return (
    <>
      <Navigation />
      <main className="container py-6 sm:py-8 relative">
        <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
        <div className="relative z-10">
          <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-10">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span className="text-primary">$</span>
              <span>cat /proc/models/ranking</span>
              <span className="animate-pulse">_</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              <span className="text-primary glow">MODEL</span>
              <span className="text-primary hidden sm:inline">::</span>
              <br className="sm:hidden" />
              <span className="text-accent">LEADERBOARD</span>
            </h1>
            <p className="text-muted-foreground font-mono text-xs sm:text-sm">
              {"// Most popular AI models"}
            </p>
          </div>

          <div className="rounded-lg border border-primary/20 glow-border overflow-x-auto">
            <Table className="min-w-[500px]">
              <TableHeader>
                <TableRow className="border-primary/20 bg-primary/5">
                  <TableHead className="w-16 sm:w-20 text-primary font-mono text-xs sm:text-sm">RANK</TableHead>
                  <TableHead className="text-primary font-mono text-xs sm:text-sm">
                    <span className="flex items-center gap-1 sm:gap-2">
                      <Cpu className="h-3 w-3 sm:h-4 sm:w-4" />
                      MODEL
                    </span>
                  </TableHead>
                  <TableHead className="text-right text-primary font-mono text-xs sm:text-sm">USERS</TableHead>
                  <TableHead className="text-right text-primary font-mono text-xs sm:text-sm">TOKENS</TableHead>
                  <TableHead className="text-right hidden sm:table-cell text-primary font-mono text-xs sm:text-sm">REQ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-muted-foreground font-mono text-sm">Loading models...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : models.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="text-muted-foreground font-mono">
                        <p className="text-lg mb-2">{"// No model data yet"}</p>
                        <p className="text-sm">Upload some stats to populate!</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  models.map((model, index) => (
                    <TableRow
                      key={model.modelName}
                      className={`
                        border-primary/10 transition-all
                        hover:bg-primary/5 hover:glow-border
                        ${index === 0 ? "bg-yellow-500/5" : ""}
                        ${index === 1 ? "bg-gray-500/5" : ""}
                        ${index === 2 ? "bg-amber-500/5" : ""}
                      `}
                    >
                      <TableCell className="font-medium text-xs sm:text-sm">
                        {getRankDisplay(model.rank)}
                      </TableCell>
                      <TableCell>
                        <code className="text-[10px] sm:text-sm bg-primary/10 text-primary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-primary/20">
                          {model.modelName}
                        </code>
                      </TableCell>
                      <TableCell className="text-right font-mono text-foreground text-xs sm:text-sm">
                        {formatNumber(model.totalUsers)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-accent text-xs sm:text-sm">
                        {formatNumber(model.totalTokens)}
                      </TableCell>
                      <TableCell className="text-right font-mono hidden sm:table-cell text-muted-foreground text-xs sm:text-sm">
                        {formatNumber(model.totalRequests)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </>
  )
}
