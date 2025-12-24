import { NextResponse } from 'next/server'
import { getModelLeaderboard } from '@/lib/db'

export async function GET() {
  try {
    const models = getModelLeaderboard(50)

    return NextResponse.json({
      models: models.map((m, index) => ({
        rank: index + 1,
        modelName: m.model_name,
        totalUsers: m.total_users,
        totalRequests: m.total_requests,
        totalTokens: m.total_tokens,
        updatedAt: m.updated_at
      }))
    })
  } catch (error) {
    console.error('Models leaderboard error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
