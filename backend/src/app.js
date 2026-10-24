import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import helmet from 'helmet';
import cors from 'cors';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { csrf } from './middleware/security.js';
import { router } from './routes/index.js';
export function createApp({
  mongoUrl = process.env.MONGODB_URI,
  secret = process.env.SESSION_SECRET,
  origins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173').split(
    ',',
  ),
} = {}) {
  if (!secret || secret.length < 32)
    throw new Error('Set SESSION_SECRET to at least 32 random characters.');
  const app = express();
  const production = process.env.NODE_ENV === 'production';
  if (production) app.set('trust proxy', 1);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'img-src': ["'self'", 'data:'],
          'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          'font-src': ["'self'", 'https://fonts.gstatic.com'],
        },
      },
    }),
  );
  app.use(cors({ origin: origins, credentials: true }));
  app.use(express.json({ limit: '24kb' }));
  app.use((req, res, next) => {
    req.requestId = crypto.randomUUID();
    res.set('X-Request-ID', req.requestId);
    res.on('finish', () => {
      if (process.env.NODE_ENV !== 'test')
        console.log(
          JSON.stringify({
            timestamp: new Date().toISOString(),
            method: req.method,
            route: req.path,
            status: res.statusCode,
            requestId: req.requestId,
          }),
        );
    });
    next();
  });
  const store = MongoStore.create({ mongoUrl, collectionName: 'sessions' });
  app.locals.sessionStore = store;
  app.use(
    session({
      name: 'fais.sid',
      secret,
      resave: false,
      saveUninitialized: false,
      store,
      cookie: {
        httpOnly: true,
        secure: production,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    }),
  );
  app.get('/api/v1/health', (req, res) =>
    res
      .status(mongoose.connection.readyState === 1 ? 200 : 503)
      .json({ ok: mongoose.connection.readyState === 1, app: 'Fais' }),
  );
  app.use('/api/v1', csrf(origins), router);
  app.use('/api', (req, res) => res.status(404).json({ error: 'Endpoint not found.' }));
  const dist = fileURLToPath(new URL('../../frontend/dist', import.meta.url));
  app.use(express.static(dist));
  app.get('/{*path}', (req, res, next) =>
    res.sendFile(path.join(dist, 'index.html'), (error) => error && next(error)),
  );
  app.use((error, req, res, next) => {
    const status =
      error.status ||
      (error.name === 'VersionError' || error.code === 11000
        ? 409
        : error.name === 'ValidationError'
          ? 400
          : 500);
    const message =
      error.type === 'entity.parse.failed'
        ? 'Invalid JSON request.'
        : status === 500
          ? 'Something went wrong. Please try again.'
          : error.code === 11000
            ? 'This record already exists. Refresh and try again.'
            : error.name === 'VersionError'
              ? 'Record changed elsewhere. Refresh and retry.'
              : error.message;
    if (status === 500)
      console.error(JSON.stringify({ requestId: req.requestId, errorType: error.name }));
    res.status(status).json({ error: message, requestId: req.requestId });
  });
  return app;
}
