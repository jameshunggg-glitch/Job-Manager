import {
  JobPosting,
  DashboardStats,
  SkillInsightsData,
  ScanResponse,
  ImportPreviewResponse,
  ImportResponse,
  JobSkillsResponse,
} from './types';

const API_BASE = '/api';

export const api = {
  getJobs: () => fetch(`${API_BASE}/jobs`).then(r => r.json() as Promise<JobPosting[]>),
  getJob: (id: string | number) => fetch(`${API_BASE}/jobs/${id}`).then(r => r.json() as Promise<JobPosting>),
  createJob: (job: Partial<JobPosting>) => fetch(`${API_BASE}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(job),
  }).then(r => r.json()),
  updateJob: (id: string | number, job: Partial<JobPosting>) => fetch(`${API_BASE}/jobs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(job),
  }).then(r => r.json()),
  deleteJob: (id: string | number) => fetch(`${API_BASE}/jobs/${id}`, {
    method: 'DELETE',
  }).then(r => r.json()),
  getStats: () => fetch(`${API_BASE}/stats`).then(r => r.json() as Promise<DashboardStats>),
  getSkillInsights: () => fetch(`${API_BASE}/skills/insights`).then(r => r.json() as Promise<SkillInsightsData>),
  getJobSkills: (id: string | number) =>
    fetch(`${API_BASE}/jobs/${id}/skills`).then(r => r.json() as Promise<JobSkillsResponse>),
  obsidianScan: (folderPath: string) => fetch(`${API_BASE}/import/obsidian/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder_path: folderPath }),
  }).then(r => r.json() as Promise<ScanResponse | { error: string }>),
  obsidianPreview: (filePath: string) => fetch(`${API_BASE}/import/obsidian/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_path: filePath }),
  }).then(r => r.json() as Promise<ImportPreviewResponse | { error: string }>),
  obsidianImport: (filePath: string) => fetch(`${API_BASE}/import/obsidian/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_path: filePath }),
  }).then(r => r.json() as Promise<ImportResponse | { error: string }>),
};
