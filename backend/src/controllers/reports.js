import { DateTime } from 'luxon';
import { Task, Routine, RoutineCompletion, ActivityLog } from '../models/index.js';
import { today, routineSummary, routineStreak } from '../utils/domain.js';
import { date, fail } from '../utils/validation.js';
export async function report(req, res) {
  const localToday = today(req.user.timezone);
  const from = date(req.query.from || localToday.slice(0, 7) + '-01', 'from', false);
  const to = date(req.query.to || DateTime.fromISO(from).endOf('month').toISODate(), 'to', false);
  if (from > to || DateTime.fromISO(to).diff(DateTime.fromISO(from), 'days').days > 366)
    fail('Choose a date range of up to one year.');
  const owner = req.user._id;
  const [tasks, routines, completions] = await Promise.all([
    Task.find({ owner }).lean(),
    Routine.find({ owner }).lean(),
    RoutineCompletion.find({ owner, active: true }).lean(),
  ]);
  const summary = routineSummary(routines, completions, from, to, localToday);
  const completedTasks = tasks.filter(
    (t) =>
      t.completedAt &&
      DateTime.fromJSDate(t.completedAt).setZone(req.user.timezone).toISODate() >= from &&
      DateTime.fromJSDate(t.completedAt).setZone(req.user.timezone).toISODate() <= to,
  );
  res.json({
    from,
    to,
    today: localToday,
    routine: summary,
    streaks: routines.map((r) => ({
      title: r.title,
      streak: routineStreak(r, completions, localToday),
    })),
    tasks: {
      total: tasks.length,
      byStatus: Object.fromEntries(
        ['Pending', 'In Progress', 'Completed'].map((s) => [
          s,
          tasks.filter((t) => t.status === s).length,
        ]),
      ),
      byPriority: Object.fromEntries(
        ['High', 'Medium', 'Low'].map((p) => [p, tasks.filter((t) => t.priority === p).length]),
      ),
      completedInPeriod: completedTasks.length,
    },
    daily: summary.days.map((d) => {
      const dayTasks = tasks.filter(
        (t) =>
          t.scheduledDate === d.date ||
          t.dueDate === d.date ||
          (t.completedAt &&
            DateTime.fromJSDate(t.completedAt).setZone(req.user.timezone).toISODate() === d.date),
      );
      return {
        ...d,
        tasks: completedTasks.filter(
          (t) =>
            DateTime.fromJSDate(t.completedAt).setZone(req.user.timezone).toISODate() === d.date,
        ).length,
        taskTotal: dayTasks.length,
        taskCompleted: dayTasks.filter((t) => t.status === 'Completed').length,
      };
    }),
  });
}
export async function activity(req, res) {
  const page = Number(req.query.page || 1);
  if (!Number.isInteger(page) || page < 1 || page > 100000) fail('Invalid page.');
  const query = { owner: req.user._id };
  if (req.query.action) query.action = String(req.query.action).slice(0, 50);
  if (req.query.date) {
    const d = date(req.query.date, 'date', false);
    const start = DateTime.fromISO(d, { zone: req.user.timezone });
    query.createdAt = { $gte: start.toJSDate(), $lt: start.plus({ days: 1 }).toJSDate() };
  }
  const [items, total] = await Promise.all([
    ActivityLog.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * 20)
      .limit(20)
      .lean(),
    ActivityLog.countDocuments(query),
  ]);
  res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / 20)) });
}
