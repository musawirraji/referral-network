'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { api } from '@/lib/api';

const POLL_MS = 5000;

const statusClass = (s) => `badge badge-${s.toLowerCase().replace(/\s+/g, '-')}`;
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
}

function Dashboard() {
  const [referrals, setReferrals] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    // Skip a tick if the previous request is still running, so slow responses can't stack up.
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const [mine, stats] = await Promise.all([api('/api/referrals/mine'), api('/api/analytics')]);
      setReferrals(mine.referrals);
      setAnalytics(stats);
      setError('');
    } catch (err) {
      // Keep the last good data on screen; a failed poll only shows a banner.
      setError(err.message);
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    load();
    // Polling keeps admin status changes visible without a refresh. Hidden tabs skip
    // ticks to save requests; the interval is cleared on unmount.
    const id = setInterval(() => {
      if (!document.hidden) load();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  const firstLoad = referrals === null && !error;

  return (
    <>
      <div className="page-head">
        <h1>Dashboard</h1>
        <p className="muted">Updates every 5 seconds.</p>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}
      {firstLoad && <p className="status" role="status">Loading your dashboard…</p>}

      {analytics && (
        <section aria-labelledby="stats-heading" className="stats">
          <h2 id="stats-heading" className="sr-only">Referral analytics</h2>
          <div className="card stat">
            <p className="stat-label">My referrals</p>
            <p className="stat-value">{analytics.myTotal}</p>
          </div>
          <div className="card stat">
            <p className="stat-label">All referrals</p>
            <p className="stat-value">{analytics.totalAllUsers}</p>
          </div>
          <div className="card stat top-jobs">
            <p className="stat-label">Top jobs</p>
            {analytics.topJobs.length === 0 ? (
              <p className="muted">No referrals yet.</p>
            ) : (
              <ol>
                {analytics.topJobs.map((j) => (
                  <li key={j.jobId}>
                    <span>{j.title} <span className="muted">· {j.company}</span></span>
                    <strong>{j.count}</strong>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      )}

      {referrals && (
        <section aria-labelledby="mine-heading">
          <h2 id="mine-heading">My referrals</h2>
          {referrals.length === 0 ? (
            <div className="card">
              <p>You haven&apos;t referred anyone yet. <Link href="/">Browse open roles</Link></p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Job</th>
                  <th scope="col">Candidate</th>
                  <th scope="col">Referred</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((r) => (
                  <tr key={r.id}>
                    {/* data-label drives the stacked card layout on narrow screens. */}
                    <td data-label="Job">{r.jobTitle}<br /><span className="muted">{r.company}</span></td>
                    <td data-label="Candidate">{r.candidateName}<br /><span className="muted">{r.candidateEmail}</span></td>
                    <td data-label="Referred"><time dateTime={r.createdAt}>{formatDate(r.createdAt)}</time></td>
                    <td data-label="Status"><span className={statusClass(r.status)}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </>
  );
}
