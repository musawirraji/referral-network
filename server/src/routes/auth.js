import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { users, newId, publicUser } from '../data.js';
import { signToken, requireAuth } from '../auth.js';
import { EMAIL_RE, str, fieldError } from '../validate.js';

const router = Router();

// Compared against when the email is unknown, so both failure paths cost one bcrypt
// check and response timing doesn't reveal which emails are registered.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

// Express 4 doesn't catch rejected promises; forward them to the error handler.
const asyncRoute = (fn) => (req, res, next) => fn(req, res, next).catch(next);

const authResponse = (user) => ({ token: signToken(user), user: publicUser(user) });

router.post('/signup', asyncRoute(async (req, res) => {
  const email = str(req.body?.email).toLowerCase();
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  const fields = {};
  if (!EMAIL_RE.test(email)) fields.email = 'Enter a valid email address';
  if (password.length < 8) fields.password = 'Password must be at least 8 characters';
  if (Object.keys(fields).length) return fieldError(res, fields);

  if (users.some((u) => u.email === email)) {
    return res.status(409).json({
      error: 'An account with this email already exists',
      fields: { email: 'An account with this email already exists' },
    });
  }

  const user = {
    id: newId(),
    email,
    passwordHash: await bcrypt.hash(password, 10),
    role: 'user',
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  res.status(201).json(authResponse(user));
}));

router.post('/signin', asyncRoute(async (req, res) => {
  const email = str(req.body?.email).toLowerCase();
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  const user = users.find((u) => u.email === email);
  const ok = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
  if (!user || !ok) return res.status(401).json({ error: 'Invalid email or password' });

  res.json(authResponse(user));
}));

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;
