import React, { useState } from 'react';
import { api } from '../api';
import { JobPosting, JobStatus } from '../types';
import { STATUS_LABELS, cn } from '../lib/utils';
import { Save, X, Calendar, DollarSign, MapPin, Globe, Briefcase } from 'lucide-react';

interface JobFormProps {
  initialJob?: JobPosting;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function JobForm({ initialJob, onSuccess, onCancel }: JobFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<JobPosting>>(
    initialJob || {
      title: '',
      company: '',
      location: '',
      work_mode: 'hybrid',
      source: '',
      source_url: '',
      job_description: '',
      requirements: '',
      nice_to_have: '',
      salary: '',
      status: 'saved',
      notes: '',
      follow_up_date: '',
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.company) return alert('標題與公司為必填');
    
    setLoading(true);
    try {
      if (initialJob?.id) {
        await api.updateJob(initialJob.id, formData);
      } else {
        await api.createJob(formData);
      }
      onSuccess();
    } catch (err) {
      alert('儲存失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{initialJob ? '修改職缺資料' : '新增職缺'}</h2>
          <p className="text-slate-500">填寫下方資訊以完整紀錄職務細節。</p>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <X size={24} className="text-slate-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          {/* Main Info */}
          <div className="space-y-4 md:col-span-2">
             <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest border-b pb-2">基本資訊</h3>
          </div>

          <FormField label="職缺名稱 *" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Data Analyst" icon={Briefcase} />
          <FormField label="公司名稱 *" name="company" value={formData.company} onChange={handleChange} placeholder="e.g. Google" icon={Globe} />
          <FormField label="工作地點" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. 台北市" icon={MapPin} />
          
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">工作模式</label>
            <select
              name="work_mode"
              value={formData.work_mode}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none appearance-none"
            >
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
              <option value="remote">Remote</option>
            </select>
          </div>

          <FormField label="來源網站" name="source" value={formData.source} onChange={handleChange} placeholder="e.g. LinkedIn" />
          <FormField label="職缺連結" name="source_url" value={formData.source_url} onChange={handleChange} placeholder="https://..." />
          <FormField label="薪資資訊" name="salary" value={formData.salary} onChange={handleChange} placeholder="e.g. 80-100k" icon={DollarSign} />
          
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">申請狀態</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none appearance-none font-semibold"
            >
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <FormField label="追蹤日期" name="follow_up_date" value={formData.follow_up_date} onChange={handleChange} type="date" icon={Calendar} />

          {/* Details */}
          <div className="space-y-4 md:col-span-2 pt-6">
             <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest border-b pb-2">職務內容與要求</h3>
          </div>

          <div className="md:col-span-2 space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Job Description *</label>
            <textarea
              name="job_description"
              value={formData.job_description}
              onChange={handleChange}
              rows={6}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              placeholder="貼入職務描述..."
            />
          </div>

          <div className="md:col-span-2 space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Requirements *</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              placeholder="貼入必要條件..."
            />
          </div>

          <div className="md:col-span-2 space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nice to have</label>
            <textarea
              name="nice_to_have"
              value={formData.nice_to_have}
              onChange={handleChange}
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              placeholder="貼入加分條件..."
            />
          </div>

          <div className="md:col-span-2 space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">個人備註</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              placeholder="紀錄面試細節、主管姓名或 Follow-up 計畫..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 sticky bottom-8 py-4 px-6 bg-white/80 backdrop-blur border border-slate-200 rounded-2xl shadow-xl">
          <button type="button" onClick={onCancel} className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            取消
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:bg-blue-300"
          >
            <Save size={18} />
            {loading ? '儲存中...' : (initialJob ? '完成修改' : '建立職缺')}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormField({ label, name, value, onChange, placeholder, type = 'text', icon: Icon }: any) {
  return (
    <div className="space-y-1.5 text-left">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
      <div className="relative">
        {Icon && <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />}
        <input
          type={type}
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          className={cn(
            "w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all",
            Icon ? "pl-11 pr-4" : "px-4"
          )}
        />
      </div>
    </div>
  );
}
