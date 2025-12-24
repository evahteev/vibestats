import { NextRequest, NextResponse } from 'next/server'
import { parseCSVContent, computeFileHash, getTopModels } from '@/lib/csv-parser'
import { upsertUserStats, recordUpload, checkDuplicateUpload, updateModelStats } from '@/lib/db'
import { generateSlug, sanitizeDisplayName } from '@/lib/utils'
import type { Visibility, SourceTool } from '@/lib/types'

// Simple in-memory rate limiting
const uploadCounts = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10 // uploads per day per IP
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000 // 24 hours

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = uploadCounts.get(ip)

  if (!record || now > record.resetAt) {
    uploadCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (record.count >= RATE_LIMIT) {
    return false
  }

  record.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown'

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again tomorrow.' },
        { status: 429 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const displayName = formData.get('displayName') as string | null
    const visibility = (formData.get('visibility') as Visibility) || 'public_minimal'
    const sourceTool = (formData.get('sourceTool') as SourceTool) || 'cursor'
    const xHandle = (formData.get('xHandle') as string | null)?.trim().replace(/^@/, '') || null

    // Validation
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!displayName || displayName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Display name is required' },
        { status: 400 }
      )
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'File must be a CSV' },
        { status: 400 }
      )
    }

    // Read file content
    const csvContent = await file.text()
    const fileHash = computeFileHash(csvContent)

    // Check for duplicate
    if (checkDuplicateUpload(fileHash)) {
      return NextResponse.json(
        { error: 'This exact file has already been uploaded' },
        { status: 400 }
      )
    }

    // Parse CSV
    const parseResult = parseCSVContent(csvContent, file.size)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.message },
        { status: 400 }
      )
    }

    const { data } = parseResult

    // Sanitize and generate slug
    const sanitizedName = sanitizeDisplayName(displayName)
    if (sanitizedName.length < 2) {
      return NextResponse.json(
        { error: 'Display name must be at least 2 characters' },
        { status: 400 }
      )
    }

    const slug = generateSlug(sanitizedName)

    // Calculate XP: 100 (join bonus) + 1 per 1M tokens + 10 per request
    const totalXp = 100 + Math.floor(data.totalTokens / 1000000) + (data.totalRequests * 10)

    // Upsert user stats
    const userStats = upsertUserStats({
      displayName: sanitizedName,
      slug,
      sourceTool,
      mostUsedModel: data.mostUsedModel,
      topModelsJson: JSON.stringify(data.modelBreakdown),
      totalRequests: data.totalRequests,
      totalTokens: data.totalTokens,
      totalCostUsd: data.totalCost,
      totalXp,
      visibility,
      xHandle
    })

    // Record the upload
    recordUpload(
      userStats.id,
      file.name,
      fileHash,
      data.rowCount,
      'parsed'
    )

    // Update model stats
    updateModelStats(data.modelBreakdown)

    // Return success with preview data
    return NextResponse.json({
      success: true,
      user: {
        displayName: userStats.display_name,
        slug: userStats.slug,
        sourceTool: userStats.source_tool,
        mostUsedModel: userStats.most_used_model,
        totalRequests: userStats.total_requests,
        totalTokens: userStats.total_tokens,
        totalXp: userStats.total_xp,
        totalCostUsd: visibility === 'public_extended' ? userStats.total_cost_usd : undefined
      },
      summary: {
        rowCount: data.rowCount,
        topModels: getTopModels(data.modelBreakdown, 5)
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// Preview endpoint - parse without saving
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const csvContent = await file.text()
    const parseResult = parseCSVContent(csvContent, file.size)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.message },
        { status: 400 }
      )
    }

    const { data } = parseResult

    return NextResponse.json({
      success: true,
      preview: {
        rowCount: data.rowCount,
        totalRequests: data.totalRequests,
        totalTokens: data.totalTokens,
        totalCost: data.totalCost,
        mostUsedModel: data.mostUsedModel,
        topModels: getTopModels(data.modelBreakdown, 5)
      }
    })
  } catch (error) {
    console.error('Preview error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
