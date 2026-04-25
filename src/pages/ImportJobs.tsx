import React, { useState, useEffect } from 'react';
import { Upload, PlusCircle, Folder, Search, Eye, Download, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import JobForm from './JobForm';

type Tab = 'manual' | 'obsidian';

const LAST_FOLDER_KEY = 'importJobs_lastFolderPath';

export default function ImportJobs() {
  const [activeTab, setActiveTab] = useState<Tab>('manual');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Import Jobs</h2>
        <p className="text-slate-500">手動新增職缺，或從 Obsidian Web Clipper 匯入 markdown 檔案。</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        <TabButton active={activeTab === 'manual'} onClick={() => setActiveTab('manual')} icon={PlusCircle}>
          Manual Add
        </TabButton>
        <TabButton active={activeTab === 'obsidian'} onClick={() => setActiveTab('obsidian')} icon={Upload}>
          Obsidian Import
        </TabButton>
      </div>

      {activeTab === 'manual' && <ManualAddTab />}
      {activeTab === 'obsidian' && <ObsidianImportTab />}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, children }: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all',
        active
          ? 'bg-white text-indigo-600 shadow-sm'
          : 'text-slate-500 hover:text-slate-700'
      )}
    >
      <Icon size={15} />
      {children}
    </button>
  );
}

function ManualAddTab() {
  const [formKey, setFormKey] = useState(0);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSuccess = () => {
    setSuccessMsg(true);
    setFormKey(k => k + 1);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div>
      {successMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-3 text-sm font-semibold">
          職缺已成功新增！
        </div>
      )}
      <div key={formKey}>
        <JobForm onSuccess={handleSuccess} onCancel={() => {}} />
      </div>
    </div>
  );
}

// ─── Obsidian Import ──────────────────────────────────────────────────────────

interface ScannedFile {
  path: string;
  filename: string;
  title: string;
  source_url: string;
  created: string;
  already_imported: boolean;
}

