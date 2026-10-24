import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DateTime } from 'luxon';
import {
  today,
  sortTasks,
  overdue,
  scheduled,
  routineSummary,
  routineStreak,
  datesBetween,
} from '../src/utils/domain.js';
test('priority is explicit; undated follow dated within priority and ties remain stable', () => {
  const tasks = [
    { _id: 'a', priority: 'Low', dueDate: '2026-01-01', createdAt: new Date(1) },
    { _id: 'b', priority: 'High', createdAt: new Date(1) },
    { _id: 'c', priority: 'Medium', dueDate: '2026-01-01', createdAt: new Date(1) },
    { _id: 'd', priority: 'High', dueDate: '2026-02-01', createdAt: new Date(1) },
  ];
  assert.deepEqual(
    sortTasks(tasks).map((t) => t._id),
    ['d', 'b', 'c', 'a'],
  );
});
test('local midnight and date-only overdue respect timezone', () => {
  assert.equal(today('Asia/Kolkata', '2026-10-12T19:00:00Z'), '2026-10-13');
  const task = { dueDate: '2026-10-13', status: 'Pending' };
  assert.equal(overdue(task, 'Asia/Kolkata', DateTime.fromISO('2026-10-13T18:29:59Z')), false);
  assert.equal(overdue(task, 'Asia/Kolkata', DateTime.fromISO('2026-10-13T18:30:00Z')), true);
});
test('effective schedules preserve past weekdays and future archive; rates exclude future days', () => {
  const r = {
    _id: 'r',
    title: 'Read',
    startDate: '2026-10-12',
    schedules: [
      { effectiveDate: '2026-10-12', weekdays: [1, 2, 3, 4, 5], archived: false },
      { effectiveDate: '2026-10-15', weekdays: [1, 2, 3, 4, 5], archived: true },
    ],
  };
  assert.equal(scheduled(r, '2026-10-14'), true);
  assert.equal(scheduled(r, '2026-10-15'), false);
  const summary = routineSummary(
    [r],
    [{ routine: 'r', date: '2026-10-12', active: true }],
    '2026-10-12',
    '2026-10-18',
    '2026-10-13',
  );
  assert.equal(summary.total, 2);
  assert.equal(summary.completed, 1);
  assert.equal(summary.percentage, 50);
});
test('leap months and scheduled-day streaks', () => {
  assert.equal(datesBetween('2024-02-01', '2024-02-29').length, 29);
  const r = {
    _id: 'r',
    startDate: '2026-10-09',
    schedules: [{ effectiveDate: '2026-10-09', weekdays: [1, 2, 3, 4, 5], archived: false }],
  };
  assert.equal(
    routineStreak(
      r,
      [
        { routine: 'r', date: '2026-10-09', active: true },
        { routine: 'r', date: '2026-10-12', active: true },
      ],
      '2026-10-13',
    ),
    2,
  );
});
