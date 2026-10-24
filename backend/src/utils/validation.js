import { DateTime } from 'luxon';
import { validDate } from './domain.js';
export function fail(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  throw error;
}
export function text(value, name, max, required = false) {
  if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim()))
    fail(`${name} must be ${required ? 'nonempty and ' : ''}at most ${max} characters.`);
  return value.trim();
}
export function fields(body, allowed) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) fail('Invalid request body.');
  for (const key of Object.keys(body)) if (!allowed.includes(key)) fail(`Unexpected field: ${key}`);
}
export function choice(value, values, name) {
  if (!values.includes(value)) fail(`Invalid ${name}.`);
  return value;
}
export function date(value, name, optional = true) {
  if (optional && value === '') return '';
  if (!validDate(value)) fail(`Invalid ${name}.`);
  return value;
}
export function time(value) {
  if (value !== '' && (typeof value !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)))
    fail('Invalid time.');
  return value;
}
export function timezone(value) {
  if (typeof value !== 'string' || value.length > 80 || !DateTime.now().setZone(value).isValid)
    fail('Invalid timezone.');
  return value;
}
export function version(value) {
  if (!Number.isInteger(value) || value < 0) fail('A record version is required.');
  return value;
}
export function clientKey(value) {
  if (typeof value !== 'string' || !/^[\w-]{8,80}$/.test(value))
    fail('A valid request key is required.');
  return value;
}
export function taskInput(body, create = false) {
  fields(body, [
    'title',
    'description',
    'category',
    'priority',
    'status',
    'scheduledDate',
    'dueDate',
    'dueTime',
    create ? 'clientKey' : '__v',
  ]);
  const out = {};
  if (create || 'title' in body) out.title = text(body.title, 'Title', 140, true);
  if ('description' in body) out.description = text(body.description, 'Description', 4000);
  for (const [key, values] of Object.entries({
    category: ['Study', 'Personal', 'Work', 'Health', 'Other'],
    priority: ['High', 'Medium', 'Low'],
    status: ['Pending', 'In Progress', 'Completed'],
  }))
    if (key in body) out[key] = choice(body[key], values, key);
  for (const key of ['scheduledDate', 'dueDate']) if (key in body) out[key] = date(body[key], key);
  if ('dueTime' in body) out.dueTime = time(body.dueTime);
  if (create) out.clientKey = clientKey(body.clientKey);
  else version(body.__v);
  return out;
}
export function routineInput(body, create = false) {
  fields(body, [
    'title',
    'icon',
    'color',
    'time',
    'weekdays',
    'archived',
    ...(create ? ['clientKey', 'startDate'] : ['__v']),
  ]);
  const out = {};
  if (create || 'title' in body) out.title = text(body.title, 'Title', 100, true);
  if ('icon' in body)
    out.icon = choice(
      body.icon,
      ['sun', 'book', 'leaf', 'cup', 'moon', 'heart', 'shoe', 'water'],
      'icon',
    );
  if ('color' in body)
    out.color = choice(body.color, ['cream', 'pink', 'blue', 'green', 'lavender'], 'color');
  if ('time' in body) out.time = time(body.time);
  if (create) {
    out.clientKey = clientKey(body.clientKey);
    out.startDate = date(body.startDate, 'start date', false);
  } else version(body.__v);
  if ('weekdays' in body || create) {
    if (
      !Array.isArray(body.weekdays) ||
      !body.weekdays.length ||
      body.weekdays.length > 7 ||
      body.weekdays.some((d) => !Number.isInteger(d) || d < 0 || d > 6)
    )
      fail('Select at least one weekday.');
    out.weekdays = [...new Set(body.weekdays)];
  }
  if ('archived' in body) {
    if (typeof body.archived !== 'boolean') fail('Invalid archive state.');
    out.archived = body.archived;
  }
  return out;
}
