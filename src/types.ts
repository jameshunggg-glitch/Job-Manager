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