function ObsidianImportTab() {
  const [folderPath, setFolderPath] = useState('');
  const [scanning, setScanning] = useState(false);
  const [files, setFiles] = useState<ScannedFile[] | null>(null);
  const [scanError, setScanError] = useState('');
  const [previewFile, setPreviewFile] = useState<ScannedFile | null>(null);
  const [importingPath, setImportingPath] = useState<string | null>(null);
  const [importedPaths, setImportedPaths] = useState<string[]>([]);

  // Remember last folder path
  useEffect(() => {
    const saved = localStorage.getItem(LAST_FOLDER_KEY);
    if (saved) setFolderPath(saved);
  }, []);

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFolderPath(e.target.value);
    localStorage.setItem(LAST_FOLDER_KEY, e.target.value);
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderPath.trim()) return;
    setScanning(true);
    setScanError('');
    setFiles(null);
    setPreviewFile(null);
    try {
      const res = await fetch('/api/import/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder_path: folderPath.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '掃描失敗');
      setFiles(data.files);
    } catch (err: any) {
      setScanError(err.message || '掃描時發生錯誤');
    } finally {
      setScanning(false);
    }
  };

  const handleImport = async (file: ScannedFile) => {
    setImportingPath(file.path);
    try {
      const res = await fetch('/api/import/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_path: file.path }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '匯入失敗');
      setImportedPaths(prev => [...prev, file.path]);
    } catch (err: any) {
      alert(`匯入失敗：${err.message}`);
    } finally {
      setImportingPath(null);
    }
  };

  const isImported = (path: string) =>
    importedPaths.includes(path);

  return (
    <div className="space-y-6">
      {/* Folder path input */}
      <form onSubmit={handleScan} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <Folder size={18} className="text-indigo-500" />
          Obsidian Clippings 資料夾
        </div>
        <p className="text-xs text-slate-400">
          輸入存放 Obsidian Web Clipper 匯出 markdown 的本機資料夾完整路徑。
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={folderPath}
            onChange={handleFolderChange}
            placeholder="/Users/yourname/Obsidian/clippings"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none font-mono"
          />
          <button
            type="submit"
            disabled={scanning || !folderPath.trim()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:bg-indigo-300 active:scale-95"
          >
            <Search size={15} />
            {scanning ? '掃描中...' : '掃描'}
          </button>
        </div>
      </form>

      {/* Scan error */}
      {scanError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          {scanError}
        </div>
      )}

      {/* File list */}
      {files !== null && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-600">
            找到 {files.length} 個 markdown 檔案
          </p>

          {files.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300 text-slate-400 text-sm">
              資料夾內沒有 .md 檔案
            </div>
          )}

          {files.map((file) => {
            const alreadyDone = file.already_imported || isImported(file.path);
            return (
              <div
                key={file.path}
                className="bg-white rounded-xl border border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{file.title || file.filename}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span className="font-mono truncate max-w-xs">{file.filename}</span>
                    {file.created && <span>{file.created}</span>}
                    {alreadyDone && (
                      <span className="text-green-600 font-bold uppercase tracking-widest">已匯入</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setPreviewFile(previewFile?.path === file.path ? null : file)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-widest"
                  >
                    <Eye size={13} />
                    預覽
                  </button>
                  <button
                    onClick={() => handleImport(file)}
                    disabled={alreadyDone || importingPath === file.path}
                    className={cn(
                      'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-widest',
                      alreadyDone
                        ? 'bg-slate-50 text-slate-300 border border-slate-200 cursor-default'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                    )}
                  >
                    <Download size={13} />
                    {importingPath === file.path ? '匯入中...' : '匯入'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview panel */}
      {previewFile && (
        <PreviewPanel file={previewFile} onClose={() => setPreviewFile(null)} onImport={handleImport} />
      )}
    </div>
  );
}

// ─── Preview Panel ────────────────────────────────────────────────────────────

interface PreviewPanelProps {
  file: ScannedFile;
  onClose: () => void;
  onImport: (file: ScannedFile) => void;
}

interface ParsedJob {
  title?: string;
  company?: string;
  location?: string;
  salary?: string;
  source_url?: string;
  source?: string;
  job_description?: string;
  requirements?: string;
  nice_to_have?: string;
}

function PreviewPanel({ file, onClose, onImport }: PreviewPanelProps) {
  const [parsed, setParsed] = useState<ParsedJob | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch('/api/import/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_path: file.path }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setParsed(data.parsed_job);
        setWarnings(data.warnings || []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [file.path]);

  return (
    <div className="bg-white rounded-xl border border-indigo-200 shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-indigo-50/50">
        <p className="font-semibold text-slate-700 text-sm">解析預覽：{file.filename}</p>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-widest">
          關閉
        </button>
      </div>

      <div className="p-6">
        {loading && <p className="text-slate-400 text-sm font-mono">PARSING...</p>}
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle size={15} />
            {error}
          </div>
        )}
        {parsed && (
          <div className="space-y-4">
            {warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-xs text-yellow-700 space-y-1">
                {warnings.map((w, i) => <p key={i}>⚠ {w}</p>)}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PreviewField label="職稱" value={parsed.title} />
              <PreviewField label="公司" value={parsed.company} />
              <PreviewField label="地點" value={parsed.location} />
              <PreviewField label="薪資" value={parsed.salary} />
              <PreviewField label="來源" value={parsed.source} />
              <PreviewField label="URL" value={parsed.source_url} />
            </div>
            <PreviewField label="工作內容" value={parsed.job_description} multiline />
            <PreviewField label="條件要求" value={parsed.requirements} multiline />
            <PreviewField label="加分條件" value={parsed.nice_to_have} multiline />

            <div className="flex justify-end pt-2">
              <button
                onClick={() => onImport(file)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all active:scale-95"
              >
                <Download size={15} />
                確認匯入
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewField({ label, value, multiline = false }: { label: string; value?: string; multiline?: boolean }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      {multiline ? (
        <p className="text-xs text-slate-700 whitespace-pre-wrap line-clamp-4 bg-slate-50 rounded-lg p-3">{value}</p>
      ) : (
        <p className="text-sm text-slate-800 font-medium">{value}</p>
      )}
    </div>
  );
}
