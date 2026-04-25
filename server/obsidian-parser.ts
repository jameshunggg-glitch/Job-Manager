import matter from 'gray-matter';

export interface ParsedJob {
  title: string;
  company: string;
  location: string;
  source: string;
  source_url: string;
  job_description: string;
  requirements: string;
  nice_to_have: string;
  salary: string;
  created: string | null;
}

export interface ParseResult {
  parsedJob: ParsedJob;
  warnings: string[];
  raw_markdown: string;
}

const SOURCE_HOST_MAP: Array<[RegExp, string]> = [
  [/(^|\.)104\.com\.tw$/i, '104'],
  [/(^|\.)1111\.com\.tw$/i, '1111'],
  [/(^|\.)cakeresume\.com$/i, 'Cake'],
  [/(^|\.)cake\.me$/i, 'Cake'],
  [/(^|\.)linkedin\.com$/i, 'LinkedIn'],
  [/(^|\.)indeed\.com$/i, 'Indeed'],
  [/(^|\.)yourator\.co$/i, 'Yourator'],
];

function inferSourceFromUrl(url: string): string {
  if (!url) return '';
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    for (const [re, name] of SOURCE_HOST_MAP) {
      if (re.test(host)) return name;
    }
    return host;
  } catch {
    return '';
  }
}

function splitTitle(rawTitle: string): { title: string; company: string; sourceFromTitle: string } {
  if (!rawTitle) return { title: '', company: '', sourceFromTitle: '' };
  const t = rawTitle.trim();
  const parts = t.split(/[｜|]/);
  if (parts.length >= 2) {
    const titlePart = parts[0].trim();
    const rest = parts.slice(1).join('|').trim();
    const restParts = rest.split(/[－-]/);
    const company = (restParts[0] || '').trim();
    const sourceFromTitle = restParts.slice(1).join('-').trim();
    return { title: titlePart, company, sourceFromTitle };
  }
  return { title: t, company: '', sourceFromTitle: '' };
}

interface HeadingNode {
  level: number;
  heading: string;
  body: string;
}

function extractHeadings(body: string): HeadingNode[] {
  const headings: HeadingNode[] = [];
  const lines = body.split(/\r?\n/);
  let current: HeadingNode | null = null;
  let buffer: string[] = [];
  const flush = () => {
    if (current !== null) {
      current.body = buffer.join('\n').trim();
      headings.push(current);
    }
  };
  for (const line of lines) {
    const m = line.match(/^(#{2,6})\s+(.+?)\s*$/);
    if (m) {
      flush();
      current = { level: m[1].length, heading: m[2].trim(), body: '' };
      buffer = [];
    } else if (current !== null) {
      buffer.push(line);
    }
  }
  flush();
  return headings;
}

function findHeadingIndex(headings: HeadingNode[], candidates: string[]): number {
  for (let i = 0; i < headings.length; i++) {
    if (candidates.includes(headings[i].heading)) return i;
  }
  for (let i = 0; i < headings.length; i++) {
    for (const c of candidates) {
      if (headings[i].heading.includes(c)) return i;
    }
  }
  return -1;
}

function pickSection(headings: HeadingNode[], candidates: string[]): string {
  const idx = findHeadingIndex(headings, candidates);
  return idx >= 0 ? headings[idx].body : '';
}

// pickBlock returns the matched heading's body PLUS any nested subheadings
// (with level > matched.level) until the next sibling/parent heading. Used
// for sections like 104 markdown's `## 條件要求`, where the meaningful
// content lives in level-3 subheadings rather than direct body text.
function pickBlock(headings: HeadingNode[], candidates: string[]): string {
  const idx = findHeadingIndex(headings, candidates);
  if (idx < 0) return '';
  const root = headings[idx];
  const parts: string[] = [];
  if (root.body) parts.push(root.body);
  for (let i = idx + 1; i < headings.length; i++) {
    if (headings[i].level <= root.level) break;
    const sub = headings[i];
    const hashes = '#'.repeat(sub.level);
    parts.push(sub.body ? `${hashes} ${sub.heading}\n${sub.body}` : `${hashes} ${sub.heading}`);
  }
  return parts.join('\n\n').trim();
}

export function parseObsidianMarkdown(text: string): ParseResult {
  const warnings: string[] = [];

  let parsed;
  try {
    parsed = matter(text);
  } catch (err: any) {
    throw new Error(`Failed to parse YAML frontmatter: ${err?.message ?? String(err)}`);
  }

  const fm = (parsed.data ?? {}) as Record<string, unknown>;
  const body = parsed.content ?? '';

  const rawTitle = typeof fm.title === 'string' ? fm.title : '';
  const { title, company, sourceFromTitle } = splitTitle(rawTitle);

  const source_url = typeof fm.source === 'string' ? fm.source : '';
  const inferredSource = inferSourceFromUrl(source_url) || sourceFromTitle;

  const headings = extractHeadings(body);

  const job_description =
    pickSection(headings, ['工作內容', 'Job Description', 'Description']) ||
    (typeof fm.description === 'string' ? fm.description : '');

  const requirements = pickBlock(headings, ['條件要求', 'Requirements', 'Qualifications']);
  const nice_to_have = pickBlock(headings, ['加分條件', 'Nice to Have', 'Preferred Qualifications', 'Preferred']);
  const salary = pickSection(headings, ['工作待遇', 'Salary', 'Compensation']);
  const location = pickSection(headings, ['上班地點', 'Location']);

  let created: string | null = null;
  if (typeof fm.created === 'string') {
    created = fm.created;
  } else if (fm.created instanceof Date) {
    created = fm.created.toISOString().slice(0, 10);
  }

  if (!title) warnings.push('title not found in frontmatter');
  if (!company) warnings.push('company could not be inferred from title');
  if (!source_url) warnings.push('source URL not found in frontmatter');
  if (!job_description) warnings.push('job description (## 工作內容) not found');
  if (!requirements) warnings.push('requirements (## 條件要求) not found');

  return {
    parsedJob: {
      title,
      company,
      location,
      source: inferredSource,
      source_url,
      job_description,
      requirements,
      nice_to_have,
      salary,
      created,
    },
    warnings,
    raw_markdown: text,
  };
}
