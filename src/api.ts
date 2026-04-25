import { JobPosting, DashboardStats } from './types';

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
};
