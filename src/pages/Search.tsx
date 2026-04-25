import React, { useState } from 'react';
import { Search as SearchIcon, MapPin, Globe, DollarSign, Bookmark, BookmarkCheck, Briefcase } from 'lucide-react';
import { api } from '../api';
import { JobPosting } from '../types';
import { cn } from '../lib/utils';

const MOCK_JOBS = [
  {
    title: 'Data Analyst',
    company: 'TechFlow Global',
    location: '台北市',
    work_mode: 'hybrid',
    source: 'Mock',
    source_url: 'https://example.com/job1',
    job_description: '負責產出業務報表，優化資料流程。使用 SQL 與 Tableau 進行數據分析。',
    requirements: '2年以上 SQL 經驗, Python 基礎, 溝通能力佳。',
    nice_to_have: 'Docker, AWS 經驗。',
    salary: '70k - 90k TWD',
  },
  {
    title: 'Senior Business Analyst',
    company: 'FinTech Solutions',
    location: '遠端',
    work_mode: 'remote',
    source: 'Mock',
    source_url: 'https://example.com/job2',
    job_description: '分析市場趨勢，與利益相關者溝通需求。制定報表規格。',
    requirements: 'Tableau, Power BI, Excel 進階, Stakeholder management。',
    nice_to_have: 'MySQL, BigQuery。',
    salary: '100k - 130k TWD',
  },
  {
    title: 'Python Developer (Data Team)',
    company: 'DataStream Inc.',
    location: '新竹市',
    work_mode: 'onsite',
    source: 'Mock',
    source_url: 'https://example.com/job3',
    job_description: '開發 ETL 流程，維護資料 API。負責大數據清洗。',
    requirements: 'Python 熟練, ETL 經驗, Git, API 開發。',
    nice_to_have: 'GCP, Snowflake, Machine Learning。',
    salary: '80k - 110k TWD',
  },
  {
    title: 'Data Engineer',
    company: 'CloudScale',
    location: '台北市',
    work_mode: 'hybrid',
    source: 'Mock',
    source_url: 'https://example.com/job4',
    job_description: '建立與維護雲端資料倉儲。優化資料處理效能。',
    requirements: 'SQL, Python, Spark, AWS, Snowflake。',
    nice_to_have: 'Airflow, Kubernetes。',
    salary: '90k - 120k TWD',
  },
  {
    title: 'Marketing Analyst',
    company: 'GrowFast Co.',
    location: '台北市',
    work_mode: 'hybrid',
    source: 'Mock',
    source_url: 'https://example.com/job5',
    job_description: '透過數據優化行銷成效。進行 A/B Testing 分析。',
    requirements: 'Google Analytics, SQL, Statistics, Excel',
    nice_to_have: 'Python (Pandas), Presentation skills',
    salary: '60k - 80k TWD',
  },
];

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(MOCK_JOBS);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savingLoading, setSavingLoading] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const filtered = MOCK_JOBS.filter(job => 
      job.title.toLowerCase().includes(query.toLowerCase()) ||
      job.company.toLowerCase().includes(query.toLowerCase()) ||
      job.job_description.toLowerCase().includes(query.toLowerCase()) ||
      job.requirements.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  };

  const handleSave = async (job: any) => {
    setSavingLoading(job.title);
    try {
      await api.createJob({ ...job, status: 'saved' });
      setSavedIds(prev => [...prev, job.title]); // Using title as unique key for mock search items
    } catch (err) {
      alert('收藏失敗');
    } finally {
      setSavingLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">職缺搜尋 (Mock)</h2>
        <p className="text-slate-500">輸入關鍵字搜尋模擬職缺，並隨時收藏到你的清單中。</p>
      </div>

      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500">
          <SearchIcon size={20} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜尋職位、公司、技能..."
          className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
        <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          搜尋
        </button>
      </form>

      <div className="grid grid-cols-1 gap-4">
        {results.map((job, idx) => {
          const isSaved = savedIds.includes(job.title);
          return (
            <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 flex-1 text-left">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-800">{job.title}</h3>
                  <span className="text-[10px] uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold">
                    {job.work_mode}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-indigo-500" /> {job.company}</span>
                  <span className="flex items-center gap-1.5"><MapPin size={14} className="text-indigo-500" /> {job.location}</span>
                  <span className="flex items-center gap-1.5"><Globe size={14} className="text-indigo-500" /> {job.source}</span>
                  <span className="flex items-center gap-1.5 text-indigo-600 font-bold"><DollarSign size={14} /> {job.salary}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleSave(job)}
                  disabled={isSaved || savingLoading === job.title}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all w-full md:w-auto justify-center uppercase tracking-widest",
                    isSaved 
                      ? "bg-slate-50 text-slate-400 border border-slate-200 cursor-default" 
                      : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95"
                  )}
                >
                  {isSaved ? (
                    'SAVED'
                  ) : (
                    'SAVE JOB'
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {results.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <SearchIcon size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">找不到符合關鍵字的職缺...</p>
          </div>
        )}
      </div>
    </div>
  );
}
