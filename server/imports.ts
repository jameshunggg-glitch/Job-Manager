import fs from 'fs';
import path from 'path';
import db from './db.ts';
import { parseObsidianMarkdown, ParsedJob } from './obsidian-parser.ts';

const MAX_DEPTH = 2;

export interface ScanFile {
  path: string;
  filename: string;
  title: string;
  source_url: string;
  created: string | null;
  already_imported: boolean;
}

export interface PreviewResponse {
  parsed_job: ParsedJob;
  warnings: string[];
  already_imported: boolean;
  duplicate_reason: string | null;
  duplicate_job_id: number | null;
}

export interface ImportResult {
  job_id: number;
  status: 'imported' | 'duplicate';
  duplicate_reason?: string;
  warnings: string[];
}

function isHidden(name: string): boolean {
  return name.startsWith('.');
}

function resolveSafePath(input: string): string {
  if (typeof input !== 'string' || input.trim() === '') {
    throw new Error('path is required');
  }
  return path.resolve(input);
}

export function scanFolder(folderPath: string): ScanFile[] {
  const resolved = resolveSafePath(folderPath);

  let stat: fs.Stats;
  try {
    stat = fs.lstatSync(resolved);
  } catch (err: any) {
    if (err?.code === 'ENOENT') throw new Error(`Folder does not exist: ${resolved}`);
    if (err?.code === 'EACCES') throw new Error(`Permission denied: ${resolved}`);
    throw err;
  }
  if (stat.isSymbolicLink()) throw new Error('folder_path must not be a symlink');
  if (!stat.isDirectory()) throw new Error('folder_path must be a directory');

  const results: ScanFile[] = [];

  const walk = (dir: string, depth: number) => {
    if (depth > MAX_DEPTH) return;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (isHidden(entry.name)) continue;
      if (entry.isSymbolicLink()) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, depth + 1);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
        results.push(buildScanEntry(full));
      }
    }
  };

  walk(resolved, 0);
  return results.sort((a, b) => a.path.localeCompare(b.path));
}

function buildScanEntry(filePath: string): ScanFile {
  const filename = path.basename(filePath);
  let title = '';
  let source_url = '';
  let created: string | null = null;
  try {
    const text = fs.readFileSync(filePath, 'utf8');
    const parsed = parseObsidianMarkdown(text);
    title = parsed.parsedJob.title || filename.replace(/\.md$/i, '');
    source_url = parsed.parsedJob.source_url;
    created = parsed.parsedJob.created;
  } catch {
    title = filename.replace(/\.md$/i, '');
  }
  const already_imported = isAlreadyImported(source_url, filePath);
  return { path: filePath, filename, title, source_url, created, already_imported };
}

function isAlreadyImported(sourceUrl: string, filePath: string): boolean {
  if (sourceUrl) {
    const row = db.prepare('SELECT id FROM job_postings WHERE source_url = ? LIMIT 1').get(sourceUrl);
    if (row) return true;
  }
  if (filePath) {
    const row = db.prepare('SELECT id FROM job_postings WHERE imported_file_path = ? LIMIT 1').get(filePath);
    if (row) return true;
  }
  return false;
}

function findDuplicate(parsedJob: ParsedJob, filePath: string): { job_id: number; reason: string } | null {
  if (parsedJob.source_url) {
    const row = db
      .prepare('SELECT id FROM job_postings WHERE source_url = ? LIMIT 1')
      .get(parsedJob.source_url) as { id: number } | undefined;
    if (row) return { job_id: row.id, reason: 'source_url' };
  }
  if (filePath) {
    const row = db
      .prepare('SELECT id FROM job_postings WHERE imported_file_path = ? LIMIT 1')
      .get(filePath) as { id: number } | undefined;
    if (row) return { job_id: row.id, reason: 'imported_file_path' };
  }
  if (parsedJob.title && parsedJob.company) {
    const row = db
      .prepare('SELECT id FROM job_postings WHERE title = ? AND company = ? LIMIT 1')
      .get(parsedJob.title, parsedJob.company) as { id: number } | undefined;
    if (row) return { job_id: row.id, reason: 'title_and_company' };
  }
  return null;
}

function readMarkdownFile(filePath: string): string {
  const resolved = resolveSafePath(filePath);
  let stat: fs.Stats;
  try {
    stat = fs.lstatSync(resolved);
  } catch (err: any) {
    if (err?.code === 'ENOENT') throw new Error(`File does not exist: ${resolved}`);
    if (err?.code === 'EACCES') throw new Error(`Permission denied: ${resolved}`);
    throw err;
  }
  if (stat.isSymbolicLink()) throw new Error('file_path must not be a symlink');
  if (!stat.isFile()) throw new Error('file_path must be a regular file');
  return fs.readFileSync(resolved, 'utf8');
}

export function previewFile(filePath: string): PreviewResponse {
  const resolved = path.resolve(filePath);
  const text = readMarkdownFile(resolved);
  const result = parseObsidianMarkdown(text);
  const dup = findDuplicate(result.parsedJob, resolved);
  return {
    parsed_job: result.parsedJob,
    warnings: result.warnings,
    already_imported: dup !== null,
    duplicate_reason: dup?.reason ?? null,
    duplicate_job_id: dup?.job_id ?? null,
  };
}

export function importFile(filePath: string): ImportResult {
  const resolved = path.resolve(filePath);
  const text = readMarkdownFile(resolved);
  const { parsedJob, warnings } = parseObsidianMarkdown(text);

  const dup = findDuplicate(parsedJob, resolved);
  if (dup) {
    return { job_id: dup.job_id, status: 'duplicate', duplicate_reason: dup.reason, warnings };
  }
  if (!parsedJob.title) {
    throw new Error('Cannot import: parsed title is empty');
  }

  const info = db
    .prepare(
      `INSERT INTO job_postings (
        title, company, location, source, source_url,
        job_description, requirements, nice_to_have, salary,
        status, imported_from, imported_file_path, imported_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    )
    .run(
      parsedJob.title,
      parsedJob.company || 'Unknown',
      parsedJob.location || null,
      parsedJob.source || null,
      parsedJob.source_url || null,
      parsedJob.job_description || '',
      parsedJob.requirements || '',
      parsedJob.nice_to_have || null,
      parsedJob.salary || null,
      'saved',
      'obsidian',
      resolved,
    );

  return { job_id: Number(info.lastInsertRowid), status: 'imported', warnings };
}
