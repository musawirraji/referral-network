'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api('/api/jobs');
      setJobs(data.jobs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <div className="page-head">
        <h1>Open roles</h1>
        <p className="muted">Know someone great? Refer them and track their progress from your dashboard.</p>
      </div>

      {loading && <p className="status" role="status">Loading jobs…</p>}
      {error && (
        <div className="form-error" role="alert">
          {error} <button type="button" className="btn btn-ghost btn-small" onClick={load}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <ul className="job-grid">
          {jobs.map((job) => (
            <li key={job.id} className="card job-card">
              <p className="company">{job.company}</p>
              <h2>{job.title}</h2>
              <p className="location">{job.location}</p>
              <p>{job.description}</p>
              <Link href={`/refer/${job.id}`} className="btn" aria-label={`Refer someone for ${job.title} at ${job.company}`}>
                Refer someone
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
