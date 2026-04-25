import React from 'react';
import { LayoutDashboard, BriefcaseBusiness, Search, PlusCircle, BarChart3, Upload } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs', label: 'Job Postings', icon: BriefcaseBusiness },
    { id: 'skill-insights', label: 'Skill Insights', icon: BarChart3 },
    { id: 'import', label: 'Import Jobs', icon: Upload },
    { id: 'search', label: 'Mock Search', icon: Search },
  ];

  const getPageTitle = () => {
    const item = menuItems.find(i => i.id === currentPage);
    if (currentPage === 'detail') return 'Job Details';
    if (currentPage === 'edit') return 'Edit Job';
    if (currentPage === 'new') return 'Add Job';
    return item?.label || 'Overview';
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">J</div>
          <span className="font-semibold text-white tracking-tight">Job Tracker</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left",
                currentPage === item.id 
                  ? "bg-indigo-600/10 text-indigo-400" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              <item.icon size={18} />
              {item.label}
              {currentPage === item.id && (
                <motion.div layoutId="active" className="ml-auto w-1 h-1 bg-indigo-400 rounded-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800 flex flex-col gap-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Storage Status</div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            SQLite Persistence v1.0
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0">
          <h1 className="text-xl font-bold text-slate-800">{getPageTitle()}</h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onPageChange('new')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <PlusCircle size={16} />
              New Job
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="max-w-7xl mx-auto h-full"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
