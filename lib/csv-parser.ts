import Papa from 'papaparse'
import type { ParsedCSVResult, CursorCSVRow } from './types'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_ROWS = 200000

export interface ParseError {
  type: 'size' | 'format' | 'missing_columns' | 'no_data'
  message: string
}

export type ParseResult =
  | { success: true; data: ParsedCSVResult }
  | { success: false; error: ParseError }

export function parseCSVContent(csvContent: string, fileSize?: number): ParseResult {
  if (fileSize && fileSize > MAX_FILE_SIZE) {
    return {
      success: false,
      error: {
        type: 'size',
        message: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
      }
    }
  }

  const parsed = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  })

  if (parsed.errors.length > 0 && parsed.data.length === 0) {
    return {
      success: false,
      error: {
        type: 'format',
        message: `CSV parsing error: ${parsed.errors[0].message}`
      }
    }
  }

  if (parsed.data.length === 0) {
    return {
      success: false,
      error: {
        type: 'no_data',
        message: 'CSV file contains no data rows'
      }
    }
  }

  if (parsed.data.length > MAX_ROWS) {
    return {
      success: false,
      error: {
        type: 'size',
        message: `Too many rows. Maximum is ${MAX_ROWS.toLocaleString()} rows`
      }
    }
  }

  // Detect format and parse accordingly
  const headers = Object.keys(parsed.data[0] || {})

  if (isCursorFormat(headers)) {
    return parseCursorCSV(parsed.data as unknown as CursorCSVRow[])
  }

  // Try generic format
  return parseGenericCSV(parsed.data, headers)
}

function isCursorFormat(headers: string[]): boolean {
  const cursorHeaders = ['Date', 'Kind', 'Model', 'Total Tokens', 'Cost']
  return cursorHeaders.every(h =>
    headers.some(header => header.toLowerCase().includes(h.toLowerCase()))
  )
}

function parseCursorCSV(rows: CursorCSVRow[]): ParseResult {
  const modelBreakdown: Record<string, { tokens: number; requests: number; cost: number }> = {}
  let totalRequests = 0
  let totalTokens = 0
  let totalCost = 0
  let validRows = 0

  for (const row of rows) {
    // Skip errored entries
    const kind = row.Kind?.toLowerCase() || ''
    if (kind.includes('error') || kind.includes('no charge')) {
      continue
    }

    const model = row.Model?.trim() || 'unknown'
    const tokens = parseInt(row['Total Tokens'] || '0', 10) || 0
    const cost = parseFloat(row.Cost || '0') || 0

    if (!modelBreakdown[model]) {
      modelBreakdown[model] = { tokens: 0, requests: 0, cost: 0 }
    }

    modelBreakdown[model].tokens += tokens
    modelBreakdown[model].requests += 1
    modelBreakdown[model].cost += cost

    totalRequests += 1
    totalTokens += tokens
    totalCost += cost
    validRows++
  }

  if (validRows === 0) {
    return {
      success: false,
      error: {
        type: 'no_data',
        message: 'No valid data rows found (all entries may be errored)'
      }
    }
  }

  // Find most used model by tokens (excluding "auto")
  let mostUsedModel = 'unknown'
  let maxTokens = 0

  for (const [model, stats] of Object.entries(modelBreakdown)) {
    if (model !== 'auto' && stats.tokens > maxTokens) {
      maxTokens = stats.tokens
      mostUsedModel = model
    }
  }

  // If only "auto" exists, use it
  if (mostUsedModel === 'unknown' && modelBreakdown['auto']) {
    mostUsedModel = 'auto'
  }

  return {
    success: true,
    data: {
      totalRequests,
      totalTokens,
      totalCost,
      modelBreakdown,
      mostUsedModel,
      rowCount: validRows
    }
  }
}

function parseGenericCSV(rows: Record<string, string>[], headers: string[]): ParseResult {
  // Try to find model column
  const modelColumn = headers.find(h =>
    ['model', 'model_name', 'llm_model'].includes(h.toLowerCase())
  )

  // Try to find token column
  const tokenColumn = headers.find(h =>
    ['tokens', 'total_tokens', 'token_count'].includes(h.toLowerCase())
  )

  // Try to find cost column
  const costColumn = headers.find(h =>
    ['cost', 'cost_usd', 'usd', 'price'].includes(h.toLowerCase())
  )

  if (!modelColumn) {
    return {
      success: false,
      error: {
        type: 'missing_columns',
        message: 'Could not find a model column. Expected: model, model_name, or llm_model'
      }
    }
  }

  const modelBreakdown: Record<string, { tokens: number; requests: number; cost: number }> = {}
  let totalRequests = 0
  let totalTokens = 0
  let totalCost = 0

  for (const row of rows) {
    const model = row[modelColumn]?.trim() || 'unknown'
    const tokens = tokenColumn ? (parseInt(row[tokenColumn] || '0', 10) || 0) : 0
    const cost = costColumn ? (parseFloat(row[costColumn] || '0') || 0) : 0

    if (!modelBreakdown[model]) {
      modelBreakdown[model] = { tokens: 0, requests: 0, cost: 0 }
    }

    modelBreakdown[model].tokens += tokens
    modelBreakdown[model].requests += 1
    modelBreakdown[model].cost += cost

    totalRequests += 1
    totalTokens += tokens
    totalCost += cost
  }

  // Find most used model
  let mostUsedModel = 'unknown'
  let maxTokens = 0

  for (const [model, stats] of Object.entries(modelBreakdown)) {
    if (stats.tokens > maxTokens) {
      maxTokens = stats.tokens
      mostUsedModel = model
    }
  }

  // If no tokens, use request count instead
  if (maxTokens === 0) {
    let maxRequests = 0
    for (const [model, stats] of Object.entries(modelBreakdown)) {
      if (stats.requests > maxRequests) {
        maxRequests = stats.requests
        mostUsedModel = model
      }
    }
  }

  return {
    success: true,
    data: {
      totalRequests,
      totalTokens,
      totalCost,
      modelBreakdown,
      mostUsedModel,
      rowCount: rows.length
    }
  }
}

export function computeFileHash(content: string): string {
  // Simple hash for deduplication (not cryptographic)
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16)
}

export function getTopModels(modelBreakdown: Record<string, { tokens: number; requests: number; cost: number }>, limit = 5): { model: string; tokens: number; requests: number; cost: number }[] {
  return Object.entries(modelBreakdown)
    .map(([model, stats]) => ({ model, ...stats }))
    .sort((a, b) => b.tokens - a.tokens)
    .slice(0, limit)
}
