import { Router } from 'express';
import { referrals, findJob, newId, withJob, users, REFERRAL_STATUSES } from '../data.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { EMAIL_RE, LINKEDIN_RE, str, fieldError } from '../validate.js';

const router = Router();
router.use(requireAuth);

// The array is append-only, so reversing it gives newest first without ties on equal timestamps.
const newestFirst = (list) => [...list].reverse();

router.post('/', (req, res) => {
  const body = req.body ?? {};
  const input = {
    jobId: str(body.jobId),
    candidateName: str(body.candidateName),
    candidateEmail: str(body.candidateEmail).toLowerCase(),
    linkedinUrl: str(body.linkedinUrl),
    reason: str(body.reason),
  };

  const fields = {};
  if (!findJob(input.jobId)) fields.jobId = 'This job does not exist';
  if (input.candidateName.length < 2) fields.candidateName = 'Name must be at least 2 characters';
  if (!EMAIL_RE.test(input.candidateEmail)) fields.candidateEmail = 'Enter a valid email address';
  if (!LINKEDIN_RE.test(input.linkedinUrl)) {
    fields.linkedinUrl = 'Must be a LinkedIn URL like https://www.linkedin.com/in/name';
  }
  if (input.reason.length < 10 || input.reason.length > 500) {
    fields.reason = 'Reason must be between 10 and 500 characters';
  }
  if (Object.keys(fields).length) return fieldError(res, fields);

  // Build the record from validated fields only, so clients can't set status or referrerId.
  const referral = {
    id: newId(),
    ...input,
    referrerId: req.user.id,
    status: 'Submitted',
    createdAt: new Date().toISOString(),
  };
  referrals.push(referral);
  res.status(201).json({ referral: withJob(referral) });
});

// Registered before /:id routes so "mine" is never treated as an id.
router.get('/mine', (req, res) => {
  const mine = newestFirst(referrals.filter((r) => r.referrerId === req.user.id)).map(withJob);
  res.json({ referrals: mine });
});

router.get('/', requireAdmin, (req, res) => {
  const all = newestFirst(referrals).map((r) => ({
    ...withJob(r),
    referrerEmail: users.find((u) => u.id === r.referrerId)?.email ?? null,
  }));
  res.json({ referrals: all });
});

router.patch('/:id/status', requireAdmin, (req, res) => {
  const status = str(req.body?.status);
  if (!REFERRAL_STATUSES.includes(status)) {
    return fieldError(res, { status: `Status must be one of: ${REFERRAL_STATUSES.join(', ')}` });
  }

  const referral = referrals.find((r) => r.id === req.params.id);
  if (!referral) return res.status(404).json({ error: 'Referral not found' });

  referral.status = status;
  referral.updatedAt = new Date().toISOString();
  res.json({ referral: withJob(referral) });
});

export default router;
