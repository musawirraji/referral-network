import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';

// In-memory store: everything resets when the process restarts. That also invalidates
// tokens for users who signed up, which requireAuth handles by checking the user still exists.

export const users = [
  {
    // Fixed id so the seeded admin's tokens survive a server restart during local testing.
    id: 'admin-1',
    email: 'admin@example.com',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
];

export const jobs = [
  {
    id: 'job-1',
    company: 'Paystack',
    title: 'Senior Backend Engineer',
    description: 'Design and scale payment APIs used by thousands of merchants. Node.js, Postgres, queues.',
    location: 'Lagos, Nigeria (Hybrid)',
  },
  {
    id: 'job-2',
    company: 'Shopify',
    title: 'Frontend Developer',
    description: 'Build merchant-facing admin features in React with a strong focus on accessibility.',
    location: 'Remote (EMEA)',
  },
  {
    id: 'job-3',
    company: 'Stripe',
    title: 'Machine Learning Engineer',
    description: 'Improve fraud detection models and the pipelines that train and serve them.',
    location: 'Dublin, Ireland',
  },
  {
    id: 'job-4',
    company: 'Flutterwave',
    title: 'Product Designer',
    description: 'Own end-to-end design for cross-border payouts, from research to shipped UI.',
    location: 'Remote (Africa)',
  },
  {
    id: 'job-5',
    company: 'Andela',
    title: 'DevOps Engineer',
    description: 'Run CI/CD, Kubernetes clusters and observability for a global engineering platform.',
    location: 'Nairobi, Kenya',
  },
];

export const referrals = [];

export const REFERRAL_STATUSES = ['Submitted', 'In Review', 'Interviewing', 'Hired', 'Rejected'];

export const newId = () => randomUUID();

// The only shape a user ever leaves the server in, so passwordHash can't leak by accident.
export const publicUser = (u) => ({ id: u.id, email: u.email, role: u.role });

export const findJob = (id) => jobs.find((j) => j.id === id);

export const withJob = (r) => {
  const job = findJob(r.jobId);
  return { ...r, jobTitle: job?.title ?? 'Unknown job', company: job?.company ?? 'Unknown company' };
};
