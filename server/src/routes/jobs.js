import { Router } from 'express';
import { jobs, findJob } from '../data.js';

const router = Router();

// Jobs are public so visitors can browse before signing up.
router.get('/', (req, res) => res.json({ jobs }));

router.get('/:id', (req, res) => {
  const job = findJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json({ job });
});

export default router;
