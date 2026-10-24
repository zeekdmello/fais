import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SaveQueue } from '../src/hooks/saveQueue.js';
test('failed autosave retains edits and never claims Saved; retry confirms the server result', async () => {
  const states = [];
  let fail = true;
  const queue = new SaveQueue(
    { __v: 0 },
    async (patch) => {
      if (fail) throw new Error('Offline');
      return { ...patch, __v: 1 };
    },
    (state) => states.push(state),
  );
  queue.add({ title: 'Keep this text' });
  await queue.flush();
  assert.equal(queue.dirty, true);
  assert.equal(queue.pending.title, 'Keep this text');
  assert.equal(states.includes('Saved'), false);
  fail = false;
  await queue.flush();
  assert.equal(queue.dirty, false);
  assert.equal(states.at(-1), 'Saved');
});
test('edits are serialized and newer changes use confirmed versions', async () => {
  const calls = [];
  let release;
  const queue = new SaveQueue(
    { __v: 2 },
    async (patch) => {
      calls.push(patch);
      if (calls.length === 1) await new Promise((resolve) => (release = resolve));
      return { ...patch, __v: patch.__v + 1 };
    },
    () => {},
  );
  queue.add({ title: 'First' });
  const work = queue.flush();
  queue.add({ title: 'Latest' });
  await queue.flush();
  assert.equal(calls.length, 1);
  release();
  await work;
  assert.deepEqual(calls, [
    { title: 'First', __v: 2 },
    { title: 'Latest', __v: 3 },
  ]);
  assert.equal(queue.record.title, 'Latest');
  assert.equal(queue.dirty, false);
});
