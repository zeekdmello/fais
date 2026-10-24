import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { User } from '../models/index.js';
import { fail } from '../utils/validation.js';
export function token(req) {
  return (req.session.csrf ||= crypto.randomBytes(32).toString('hex'));
}
export function csrf(origins) {
  return (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    if (!origins.includes(req.get('origin')))
      return next(Object.assign(new Error('Untrusted request origin.'), { status: 403 }));
    if (!req.session.csrf || req.get('x-csrf-token') !== req.session.csrf)
      return next(
        Object.assign(new Error('Session expired. Refresh and try again.'), { status: 403 }),
      );
    next();
  };
}
export async function authenticated(req, res, next) {
  req.user = req.session.userId && (await User.findById(req.session.userId));
  if (!req.user) fail('Please sign in.', 401);
  next();
}
export function validId(req, res, next) {
  if (req.params.id && !mongoose.isObjectIdOrHexString(req.params.id)) fail('Invalid record ID.');
  next();
}
export function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, timezone: user.timezone };
}
