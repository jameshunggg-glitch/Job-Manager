export interface KeywordCategory {
  name: string;
  keywords: string[];
}

export const KEYWORD_CATEGORIES: KeywordCategory[] = [
  {
    name: 'Programming / Data',
    keywords: [
      'Python', 'SQL', 'R', 'Pandas', 'NumPy', 'Statistics',
      'Machine Learning', 'Deep Learning', '機器學習', '深度學習', '資料分析',
    ],
  },
  {
    name: 'AI / LLM',
    keywords: [
      'LLM', 'RAG', 'Prompt Engineering', 'LangChain', 'Agent',
      'Semantic Search', 'Vector Database', 'Weaviate', 'Transformers',
      '生成式 AI', '語意搜尋',
    ],
  },
  {
    name: 'Backend / Web',
    keywords: [
      'FastAPI', 'REST API', 'Flask', 'Django', 'React', 'Vue',
      'JavaScript', 'TypeScript', 'API',
    ],
  },
  {
    name: 'Data / BI Tools',
    keywords: [
      'Power BI', 'Tableau', 'Excel', 'ETL', 'Data Pipeline',
      'Data Engineering', 'BigQuery', 'Snowflake', 'PostgreSQL', 'MySQL',
      '資料工程',
    ],
  },
  {
    name: 'Cloud / DevOps',
    keywords: [
      'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'CI/CD', 'Git',
    ],
  },
  {
    name: 'Soft Skills / Business',
    keywords: [
      'Communication', 'Stakeholder', 'Presentation', 'Cross-functional',
      'Business Analysis', 'Project Management', 'Reporting',
      '溝通', '跨部門', '專案管理',
    ],
  },
];

export const ALL_KEYWORDS = KEYWORD_CATEGORIES.flatMap(c => c.keywords);

// Single-letter keywords (e.g. "R") use word-boundary matching to avoid
// false positives like "requirements" matching "R". Multi-character
// keywords keep case-insensitive substring matching so embedded forms such
// as "MySQL" still match "SQL".
export function matchesKeyword(text: string, keyword: string): boolean {
  if (!text || !keyword) return false;
  if (keyword.length === 1) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
  }
  return text.toLowerCase().includes(keyword.toLowerCase());
}
