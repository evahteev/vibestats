import { NextRequest, NextResponse } from 'next/server'
import { getUserBySlug } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const user = getUserBySlug(slug)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Parse top models JSON
    let topModels: Record<string, { tokens: number; requests: number; cost: number }> = {}
    try {
      topModels = user.top_models_json ? JSON.parse(user.top_models_json) : {}
    } catch {
      topModels = {}
    }

    // Hide cost if not public_extended
    const response: Record<string, unknown> = {
      displayName: user.display_name,
      slug: user.slug,
      sourceTool: user.source_tool,
      mostUsedModel: user.most_used_model,
      totalRequests: user.total_requests,
      totalTokens: user.total_tokens,
      totalXp: user.total_xp,
      xHandle: user.x_handle || null,
      topModels: Object.entries(topModels)
        .map(([model, stats]) => ({
          model,
          tokens: stats.tokens,
          requests: stats.requests,
          ...(user.visibility === 'public_extended' ? { cost: stats.cost } : {})
        }))
        .sort((a, b) => b.tokens - a.tokens)
        .slice(0, 10),
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }

    if (user.visibility === 'public_extended') {
      response.totalCostUsd = user.total_cost_usd
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('User fetch error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
