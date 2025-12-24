import Database from 'better-sqlite3'
import path from 'path'
import type { UserStats, LeaderboardEntry, ModelStats, Upload, LeaderboardFilters, Visibility, SourceTool } from './types'

const DB_PATH = path.join(process.cwd(), 'data', 'leaderboard.db')

let db: Database.Database | null = null

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    initTables()
  }
  return db
}

function initTables() {
  const database = db!

  database.exec(`
    CREATE TABLE IF NOT EXISTS user_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      display_name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      source_tool TEXT DEFAULT 'cursor',
      most_used_model TEXT,
      top_models_json TEXT,
      total_requests INTEGER DEFAULT 0,
      total_tokens INTEGER DEFAULT 0,
      total_cost_usd REAL DEFAULT 0,
      total_xp INTEGER DEFAULT 0,
      visibility TEXT DEFAULT 'public_minimal',
      x_handle TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS uploads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_stats_id INTEGER REFERENCES user_stats(id),
      original_filename TEXT,
      file_hash TEXT,
      row_count INTEGER,
      status TEXT DEFAULT 'parsed',
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS model_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      model_name TEXT UNIQUE NOT NULL,
      total_users INTEGER DEFAULT 0,
      total_requests INTEGER DEFAULT 0,
      total_tokens INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_user_stats_slug ON user_stats(slug);
    CREATE INDEX IF NOT EXISTS idx_user_stats_tokens ON user_stats(total_tokens DESC);
    CREATE INDEX IF NOT EXISTS idx_uploads_hash ON uploads(file_hash);
    CREATE INDEX IF NOT EXISTS idx_model_stats_tokens ON model_stats(total_tokens DESC);
  `)

  // Migration: add x_handle column to existing databases
  try {
    database.exec('ALTER TABLE user_stats ADD COLUMN x_handle TEXT')
  } catch {
    // Column already exists, ignore
  }

  // Migration: add total_xp column to existing databases
  try {
    database.exec('ALTER TABLE user_stats ADD COLUMN total_xp INTEGER DEFAULT 0')
  } catch {
    // Column already exists, ignore
  }
}

export interface UpsertUserData {
  displayName: string
  slug: string
  sourceTool: SourceTool
  mostUsedModel: string
  topModelsJson: string
  totalRequests: number
  totalTokens: number
  totalCostUsd: number
  totalXp: number
  visibility: Visibility
  xHandle?: string | null
}

