import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { createApp } from '../src/app.js';
import { connectDatabase } from '../src/config/database.js';
import { Task, Routine, RoutineCompletion, ActivityLog } from '../src/models/index.js';
import { today, addDays } from '../src/utils/domain.js';
let app, server, base;
const origin = 'http://localhost:5173';
const dbName = 'fais_test_' + crypto.randomBytes(6).toString('hex');
before(async () => {
  process.env.NODE_ENV = 'test';
  await connectDatabase('mongodb://127.0.0.1:27017/' + dbName);
  await Promise.all([Task.init(), Routine.init(), RoutineCompletion.init(), ActivityLog.init()]);
  app = createApp({
    mongoUrl: 'mongodb://127.0.0.1:27017/' + dbName,
    secret: 'test-only-secret-32-characters-long',
    origins: [origin],
  });
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
});
after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  if (app) await app.locals.sessionStore.close();
  if (mongoose.connection.name === dbName) await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
function client() {
  let cookie = '',
    csrf = '';
  return async (path, method = 'GET', body) => {
    const response = await fetch(base + '/api/v1' + path, {
      method,
      headers: { origin, cookie, 'content-type': 'application/json', 'x-csrf-token': csrf },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (response.headers.get('set-cookie'))
      cookie = response.headers.get('set-cookie').split(';')[0];
    const data = await response.json();
    if (data.csrfToken) csrf = data.csrfToken;
    return { status: response.status, ...data };
  };
}
async function account(name) {
  const c = client();
  await c('/auth/csrf');
  assert.equal(
    (
      await c('/auth/register', 'POST', {
        name,
        email: name + '@test.local',
        password: 'StrongPass123!',
      })
    ).status,
    201,
  );
  return c;
}
test('auth, CSRF, ownership, CRUD, optimistic versions and scoped reports', async () => {
  const a = await account('Alice'),
    b = await account('Bob');
  const key = crypto.randomUUID();
  const created = await a('/tasks', 'POST', {
    title: 'Private task',
    priority: 'High',
    clientKey: key,
  });
  assert.equal(created.status, 201);
  const task = created.task;
  assert.equal(
    (await a('/tasks', 'POST', { title: 'Private task', clientKey: key })).task._id,
    task._id,
  );
  assert.equal((await b('/tasks')).tasks.length, 0);
  assert.equal((await b(`/tasks/${task._id}`, 'PATCH', { title: 'Stolen', __v: 0 })).status, 404);
  assert.equal((await b(`/tasks/${task._id}`, 'DELETE', { __v: 0 })).status, 409);
  const saved = await a(`/tasks/${task._id}`, 'PATCH', { status: 'Completed', __v: 0 });
  assert.equal(saved.task.status, 'Completed');
  assert.equal(
    (await a(`/tasks/${task._id}`, 'PATCH', { title: 'Old update', __v: 0 })).status,
    409,
  );
  assert.equal((await a('/statistics')).tasks.completedInPeriod, 1);
  assert.equal((await b('/statistics')).tasks.total, 0);
  assert.equal((await b('/activity')).items.length, 0);
  assert.equal(
    (await a('/tasks', 'POST', { title: 'X', owner: 'x', clientKey: crypto.randomUUID() })).status,
    400,
  );
  assert.equal(
    (
      await a('/tasks', 'POST', {
        title: 'X',
        dueDate: '2026-02-30',
        clientKey: crypto.randomUUID(),
      })
    ).status,
    400,
  );
  const noCsrf = await fetch(base + '/api/v1/tasks', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body: '{}',
  });
  assert.equal(noCsrf.status, 403);
  assert.equal((await a(`/tasks/${task._id}`, 'DELETE', { __v: saved.task.__v })).status, 200);
  const history = (await a('/activity')).items;
  assert.ok(history.some((e) => e.action === 'task.deleted' && e.label === 'Private task'));
  assert.equal((await a('/auth/logout', 'POST', {})).status, 200);
  assert.equal((await a('/auth/me')).status, 401);
  assert.equal((await a('/auth/csrf')).status, 200);
  assert.equal(
    (await a('/auth/login', 'POST', { email: 'alice@test.local', password: 'StrongPass123!' }))
      .status,
    200,
  );
});
test('routine completion is unique, idempotent, date-specific, undoable and owner-restricted', async () => {
  const a = await account('Carol'),
    b = await account('Dave'),
    date = today();
  const { routine } = await a('/routines', 'POST', {
    title: 'Read',
    startDate: date,
    weekdays: [0, 1, 2, 3, 4, 5, 6],
    clientKey: crypto.randomUUID(),
  });
  const path = `/routines/${routine._id}/completions/${date}`;
  const results = await Promise.all([
    a(path, 'PUT', { completed: true }),
    a(path, 'PUT', { completed: true }),
  ]);
  assert.ok(results.every((r) => r.status === 200));
  assert.equal(await RoutineCompletion.countDocuments({ routine: routine._id, date }), 1);
  assert.equal((await a('/routines?date=' + date)).routines[0].completed, true);
  assert.equal((await a('/routines?date=' + addDays(date, 1))).routines[0].completed, false);
  assert.equal((await b(path, 'PUT', { completed: false })).status, 404);
  assert.equal(
    (
      await a(`/routines/${routine._id}/completions/${addDays(date, 1)}`, 'PUT', {
        completed: true,
      })
    ).status,
    400,
  );
  await a(path, 'PUT', { completed: false });
  assert.equal((await a('/routines?date=' + date)).routines[0].completed, false);
  assert.equal(
    (await a('/activity')).items.filter((e) => e.action === 'routine.completed').length,
    1,
  );
  const edited = await a('/routines/' + routine._id, 'PATCH', { __v: 0, archived: true });
  assert.equal(edited.status, 200);
  assert.equal((await a('/routines?date=' + date)).routines[0].scheduled, true);
  assert.equal((await a('/routines?date=' + addDays(date, 1))).routines[0].scheduled, false);
});
