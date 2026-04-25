import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'jobs.sqlite');
const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS job_postings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    work_mode TEXT,
    source TEXT,
    source_url TEXT,
    job_description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    nice_to_have TEXT,
    salary TEXT,
    status TEXT DEFAULT 'saved',
    notes TEXT,
    follow_up_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Phase 4: additive import-metadata columns. Idempotent — safe to run on
// existing databases. Each ALTER TABLE is wrapped so a re-run on a database
// that already has the column does not fail.
const IMPORT_COLUMNS: Array<[string, string]> = [
  ['imported_from', 'TEXT'],
  ['imported_file_path', 'TEXT'],
  ['imported_at', 'DATETIME'],
  ['raw_markdown', 'TEXT'],
];
for (const [name, type] of IMPORT_COLUMNS) {
  try {
    db.exec(`ALTER TABLE job_postings ADD COLUMN ${name} ${type};`);
  } catch (err: any) {
    const msg = String(err?.message ?? '');
    if (!msg.includes('duplicate column name')) throw err;
  }
}

export default db;