export function upsertUserStats(data: UpsertUserData): UserStats {
  const database = getDb()

  const existing = database.prepare(
    'SELECT id FROM user_stats WHERE display_name = ?'
  ).get(data.displayName) as { id: number } | undefined

  if (existing) {
    database.prepare(`
      UPDATE user_stats SET
        most_used_model = ?,
        top_models_json = ?,
        total_requests = ?,
        total_tokens = ?,
        total_cost_usd = ?,
        total_xp = ?,
        visibility = ?,
        x_handle = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      data.mostUsedModel,
      data.topModelsJson,
      data.totalRequests,
      data.totalTokens,
      data.totalCostUsd,
      data.totalXp,
      data.visibility,
      data.xHandle || null,
      existing.id
    )
  } else {
    database.prepare(`
      INSERT INTO user_stats (
        display_name, slug, source_tool, most_used_model, top_models_json,
        total_requests, total_tokens, total_cost_usd, total_xp, visibility, x_handle
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.displayName,
      data.slug,
      data.sourceTool,
      data.mostUsedModel,
      data.topModelsJson,
      data.totalRequests,
      data.totalTokens,
      data.totalCostUsd,
      data.totalXp,
      data.visibility,
      data.xHandle || null
    )
  }

  return database.prepare(
    'SELECT * FROM user_stats WHERE display_name = ?'
  ).get(data.displayName) as UserStats
}

export function getLeaderboard(filters: LeaderboardFilters = {}): LeaderboardEntry[] {
  const database = getDb()
  const { tool, model, search, sort = 'tokens', limit = 50, offset = 0 } = filters

  let whereClause = "WHERE visibility != 'private'"
  const params: (string | number)[] = []

  if (tool) {
    whereClause += ' AND source_tool = ?'
    params.push(tool)
  }

  if (model) {
    whereClause += ' AND most_used_model = ?'
    params.push(model)
  }

  if (search) {
    whereClause += ' AND display_name LIKE ?'
    params.push(`%${search}%`)
  }

  let orderBy: string
  switch (sort) {
    case 'requests':
      orderBy = 'total_requests DESC'
      break
    case 'cost':
      orderBy = 'total_cost_usd DESC'
      break
    case 'recent':
      orderBy = 'updated_at DESC'
      break
    case 'xp':
      orderBy = 'total_xp DESC'
      break
    case 'tokens':
    default:
      orderBy = 'total_tokens DESC'
  }

  params.push(limit, offset)

  const rows = database.prepare(`
    SELECT *, ROW_NUMBER() OVER (ORDER BY ${orderBy}) as rank
    FROM user_stats
    ${whereClause}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `).all(...params) as LeaderboardEntry[]

  return rows
}

export function getUserBySlug(slug: string): UserStats | null {
  const database = getDb()
  const row = database.prepare(
    'SELECT * FROM user_stats WHERE slug = ?'
  ).get(slug) as UserStats | undefined
  return row || null
}

export function getLeaderboardCount(filters: LeaderboardFilters = {}): number {
  const database = getDb()
  const { tool, model, search } = filters

  let whereClause = "WHERE visibility != 'private'"
  const params: string[] = []

  if (tool) {
    whereClause += ' AND source_tool = ?'
    params.push(tool)
  }

  if (model) {
    whereClause += ' AND most_used_model = ?'
    params.push(model)
  }

  if (search) {
    whereClause += ' AND display_name LIKE ?'
    params.push(`%${search}%`)
  }

  const result = database.prepare(`
    SELECT COUNT(*) as count FROM user_stats ${whereClause}
  `).get(...params) as { count: number }

  return result.count
}

export function getTotalLeaderboardXp(): number {
  const database = getDb()
  const result = database.prepare(`
    SELECT COALESCE(SUM(total_xp), 0) as total FROM user_stats WHERE visibility != 'private'
  `).get() as { total: number }
  return result.total
}

export function updateModelStats(modelBreakdown: Record<string, { tokens: number; requests: number }>): void {
  const database = getDb()

  const upsertStmt = database.prepare(`
    INSERT INTO model_stats (model_name, total_users, total_requests, total_tokens, updated_at)
    VALUES (?, 1, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(model_name) DO UPDATE SET
      total_users = total_users + 1,
      total_requests = total_requests + excluded.total_requests,
      total_tokens = total_tokens + excluded.total_tokens,
      updated_at = CURRENT_TIMESTAMP
  `)

  const transaction = database.transaction(() => {
    for (const [modelName, stats] of Object.entries(modelBreakdown)) {
      if (modelName && modelName !== 'auto') {
        upsertStmt.run(modelName, stats.requests, stats.tokens)
      }
    }
  })

  transaction()
}

export function getModelLeaderboard(limit = 20): ModelStats[] {
  const database = getDb()
  return database.prepare(`
    SELECT * FROM model_stats
    ORDER BY total_tokens DESC
    LIMIT ?
  `).all(limit) as ModelStats[]
}

export function getAllModels(): string[] {
  const database = getDb()
  const rows = database.prepare(`
    SELECT DISTINCT most_used_model FROM user_stats
    WHERE most_used_model IS NOT NULL AND most_used_model != ''
    ORDER BY most_used_model
  `).all() as { most_used_model: string }[]
  return rows.map(r => r.most_used_model)
}

export function recordUpload(
  userStatsId: number,
  filename: string,
  fileHash: string,
  rowCount: number,
  status: 'parsed' | 'failed',
  errorMessage?: string
): Upload {
  const database = getDb()

  const result = database.prepare(`
    INSERT INTO uploads (user_stats_id, original_filename, file_hash, row_count, status, error_message)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userStatsId, filename, fileHash, rowCount, status, errorMessage || null)

  return database.prepare(
    'SELECT * FROM uploads WHERE id = ?'
  ).get(result.lastInsertRowid) as Upload
}

export function checkDuplicateUpload(fileHash: string): boolean {
  const database = getDb()
  const existing = database.prepare(
    'SELECT id FROM uploads WHERE file_hash = ?'
  ).get(fileHash)
  return !!existing
}

export function ensureDataDir() {
  const fs = require('fs')
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Initialize on import
ensureDataDir()
