import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import referralRoutes from './routes/referrals.js';
import analyticsRoutes from './routes/analytics.js';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Auth uses Bearer tokens, not cookies, so allowing any origin by default carries no
// CSRF risk. Set CLIENT_ORIGIN to lock it to the deployed frontend.
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request body too large' });
  // Log the full error server-side, but only ever send a generic message to the client.
  console.error(err);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
