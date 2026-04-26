# Job Manager

A personal job application tracker. Save job postings, track application status, import clippings from Obsidian Web Clipper, and analyze skill keywords across your saved jobs — all stored in a local SQLite file. No cloud, no auth, no LLMs.

## Features

- **Dashboard** — totals, status breakdown, top-3 skills summary
- **Job Postings** — searchable list, status filter, inline delete, detail view with matched skill tags
- **Skill Insights** — top keywords, requirements vs nice-to-have, category breakdown, preparation focus
- **Import Jobs** — manual add form, plus Obsidian markdown importer (folder scan → preview → import with dedup)
- **Mock Search** — sample job listings for demo

## Supported Obsidian Web Clipper sources

The markdown importer parses clippings from:

| Site | Domain |
|---|---|
| 104 人力銀行 | `104.com.tw` |
| 1111 人力銀行 | `1111.com.tw` |
| Cake | `cake.me` |
| Yourator | `yourator.co` |
| LinkedIn | `linkedin.com` |

Each site uses different heading vocabulary and title formatting; the parser handles all five.

## Tech stack

- React 19 + Vite + Tailwind CSS (frontend)
- Express (API)
- better-sqlite3 (local file-based DB, no separate install)
- gray-matter (markdown frontmatter)
- TypeScript end to end, served by `tsx` in dev (no build step required to run)

## Run locally

See [requirements.txt](./requirements.txt) for system prerequisites.

```bash
npm install
npm run dev
# open http://localhost:3000
```

The first boot creates `jobs.sqlite` in the project root. The schema migrates additively on each start, so existing data is preserved across upgrades.

## Privacy

Personal data is kept out of git by `.gitignore`:

- `*.sqlite` / `*.db` — the job database
- `obsidian_imports/`, `clippings/`, `job_clippings/`, `*.private.md` — clipping folders
- `.env`, `.env.local`
- `*_claude_spec.md` — local planning docs

The Obsidian importer takes the path to your clippings folder at runtime via the UI; it's never persisted to code or git.
