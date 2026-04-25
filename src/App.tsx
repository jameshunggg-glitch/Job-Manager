import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import JobsList from './pages/JobsList';
import JobDetail from './pages/JobDetail';
import JobForm from './pages/JobForm';
import SkillInsights from './pages/SkillInsights';
import ImportJobs from './pages/ImportJobs';
import { JobPosting } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    setSelectedJobId(null);
    setEditingJob(null);
  };

  const handleSelectJob = (id: number) => {
    setSelectedJobId(id);
    setCurrentPage('detail');
  };

  const handleEditJob = (job: JobPosting) => {
    setEditingJob(job);
    setCurrentPage('edit');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'jobs':
        return <JobsList onSelectJob={handleSelectJob} />;
      case 'skill-insights':
        return <SkillInsights />;
      case 'import':
        return <ImportJobs />;
      case 'search':
        return <Search />;
      case 'new':
        return <JobForm onCancel={() => navigateTo('dashboard')} onSuccess={() => navigateTo('jobs')} />;
      case 'edit':
        return editingJob ? (
          <JobForm 
            initialJob={editingJob} 
            onCancel={() => handleSelectJob(editingJob.id)} 
            onSuccess={() => handleSelectJob(editingJob.id)} 
          />
        ) : null;
      case 'detail':
        return selectedJobId ? (
          <JobDetail 
            jobId={selectedJobId} 
            onBack={() => navigateTo('jobs')} 
            onEdit={handleEditJob}
            onDelete={() => navigateTo('jobs')}
          />
        ) : null;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={navigateTo}>
      {renderPage()}
    </Layout>
  );
}
