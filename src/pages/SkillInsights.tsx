import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Star, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../api';
import { SkillInsightsData, SkillStat } from '../types';
import { cn } from '../lib/utils';

export default function SkillInsights() {
  const [data, setData] = useState<SkillInsightsData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getSkillInsights()
      .then(setData)
      .catch(() => setError('無法載入技能分析資料'));
  }, []);

  if (error) return (
    <div className="flex items-center justify-center h-64 text-red-400 text-sm">{error}</div>
  );

  if (!data) return (
    <div className="flex items-center justify-center h-64 text-slate-400 font-mono text-sm">
      ANALYZING_SKILLS...
    </div>
  );

  if (data.totalJobs === 0) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
      <BarChart3 size={40} className="text-slate-300" />
      <p className="text-sm">尚無職缺資料，請先新增職缺再查看技能分析。</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Skill Insights</h2>
        <p className="text-slate-500">根據 {data.totalJobs} 筆收藏職缺分析關鍵技能需求。</p>
      </div>

      {/* Top Keywords */}
      <Section icon={TrendingUp} title="Top Keywords">
        <div className="space-y-3">
          {data.topKeywords.slice(0, 10).map((skill, idx) => (
            <React.Fragment key={skill.keyword}>
              <KeywordBar skill={skill} idx={idx} total={data.totalJobs} />
            </React.Fragment>
          ))}
        </div>
      </Section>

      {/* Requirements vs Nice-to-have */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section icon={BookOpen} title="必要條件 (Requirements)">
          {data.requirementsKeywords.length === 0
            ? <EmptyState text="requirements 欄位尚無關鍵字命中" />
            : <TagCloud keywords={data.requirementsKeywords} color="indigo" />
          }
        </Section>
        <Section icon={Star} title="加分條件 (Nice-to-have)">
          {data.niceToHaveKeywords.length === 0
            ? <EmptyState text="nice_to_have 欄位尚無關鍵字命中" />
            : <TagCloud keywords={data.niceToHaveKeywords} color="violet" />
          }
        </Section>
      </div>

      {/* Categories */}
      <Section icon={BarChart3} title="技能分類統計">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.categories.map(cat => (
            <div key={cat.name} className="bg-slate-50 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{cat.name}</p>
                <span className="text-xs font-bold text-indigo-500">{cat.total} hits</span>
              </div>
              {cat.keywords.length === 0
                ? <p className="text-xs text-slate-300">尚無命中</p>
                : (
                  <div className="flex flex-wrap gap-1.5">
                    {cat.keywords.map(k => (
                      <span
                        key={k.keyword}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-[11px] font-semibold text-slate-700"
                      >
                        {k.keyword}
                        <span className="ml-1.5 text-indigo-400 font-bold">{k.count}</span>
                      </span>
                    ))}
                  </div>
                )
              }
            </div>
          ))}
        </div>
      </Section>

      {/* Preparation Focus */}
      <Section icon={TrendingUp} title="Preparation Focus">
        <p className="text-xs text-slate-400 mb-4">根據頻率排序，建議優先準備以下技能：</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {data.topKeywords.slice(0, 3).map((skill, idx) => (
            <div
              key={skill.keyword}
              className={cn(
                'rounded-xl p-5 space-y-1',
                idx === 0 ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200'
              )}
            >
              <p className={cn('text-[10px] font-bold uppercase tracking-widest', idx === 0 ? 'text-indigo-200' : 'text-slate-400')}>
                #{idx + 1} Priority
              </p>
              <p className={cn('text-lg font-extrabold', idx === 0 ? 'text-white' : 'text-slate-900')}>{skill.keyword}</p>
              <p className={cn('text-xs font-semibold', idx === 0 ? 'text-indigo-200' : 'text-slate-400')}>
                出現於 {skill.count} 筆職缺 ({skill.percentage}%)
              </p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
        <Icon size={16} className="text-indigo-500" />
        <h3 className="font-bold text-slate-700 text-sm">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function KeywordBar({ skill, idx, total }: { skill: SkillStat; idx: number; total: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-bold text-slate-700">
        <span>{skill.keyword}</span>
        <span className="text-slate-400">{skill.count} / {total} ({skill.percentage}%)</span>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${skill.percentage}%` }}
          transition={{ duration: 0.8, delay: idx * 0.05 }}
          className="bg-indigo-500 h-full rounded-full"
        />
      </div>
    </div>
  );
}

function TagCloud({ keywords, color }: { keywords: SkillStat[]; color: 'indigo' | 'violet' }) {
  const base = color === 'indigo'
    ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
    : 'bg-violet-50 text-violet-700 border-violet-100';

  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map(k => (
        <span key={k.keyword} className={cn('px-3 py-1.5 rounded-full text-xs font-bold border', base)}>
          {k.keyword}
          <span className="ml-1.5 opacity-60">{k.count}</span>
        </span>
      ))}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-xs text-slate-300 py-2">{text}</p>;
}
