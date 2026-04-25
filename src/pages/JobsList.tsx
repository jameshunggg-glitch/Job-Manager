import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { JobPosting } from '../types';
import { STATUS_LABELS, STATUS_COLORS } from '../lib/utils';
import { Search as SearchIcon, Filter, ExternalLink, Calendar, MapPin, ChevronRight, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function JobsList({ onSelectJob }: { onSelectJob: (id: number) => void }) {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getJobs().then(data => {
      setJobs(data);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('確定要刪除這筆職缺嗎？')) return;
    await api.deleteJob(id);
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(filter.toLowerCase()) || 
                          job.company.toLowerCase().includes(filter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="text-slate-400 text-center py-20">載入職缺中...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter by title or company..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg py-2 px-4 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200">
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Job Title / Company</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Follow-up</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Last Updated</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredJobs.map(job => (
              <tr 
                key={job.id} 
                className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                onClick={() => onSelectJob(job.id)}
              >
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {job.title}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{job.company} • {job.location || 'Remote'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[job.status]}`}>
                    {STATUS_LABELS[job.status]}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {job.follow_up_date ? (
                    <span className="text-slate-600 font-medium flex items-center gap-2">
                       {format(new Date(job.follow_up_date), 'MMM dd, yyyy')}
                    </span>
                  ) : (
                    <span className="text-slate-300 text-xs">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                  {format(new Date(job.updated_at), 'yyyy-MM-dd HH:mm')}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <span className="text-indigo-600 font-bold text-xs uppercase tracking-widest">View</span>
                    <button
                      onClick={(e) => handleDelete(e, job.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded"
                      title="刪除"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredJobs.length === 0 && (
          <div className="py-20 text-center text-slate-400 font-medium border-t border-slate-100">
            NO_RECORDS_FOUND
          </div>
        )}
      </div>
    </div>
  );
}
