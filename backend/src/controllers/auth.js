import bcrypt from 'bcrypt';
import { User } from '../models/index.js';
import { fields, text, fail, timezone } from '../utils/validation.js';
import { token, publicUser } from '../middleware/security.js';
const regenerate = (req) =>
  new Promise((resolve, reject) => req.session.regenerate((e) => (e ? reject(e) : resolve())));
export async function register(req, res) {
  fields(req.body, ['name', 'email', 'password', 'timezone']);
  const name = text(req.body.name, 'Name', 80, true);
  const email = text(req.body.email, 'Email', 254, true).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('Enter a valid email address.');
  const password = req.body.password;
  if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password) > 72)
    fail('Use a password of at least 8 characters and at most 72 bytes.');
  if (await User.exists({ email })) fail('An account with this email already exists.', 409);
  const user = await User.create({
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    timezone: timezone(req.body.timezone || 'Asia/Kolkata'),
  });
  await regenerate(req);
  req.session.userId = user.id;
  res.status(201).json({ user: publicUser(user), csrfToken: token(req) });
}
export async function login(req, res) {
  fields(req.body, ['email', 'password']);
  const email = text(req.body.email, 'Email', 254, true).toLowerCase();
  if (typeof req.body.password !== 'string' || Buffer.byteLength(req.body.password) > 72)
    fail('Invalid email or password.', 401);
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash)))
    fail('Invalid email or password.', 401);
  await regenerate(req);
  req.session.userId = user.id;
  res.json({ user: publicUser(user), csrfToken: token(req) });
}
export async function settings(req, res) {
  fields(req.body, ['name', 'timezone']);
  if ('name' in req.body) req.user.name = text(req.body.name, 'Name', 80, true);
  if ('timezone' in req.body) req.user.timezone = timezone(req.body.timezone);
  await req.user.save();
  res.json({ user: publicUser(req.user) });
}
