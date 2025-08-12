## SwipedIn

The dating app for job applications. Discover curated roles, swipe to shortlist, and generate personalized application emails with AI. Built with Next.js (App Router), Tailwind, Supabase, and optional Tauri for desktop packaging. Includes a standalone Python module for offline job–resume matching.

### Features
- **Landing + onboarding**: Clean landing page and profile/resume flow
- **Swipe experience**: Game-like swipe interface to shortlist jobs
- **Apply workspace**: Manage saved jobs, generate tailored emails via AI, and open apply links
- **AI utilities**:
  - `/api/generate-email`: Calls Hack Club AI to create a subject + body JSON
  - `/api/summarize-resume`: Uses OpenAI if available, otherwise a deterministic fallback
  - `/api/vector/embedding`: Uses OpenAI embeddings if available, otherwise a fast fallback
  - `/api/vector/job-matching`: Finds similar jobs from Supabase using cosine similarity
- **Desktop (optional)**: Tauri config checked in to ship a desktop app
- **Python module**: Sentence-transformers based job recommendation script using Supabase data

### Project structure
```
SwipedIn/
  README.md                 ← You are here
  recommendationAlgo/       ← Python job recommendation module
  swiped-in/                ← Next.js app (App Router) + optional Tauri bundling
    src-tauri/              ← Tauri configuration and Rust harness
    src/app/api/            ← Next.js API routes (AI/email, resume summary, embeddings, matching)
    src/app/game/           ← Swipe UI
    src/app/apply/          ← Apply workspace + AI email modal
    src/lib/supabase/       ← Supabase typed client and utils
    supabase/functions/     ← (Deno) Edge functions and shared code
```

## Getting started (web)

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- npm, pnpm, or bun (repo includes a `bun.lockb`, but npm works too)
- Optional: OpenAI API key for higher‑quality summaries/embeddings
- Supabase project (local or hosted)

### 1) Install dependencies
```bash
cd swiped-in
npm install
# or: pnpm install
# or: bun install
```

### 2) Configure environment
Create `swiped-in/.env.local` with your values:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional – used by summarize-resume and embeddings endpoints
OPENAI_API_KEY=sk-...
```

Notes:
- If `OPENAI_API_KEY` is not set, `/api/summarize-resume` and `/api/vector/embedding` fall back to deterministic local behavior.
- The app also tries `http://127.0.0.1:54321` for Supabase if envs are missing (handy for local Supabase CLI).

### 3) Run the dev server
```bash
cd swiped-in
npm run dev
# Visit http://localhost:3000
```

## Optional: Desktop app via Tauri
Tauri config lives in `swiped-in/src-tauri/tauri.conf.json`. To run dev/build, install the Tauri CLI and platform prerequisites.

### Prerequisites
- Rust toolchain + cargo
- Tauri CLI
```bash
npm i -g @tauri-apps/cli
# or
cargo install tauri-cli
```

### Run desktop dev
```bash
cd swiped-in
tauri dev
```
This runs the Next.js dev server (via Tauri `beforeDevCommand`) and opens a desktop window pointing to `http://localhost:3000`.

### Build desktop bundles
```bash
cd swiped-in
tauri build
```

## Supabase
- The app uses the browser client in `src/lib/supabase/client.ts` with env vars `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- The job matching route probes multiple possible tables by name and will log which one returned data. Common columns include `job_title`, `company_name`, `location`, `description`, and optional precomputed vectors.

Local development using the Supabase CLI is supported (optional):
```bash
supabase start
# Dashboard: http://127.0.0.1:54323
# API:       http://127.0.0.1:54321
```

## API routes (Next.js)
- `POST /api/generate-email`
  - Input: `{ job: { title, company, location, salary?, rating?, apply_link? }, resume: string }`
  - Output: `{ subject: string, body: string }` (uses Hack Club AI, no key required)

- `POST /api/summarize-resume`
  - Input: `{ resume: string }`
  - Output: `{ summary: string }` (uses OpenAI if `OPENAI_API_KEY` set; otherwise a fallback)

- `POST /api/vector/embedding`
  - Input: `{ text: string }`
  - Output: `{ embedding: number[], model_cached: boolean }` (uses OpenAI if available; otherwise a fast fallback)

- `POST /api/vector/job-matching`
  - Input: `{ embedding: number[] }`
  - Output: `{ matches: Array<{ job, score, title, company, location, description }>, total_found: number }`

## Python recommendation module
Directory: `recommendationAlgo/`

### Setup
```bash
cd recommendationAlgo
pip install -r requirements.txt
```

Set environment variables (shell or `.env`):
```bash
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
```

### Run
```bash
python test_supabase_connection.py
python algo_with_supabase.py
```
This will download a sentence-transformer model on first run, fetch jobs from your Supabase table, embed resume + job text, and print the top matches.

## Common issues
- **Missing env vars**: Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in `swiped-in/.env.local`.
- **OpenAI errors**: If `OPENAI_API_KEY` is not provided or rate-limited, endpoints automatically fall back to local behavior.
- **No jobs returned**: The matching route checks several table names; verify your jobs table and column names, or adjust the route logic to your schema.
- **Tauri dev/build**: Make sure the Tauri CLI and platform prerequisites are installed. The Tauri window title and product name can be updated in `src-tauri/tauri.conf.json`.

## Scripts
From `swiped-in/`:
```bash
npm run dev     # Next.js dev
npm run build   # Next.js build
npm start       # Next.js start (production)
```

## License
Add your license here.


