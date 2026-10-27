import { Router } from 'express';
import { referrals, jobs } from '../data.js';
import { requireAuth } from '../auth.js';

const router = Router();

// Computed on every request: with in-memory arrays this is cheap and always consistent,
// so there's no cached counter to drift out of sync.
router.get('/', requireAuth, (req, res) => {
  const counts = new Map();
  for (const r of referrals) counts.set(r.jobId, (counts.get(r.jobId) ?? 0) + 1);

  const topJobs = jobs
    .filter((j) => counts.has(j.id))
    .map((j) => ({ jobId: j.id, title: j.title, company: j.company, count: counts.get(j.id) }))
    // Tie-break by title so equal counts don't reorder between polls.
    .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title))
    .slice(0, 3);

  res.json({
    myTotal: referrals.filter((r) => r.referrerId === req.user.id).length,
    totalAllUsers: referrals.length,
    topJobs,
  });
});

export default router;
