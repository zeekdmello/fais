import { Routine, RoutineCompletion } from '../models/index.js';
import { routineInput, fail, date, fields, version, choice } from '../utils/validation.js';
import { today, addDays, scheduleAt, scheduled } from '../utils/domain.js';
import { recordActivity } from '../utils/activity.js';
export async function list(req, res) {
  const selected = date(req.query.date || today(req.user.timezone), 'date', false);
  const routines = await Routine.find({ owner: req.user._id }).sort({ order: 1, _id: 1 }).lean();
  const completions = await RoutineCompletion.find({
    owner: req.user._id,
    date: selected,
    active: true,
  }).lean();
  const keys = new Set(completions.map((c) => String(c.routine)));
  res.json({
    date: selected,
    today: today(req.user.timezone),
    routines: routines.map((r) => ({
      ...r,
      schedule: scheduleAt(r, selected),
      nextSchedule: scheduleAt(r, addDays(today(req.user.timezone), 1)),
      scheduled: !!scheduled(r, selected),
      completed: keys.has(String(r._id)),
    })),
  });
}
export async function create(req, res) {
  const data = routineInput(req.body, true),
    localToday = today(req.user.timezone);
  if (data.startDate < localToday) fail('New routines must start today or later.');
  let routine = await Routine.findOne({ owner: req.user._id, clientKey: data.clientKey });
  if (routine) return res.json({ routine });
  const { weekdays, ...rest } = data;
  routine = await Routine.create({
    ...rest,
    owner: req.user._id,
    order: await Routine.countDocuments({ owner: req.user._id }),
    schedules: [{ effectiveDate: data.startDate, weekdays, archived: false }],
  });
  const warning = await recordActivity(
    req.user._id,
    'routine.created',
    routine.title,
    `routine:${routine.id}:created`,
  );
  res.status(201).json({ routine, warning });
}
export async function update(req, res) {
  const data = routineInput(req.body);
  const routine = await Routine.findOne({ _id: req.params.id, owner: req.user._id });
  if (!routine) fail('Routine not found.', 404);
  if (routine.__v !== req.body.__v) fail('Routine changed. Refresh and try again.', 409);
  const { weekdays, archived, ...rest } = data;
  Object.assign(routine, rest);
  if (weekdays || archived !== undefined) {
    const effectiveDate = [addDays(today(req.user.timezone), 1), routine.startDate].sort().at(-1);
    const current = scheduleAt(routine, effectiveDate);
    routine.schedules = routine.schedules.filter((s) => s.effectiveDate !== effectiveDate);
    routine.schedules.push({
      effectiveDate,
      weekdays: weekdays || current.weekdays,
      archived: archived ?? current.archived,
    });
  }
  await routine.save();
  const warning = await recordActivity(
    req.user._id,
    'routine.edited',
    routine.title,
    `routine:${routine.id}:${routine.__v}`,
  );
  res.json({ routine, warning });
}
export async function reorder(req, res) {
  fields(req.body, ['direction', '__v']);
  version(req.body.__v);
  choice(req.body.direction, ['earlier', 'later'], 'direction');
  const routine = await Routine.findOne({ _id: req.params.id, owner: req.user._id });
  if (!routine) fail('Routine not found.', 404);
  if (routine.__v !== req.body.__v) fail('Routine changed. Refresh and retry.', 409);
  const all = await Routine.find({ owner: req.user._id }).sort({ order: 1, _id: 1 });
  const index = all.findIndex((r) => r.id === routine.id),
    other = all[index + (req.body.direction === 'earlier' ? -1 : 1)];
  if (other) {
    const previous = all[index + (req.body.direction === 'earlier' ? -2 : 2)];
    routine.order =
      req.body.direction === 'earlier'
        ? (other.order + (previous?.order ?? other.order - 2)) / 2
        : (other.order + (previous?.order ?? other.order + 2)) / 2;
    await routine.save();
  }
  res.json({ routine });
}
export async function complete(req, res) {
  fields(req.body, ['completed']);
  if (typeof req.body.completed !== 'boolean') fail('Invalid completion state.');
  const selected = date(req.params.date, 'date', false);
  if (selected > today(req.user.timezone)) fail('Future routines cannot be completed.');
  const routine = await Routine.findOne({ _id: req.params.id, owner: req.user._id });
  if (!routine || !scheduled(routine, selected)) fail('Routine not scheduled for this date.', 404);
  const filter = { owner: req.user._id, routine: routine._id, date: selected };
  let completion = await RoutineCompletion.findOne(filter);
  if (!completion) {
    try {
      completion = await RoutineCompletion.create({ ...filter, active: false });
    } catch (e) {
      if (e.code !== 11000) throw e;
      completion = await RoutineCompletion.findOne(filter);
    }
  }
  const changed = await RoutineCompletion.findOneAndUpdate(
    { ...filter, active: !req.body.completed },
    { $set: { active: req.body.completed }, $inc: { __v: 1 } },
    { returnDocument: 'after' },
  );
  const warning = changed
    ? await recordActivity(
        req.user._id,
        req.body.completed ? 'routine.completed' : 'routine.undone',
        routine.title,
        `completion:${changed.id}:${changed.__v}`,
      )
    : null;
  res.json({ ok: true, warning });
}
