# VIBE CODERS Leaderboard

[https://vibestats.gurunetwork.ai/](https://vibestats.gurunetwork.ai/)

[https://t.me/CURSORVIBES](https://t.me/CURSORVIBES)


A Next.js web application for tracking and displaying AI coding tool usage statistics. Users upload their Cursor usage CSV exports to compete on a public leaderboard.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: SQLite with better-sqlite3
- **Styling**: Tailwind CSS with custom hacker/cyberpunk theme
- **UI Components**: Radix UI primitives
- **CSV Parsing**: PapaParse

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── leaderboard/route.ts  # GET leaderboard data
│   │   ├── models/route.ts       # GET model statistics
│   │   ├── upload/route.ts       # POST CSV upload
│   │   └── user/[slug]/route.ts  # GET user profile
│   ├── models/page.tsx           # Model leaderboard page
│   ├── upload/page.tsx           # CSV upload page
│   ├── u/[slug]/page.tsx         # User profile page
│   ├── xp/page.tsx               # XP system explanation
│   ├── layout.tsx                # Root layout with Luka widget
│   ├── page.tsx                  # Main leaderboard
│   └── globals.css               # Global styles & theme
├── components/
│   ├── ui/                       # Radix-based UI components
│   ├── LeaderboardTable.tsx      # Main leaderboard component
│   ├── LukaWidget.tsx            # Chat assistant widget
│   ├── Navigation.tsx            # Header navigation
│   └── UploadForm.tsx            # CSV upload form
├── lib/
│   ├── db.ts                     # Database operations
│   ├── csv-parser.ts             # CSV parsing logic
│   ├── types.ts                  # TypeScript interfaces
│   └── utils.ts                  # Utility functions
├── scripts/
│   └── seed-mock-data.js         # Database seeding script
├── data/
│   └── leaderboard.db            # SQLite database (gitignored)
└── docs/
    └── telegram-bot-system-prompt-short.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Seed mock data (optional)
npm run seed
```

The app runs on `http://localhost:3000` (or next available port).

### Docker

```bash
# Seed data in Docker container
docker exec <container> node scripts/seed-mock-data.js
```

## Database Schema

### user_stats
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| display_name | TEXT | Unique username |
| slug | TEXT | URL-friendly identifier |
| source_tool | TEXT | 'cursor', 'claude', 'codex', 'other' |
| most_used_model | TEXT | Primary AI model used |
| top_models_json | TEXT | JSON breakdown of model usage |
| total_requests | INTEGER | Total API requests |
| total_tokens | INTEGER | Total tokens consumed |
| total_cost_usd | REAL | Estimated cost in USD |
| total_xp | INTEGER | Experience points |
| visibility | TEXT | 'public_minimal', 'public_extended', 'private' |
| x_handle | TEXT | Twitter/X handle (optional) |
| created_at | DATETIME | First upload timestamp |
| updated_at | DATETIME | Last update timestamp |

### model_stats
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| model_name | TEXT | Unique model identifier |
| total_users | INTEGER | Users who used this model |
| total_requests | INTEGER | Total requests to this model |
| total_tokens | INTEGER | Total tokens for this model |

### uploads
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| user_stats_id | INTEGER | Foreign key to user_stats |
| original_filename | TEXT | Uploaded file name |
| file_hash | TEXT | SHA-256 hash for deduplication |
| row_count | INTEGER | Rows in CSV |
| status | TEXT | 'parsed' or 'failed' |
| error_message | TEXT | Error details if failed |

## XP System

```
XP = 100 (join bonus) + (requests × 10) + floor(tokens / 1,000,000)
```

- **100 XP**: Join bonus for first upload
- **10 XP**: Per API request
- **1 XP**: Per million tokens

## API Endpoints

### GET /api/leaderboard
Query params: `tool`, `model`, `search`, `sort` (tokens|requests|cost|recent|xp), `limit`, `offset`

### GET /api/models
Returns model usage statistics.

### POST /api/upload
Form data: `file` (CSV), `displayName`, `visibility`, `xHandle` (optional)

### GET /api/user/[slug]
Returns user profile and stats.

## CSV Format (Cursor Export)

Expected columns from Cursor dashboard export:
- Date
- Kind
- Model
- Max Mode
- Input (w/ Cache Write)
- Input (w/o Cache Write)
- Cache Read
- Output Tokens
- Total Tokens
- Cost

Export from: `cursor.com/dashboard` → Usage tab

## Luka Chat Widget

The app includes an embedded Luka chat assistant widget configured in `components/LukaWidget.tsx`:

```tsx
data-mode="copilot"
data-theme="dark"
data-sub-agent="cursor_leaderboard"
data-api-url="https://chat-evgeny-ai.apps.gurunetwork.ai"
data-default-open="false"  // Opens after 2 seconds
```

The widget auto-opens after 2 seconds and shifts the layout left when visible.

## Environment

- No environment variables required for basic operation
- Database is auto-created in `data/` directory
- WAL mode enabled for better concurrent performance

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
npm run seed     # Seed mock data
```

## Community

- **Telegram**: [@CURSORVIBES](https://t.me/CURSORVIBES)
- **Leaderboard**: vibestats.gurunetwork.ai
