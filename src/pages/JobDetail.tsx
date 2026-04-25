import { useEffect, useState } from 'react';
import { api } from '../api';
import { JobPosting } from '../types';
import { STATUS_LABELS, STATUS_COLORS } from '../lib/utils';
import { MapPin, Globe, DollarSign, Calendar, Edit2, Trash2, ArrowLeft, ExternalLink, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface JobDetailProps {
  jobId: number;
  onBack: () => void;
  onEdit: (job: JobPosting) => void;
  onDelete: () => void;
}

export default function JobDetail({ jobId, onBack, onEdit, onDelete }: JobDetailProps) {
  const [job, setJob] = useState<JobPosting | null>(null);

  useEffect(() => {
    api.getJob(jobId).then(setJob);
  }, [jobId]);

  const handleDelete = async () => {
    if (confirm('確定要刪除這筆職缺嗎？')) {
      await api.deleteJob(jobId);
      onDelete();
    }
  };

  if (!job) return <div className="text-slate-400 text-center py-20">載入詳情中...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium">
          <ArrowLeft size={18} /> 返回職缺列表
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(job)} className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-bold transition-all">
            <Edit2 size={16} /> 編輯
          </button>
          <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-bold transition-all">
            <Trash2 size={16} /> 刪除
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[job.status]}`}>
                  {STATUS_LABELS[job.status]}
                </span>
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <Clock size={12} /> 更新於 {format(new Date(job.updated_at), 'yyyy-MM-dd HH:mm')}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500 font-medium">
                <span className="flex items-center gap-1.5"><Globe size={18} className="text-blue-500" /> {job.company}</span>
                <span className="flex items-center gap-1.5"><MapPin size={18} className="text-blue-500" /> {job.location || '未標註'}</span>
                <span className="flex items-center gap-1.5 capitalize"><Briefcase size={18} className="text-blue-500" /> {job.work_mode}</span>
                {job.salary && <span className="flex items-center gap-1.5 text-green-600"><DollarSign size={18} /> {job.salary}</span>}
              </div>
            </div>

            <div className="prose prose-slate max-w-none">
              <Section title="Job Description" content={job.job_description} />
              <Section title="Requirements" content={job.requirements} />
              {job.nice_to_have && <Section title="Nice to have" content={job.nice_to_have} />}
            </div>
          </div>
        </div>

        {/* Sidebar / Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl shadow-blue-500/20">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar size={20} /> 追蹤紀錄
            </h3>
            <div className="space-y-4">
              <div className="bg-blue-700/50 p-4 rounded-2xl border border-white/10">
                <p className="text-xs text-blue-200 font-bold uppercase tracking-wider mb-1">建立日期</p>
                <p className="font-semibold text-lg">{format(new Date(job.created_at), 'yyyy-MM-dd')}</p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <p className="text-xs text-blue-200 font-bold uppercase tracking-wider mb-1">Follow-up Date</p>
                <p className="font-semibold text-lg">{job.follow_up_date ? format(new Date(job.follow_up_date), 'yyyy-MM-dd') : '尚未設定'}</p>
              </div>
              {job.source_url && (
                <a 
                  href={job.source_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center justify-center gap-2 w-full py-3 bg-white text-blue-600 rounded-2xl font-bold hover:bg-blue-50 transition-colors mt-6 shadow-lg shadow-black/10"
                >
                  <ExternalLink size={18} /> 查看職缺原網址
                </a>
              )}
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-3xl text-white">
            <h3 className="text-lg font-bold mb-4">我的備註</h3>
            <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
              {job.notes || '尚未填錄備註。點擊編輯按鈕來補充面試細節、準備方向或相關資源。'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div className="py-6 border-b border-slate-100 last:border-0">
      <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-[15px]">{content}</p>
    </div>
  );
}

function Briefcase({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
