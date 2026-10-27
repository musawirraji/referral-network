import jwt from 'jsonwebtoken';
import { users } from './data.js';

// Dev fallback keeps `npm run dev` zero-config; set JWT_SECRET for anything real.
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-me';
if (!process.env.JWT_SECRET) console.warn('[auth] JWT_SECRET not set, using dev fallback secret');

export const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '2h' });

export function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Your session expired. Please sign in again.' });
    }
    return res.status(401).json({ error: 'Invalid token. Please sign in again.' });
  }

  // Look the user up instead of trusting the token's role claim, so role changes
  // (or a wiped in-memory store) take effect immediately.
  const user = users.find((u) => u.id === payload.sub);
  if (!user) return res.status(401).json({ error: 'Account not found. Please sign in again.' });

  req.user = user;
  next();
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
}
