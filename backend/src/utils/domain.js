import { DateTime } from 'luxon';
export const today = (zone = 'Asia/Kolkata', now) =>
  (now ? DateTime.fromISO(now) : DateTime.now()).setZone(zone).toISODate();
export const validDate = (value) =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && DateTime.fromISO(value).isValid;
export const addDays = (date, amount) => DateTime.fromISO(date).plus({ days: amount }).toISODate();
export function datesBetween(from, to) {
  const result = [];
  for (let d = from; d <= to; d = addDays(d, 1)) result.push(d);
  return result;
}
export function scheduleAt(routine, date) {
  return [...routine.schedules]
    .filter((s) => s.effectiveDate <= date)
    .sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate))[0];
}
export function scheduled(routine, date) {
  const s = scheduleAt(routine, date);
  return (
    date >= routine.startDate &&
    s &&
    !s.archived &&
    s.weekdays.includes(DateTime.fromISO(date).weekday % 7)
  );
}
export const priorityRank = { High: 0, Medium: 1, Low: 2 };
export function sortTasks(tasks, sort = 'priority') {
  return [...tasks].sort((a, b) => {
    if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    const due = (a.dueDate || '9999') + (a.dueTime || '23:59');
    const other = (b.dueDate || '9999') + (b.dueTime || '23:59');
    return (
      (sort === 'priority' ? priorityRank[a.priority] - priorityRank[b.priority] : 0) ||
      due.localeCompare(other) ||
      new Date(a.createdAt) - new Date(b.createdAt) ||
      String(a._id).localeCompare(String(b._id))
    );
  });
}
export function overdue(task, zone, now = DateTime.now()) {
  if (!task.dueDate || task.status === 'Completed') return false;
  const deadline = task.dueTime
    ? DateTime.fromISO(`${task.dueDate}T${task.dueTime}`, { zone })
    : DateTime.fromISO(task.dueDate, { zone }).endOf('day');
  return now.toMillis() > deadline.toMillis();
}
export function routineSummary(routines, completions, from, to, localToday) {
  const keys = new Set(completions.filter((c) => c.active).map((c) => `${c.routine}:${c.date}`));
  const days = datesBetween(from, to).map((date) => {
    const list = routines.filter((r) => scheduled(r, date));
    return {
      date,
      total: list.length,
      completed: list.filter((r) => keys.has(`${r._id}:${date}`)).length,
      future: date > localToday,
    };
  });
  const elapsed = days.filter((d) => !d.future);
  const total = elapsed.reduce((sum, d) => sum + d.total, 0);
  const completed = elapsed.reduce((sum, d) => sum + d.completed, 0);
  const counts = routines.map((r) => ({
    title: r.title,
    count: elapsed.filter((d) => scheduled(r, d.date) && keys.has(`${r._id}:${d.date}`)).length,
  }));
  const most = counts.sort((a, b) => b.count - a.count)[0];
  return {
    days,
    total,
    completed,
    percentage: total ? Math.round((completed / total) * 100) : null,
    most: most?.count ? most : null,
  };
}
export function routineStreak(routine, completions, localToday) {
  const keys = new Set(
    completions
      .filter((c) => c.active && String(c.routine) === String(routine._id))
      .map((c) => c.date),
  );
  let streak = 0;
  for (let d = localToday; d >= routine.startDate; d = addDays(d, -1)) {
    if (!scheduled(routine, d)) continue;
    if (!keys.has(d)) {
      if (d === localToday) continue;
      break;
    }
    streak++;
  }
  return streak;
}
