import { useEffect, useState } from 'react';
import { api } from '../api';
import { DashboardStats } from '../types';
import { BriefcaseBusiness, Users, BarChart3, Clock } from 'lucide-react';
import { STATUS_LABELS, STATUS_COLORS, cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.getStats().then(setStats);
  }, []);

  if (!stats) return <div className="flex items-center justify-center h-64 text-slate-400 font-mono text-sm">LOADING_SYSTEM_STATS...</div>;

  return (
    <div className="space-y-6">
      {/* Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Saved" value={stats.totalJobs} trend="+5 this week" trendColor="text-green-600" />
        <StatCard label="Interviewing" value={stats.statusStats.interviewing || 0} trend="Active Sessions" trendColor="text-indigo-600" />
        <StatCard label="Offers Received" value={stats.statusStats.offer || 0} trend="Target: 3" trendColor="text-slate-400" highlight />
        <StatCard label="Pending Follow-up" value={stats.statusStats.saved || 0} trend="Action Required" trendColor="text-orange-500" warning />
      </div>

      <div className="grid grid-cols-12 gap-6 pb-8">
        {/* Main Status Column */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-bold text-slate-700">Application Pipeline</h2>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-6">
              {Object.keys(STATUS_LABELS).map(key => (
                <div key={key} className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{STATUS_LABELS[key]}</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.statusStats[key] || 0}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-indigo-900 text-white p-6 rounded-xl flex items-center gap-6 shadow-xl shadow-indigo-900/20">
            <div className="w-12 h-12 bg-indigo-500/30 rounded-full flex items-center justify-center flex-shrink-0">
               <Clock size={24} className="text-indigo-200" />
            </div>
            <div>
              <p className="text-xs opacity-70 uppercase font-bold tracking-widest">Next Career Milestone</p>
              <h3 className="text-lg font-bold">You are {Math.round((stats.statusStats.offer || 0) / 3 * 100)}% closer to your target of 3 offers.</h3>
            </div>
          </div>
        </div>

        {/* Skills Column */}
        <div className="col-span-12 lg:col-span-4 h-full">
          <div className="bg-white p-6 rounded-xl border border-slate-200 h-full flex flex-col">
            <h2 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
              <BarChart3 size={18} className="text-indigo-500" />
              Skill Keyword Trends
            </h2>
            <div className="space-y-5 flex-1">
              {stats.keywordStats.slice(0, 6).map((skill, idx) => {
                const percentage = Math.round((skill.count / (stats.totalJobs || 1)) * 100);
                return (
                  <div key={skill.keyword} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{skill.keyword}</span>
                      <span>{percentage}% ({skill.count})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: idx * 0.1 }}
                        className="bg-indigo-500 h-full rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-3">System Suggestions</p>
              <div className="flex flex-wrap gap-2">
                {['Cloud Infrastructure', 'ETL Logic', 'Documentation'].map(tag => (
                  <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, trendColor, highlight = false, warning = false }: any) {
  return (
    <div className={cn(
      "bg-white p-5 rounded-xl border transition-all duration-200",
      highlight ? "border-indigo-200 ring-1 ring-indigo-500/10" : "border-slate-200"
    )}>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className={cn("text-3xl font-extrabold tracking-tight", highlight ? "text-indigo-600" : "text-slate-900")}>
          {value}
        </span>
        <span className={cn("text-[10px] font-bold uppercase", trendColor || "text-slate-400")}>
          {trend}
        </span>
      </div>
    </div>
  );
}
