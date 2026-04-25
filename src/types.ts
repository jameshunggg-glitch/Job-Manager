export type JobStatus = 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'closed';

export interface JobPosting {
  id: number;
  title: string;
  company: string;
  location?: string;
  work_mode?: string;
  source?: string;
  source_url?: string;
  job_description: string;
  requirements: string;
  nice_to_have?: string;
  salary?: string;
  status: JobStatus;
  notes?: string;
  follow_up_date?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalJobs: number;
  keywordStats: { keyword: string; count: number }[];
  statusStats: Record<string, number>;
}

export interface SkillStat {
  keyword: string;
  count: number;
  percentage: number;
}

export interface SkillCategoryData {
  name: string;
  keywords: SkillStat[];
  total: number;
}

export interface SkillInsightsData {
  totalJobs: number;
  topKeywords: SkillStat[];
  categories: SkillCategoryData[];
  requirementsKeywords: SkillStat[];
  niceToHaveKeywords: SkillStat[];
}

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

export interface ScanResultFile {
  path: string;
  filename: string;
  title: string;
  source_url: string;
  created: string | null;
  already_imported: boolean;
}

export interface ScanResponse {
  files: ScanResultFile[];
}

export interface ImportPreviewResponse {
  parsed_job: ParsedJob;
  warnings: string[];
  already_imported: boolean;
  duplicate_reason: string | null;
  duplicate_job_id: number | null;
}

export interface ImportResponse {
  job_id: number;
  status: 'imported' | 'duplicate';
  duplicate_reason?: string;
  warnings: string[];
}

export interface JobSkillMatch {
  keyword: string;
  in_job_description: boolean;
  in_requirements: boolean;
  in_nice_to_have: boolean;
}

export interface JobSkillCategory {
  name: string;
  matches: JobSkillMatch[];
}

export interface JobSkillsResponse {
  job_id: number;
  total_matches: number;
  categories: JobSkillCategory[];
}
