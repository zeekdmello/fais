import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as auth from '../controllers/auth.js';
import * as tasks from '../controllers/tasks.js';
import * as routines from '../controllers/routines.js';
import * as reports from '../controllers/reports.js';
import { authenticated, validId, token, publicUser } from '../middleware/security.js';
export const router = Router();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again in 15 minutes.' },
});
router.get('/auth/csrf', (req, res) => res.json({ csrfToken: token(req) }));
router.post('/auth/register', limiter, auth.register);
router.post('/auth/login', limiter, auth.login);
router.get('/auth/me', authenticated, (req, res) =>
  res.json({ user: publicUser(req.user), csrfToken: token(req) }),
);
router.post('/auth/logout', (req, res, next) =>
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie('fais.sid', { path: '/' });
    res.json({ ok: true });
  }),
);
router.use(authenticated);
router.patch('/settings', auth.settings);
router.get('/tasks', tasks.list);
router.post('/tasks', tasks.create);
router.patch('/tasks/:id', validId, tasks.update);
router.delete('/tasks/:id', validId, tasks.remove);
router.get('/routines', routines.list);
router.post('/routines', routines.create);
router.patch('/routines/:id', validId, routines.update);
router.post('/routines/:id/order', validId, routines.reorder);
router.put('/routines/:id/completions/:date', validId, routines.complete);
router.get('/calendar', reports.report);
router.get('/statistics', reports.report);
router.get('/activity', reports.activity);
