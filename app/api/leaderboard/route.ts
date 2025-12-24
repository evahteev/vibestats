import { NextRequest, NextResponse } from 'next/server'
import { getLeaderboard, getLeaderboardCount, getAllModels, getTotalLeaderboardXp } from '@/lib/db'
import type { LeaderboardFilters, SourceTool } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const filters: LeaderboardFilters = {
      tool: searchParams.get('tool') as SourceTool | undefined,
      model: searchParams.get('model') || undefined,
      search: searchParams.get('q') || undefined,
      sort: (searchParams.get('sort') as LeaderboardFilters['sort']) || 'tokens',
      limit: Math.min(parseInt(searchParams.get('limit') || '50', 10), 100),
      offset: parseInt(searchParams.get('offset') || '0', 10)
    }

    const entries = getLeaderboard(filters)
    const total = getLeaderboardCount(filters)
    const models = getAllModels()
    const totalXp = getTotalLeaderboardXp()

    return NextResponse.json({
      entries,
      total,
      totalXp,
      models,
      filters: {
        ...filters,
        hasMore: filters.offset! + entries.length < total
      }
    })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
