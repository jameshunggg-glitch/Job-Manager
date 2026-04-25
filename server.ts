import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import db from './server/db.ts';

const app = express();
const PORT = 3000;

app.use(express.json());

// API Routes
app.get('/api/jobs', (req, res) => {
  try {
    const jobs = db.prepare('SELECT * FROM job_postings ORDER BY created_at DESC').all();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.get('/api/jobs/:id', (req, res) => {
  try {
    const job = db.prepare('SELECT * FROM job_postings WHERE id = ?').get(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

app.post('/api/jobs', (req, res) => {
  const { 
    title, company, location, work_mode, source, source_url, 
    job_description, requirements, nice_to_have, salary, 
    status, notes, follow_up_date 
  } = req.body;

  if (!title || !company) {
    return res.status(400).json({ error: 'Title and Company are required' });
  }

  try {
    const info = db.prepare(`
      INSERT INTO job_postings (
        title, company, location, work_mode, source, source_url,
        job_description, requirements, nice_to_have, salary,
        status, notes, follow_up_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title, company, location, work_mode, source, source_url,
      job_description, requirements, nice_to_have, salary,
      status || 'saved', notes, follow_up_date
    );
    res.json({ id: info.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create job' });
  }
});

app.put('/api/jobs/:id', (req, res) => {
  const { 
    title, company, location, work_mode, source, source_url, 
    job_description, requirements, nice_to_have, salary, 
    status, notes, follow_up_date 
  } = req.body;

  try {
    const result = db.prepare(`
      UPDATE job_postings SET
        title = ?, company = ?, location = ?, work_mode = ?, 
        source = ?, source_url = ?, job_description = ?, 
        requirements = ?, nice_to_have = ?, salary = ?, 
        status = ?, notes = ?, follow_up_date = ?, 
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title, company, location, work_mode, source, source_url,
      job_description, requirements, nice_to_have, salary,
      status, notes, follow_up_date, req.params.id
    );
    
    if (result.changes === 0) return res.status(404).json({ error: 'Job not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update job' });
  }
});

app.delete('/api/jobs/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM job_postings WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Job not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

app.get('/api/stats', (req, res) => {
  try {
    const jobs = db.prepare('SELECT job_description, requirements, nice_to_have, status FROM job_postings').all() as any[];
    
    const keywords = [
      'Python', 'SQL', 'Excel', 'Tableau', 'Power BI', 'Machine Learning', 
      'Statistics', 'Data Visualization', 'ETL', 'API', 'Git', 'Docker',
      'AWS', 'GCP', 'Azure', 'BigQuery', 'Snowflake', 'PostgreSQL', 'MySQL',
      'Communication', 'Stakeholder', 'Business Analysis', 'Problem Solving', 
      'Presentation', 'Reporting'
    ];

    const keywordStats = keywords.map(kw => {
      const count = jobs.filter(job => {
        const text = `${job.job_description} ${job.requirements} ${job.nice_to_have}`.toLowerCase();
        return text.includes(kw.toLowerCase());
      }).length;
      return { keyword: kw, count };
    }).sort((a, b) => b.count - a.count);

    const statusStats = jobs.reduce((acc: any, job: any) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalJobs: jobs.length,
      keywordStats,
      statusStats
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Production and Development setups
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
