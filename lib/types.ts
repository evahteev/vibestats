export type SourceTool = 'cursor' | 'claude' | 'codex' | 'other'

export type Visibility = 'public_minimal' | 'public_extended' | 'private'

export interface UserStats {
  id: number
  display_name: string
  slug: string
  source_tool: SourceTool
  most_used_model: string | null
  top_models_json: string | null
  total_requests: number
  total_tokens: number
  total_cost_usd: number
  total_xp: number
  visibility: Visibility
  x_handle: string | null
  created_at: string
  updated_at: string
}

export interface LeaderboardEntry extends UserStats {
  rank: number
}

export interface ModelStats {
  id: number
  model_name: string
  total_users: number
  total_requests: number
  total_tokens: number
  updated_at: string
}

export interface Upload {
  id: number
  user_stats_id: number
  original_filename: string
  file_hash: string
  row_count: number
  status: 'parsed' | 'failed'
  error_message: string | null
  created_at: string
}

export interface ParsedCSVResult {
  totalRequests: number
  totalTokens: number
  totalCost: number
  modelBreakdown: Record<string, {
    tokens: number
    requests: number
    cost: number
  }>
  mostUsedModel: string
  rowCount: number
}

export interface CursorCSVRow {
  Date: string
  Kind: string
  Model: string
  'Max Mode': string
  'Input (w/ Cache Write)': string
  'Input (w/o Cache Write)': string
  'Cache Read': string
  'Output Tokens': string
  'Total Tokens': string
  Cost: string
}

export interface LeaderboardFilters {
  tool?: SourceTool
  model?: string
  search?: string
  sort?: 'tokens' | 'requests' | 'cost' | 'recent' | 'xp'
  limit?: number
  offset?: number
}
