import { Task } from '../models/index.js';
import { taskInput, fail, version, fields } from '../utils/validation.js';
import { sortTasks, overdue } from '../utils/domain.js';
import { recordActivity } from '../utils/activity.js';
export async function list(req, res) {
  const query = { owner: req.user._id };
  for (const key of ['priority', 'status', 'category'])
    if (req.query[key]) query[key] = String(req.query[key]);
  let tasks = await Task.find(query).lean();
  if (req.query.search) {
    const search = String(req.query.search).toLowerCase().slice(0, 140);
    tasks = tasks.filter((t) => `${t.title} ${t.description}`.toLowerCase().includes(search));
  }
  if (req.query.date)
    tasks = tasks.filter((t) => t.scheduledDate === req.query.date || t.dueDate === req.query.date);
  res.json({
    tasks: sortTasks(tasks, req.query.sort).map((t) => ({
      ...t,
      overdue: overdue(t, req.user.timezone),
    })),
  });
}
export async function create(req, res) {
  const data = taskInput(req.body, true);
  if (data.dueTime && !data.dueDate) fail('Set a due date before a due time.');
  let task = await Task.findOne({ owner: req.user._id, clientKey: data.clientKey });
  if (task) return res.json({ task });
  task = await Task.create({
    ...data,
    owner: req.user._id,
    completedAt: data.status === 'Completed' ? new Date() : null,
  });
  const warning = await recordActivity(
    req.user._id,
    'task.created',
    task.title,
    `task:${task.id}:created`,
  );
  res.status(201).json({ task, warning });
}
export async function update(req, res) {
  const data = taskInput(req.body);
  const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
  if (!task) fail('Task not found.', 404);
  if (task.__v !== req.body.__v)
    fail('This task changed elsewhere. Close and reopen the editor before retrying.', 409);
  if ((data.dueTime ?? task.dueTime) && !(data.dueDate ?? task.dueDate))
    fail('Set a due date before a due time.');
  const changed = Object.keys(data).some((key) => data[key] !== task[key]);
  if (!changed) return res.json({ task });
  const previous = task.status;
  Object.assign(task, data);
  if (task.status !== previous) task.completedAt = task.status === 'Completed' ? new Date() : null;
  await task.save();
  const action =
    task.status !== previous
      ? task.status === 'Completed'
        ? 'task.completed'
        : previous === 'Completed'
          ? 'task.reopened'
          : 'task.edited'
      : 'task.edited';
  const warning = await recordActivity(
    req.user._id,
    action,
    task.title,
    `task:${task.id}:${task.__v}`,
  );
  res.json({ task, warning });
}
export async function remove(req, res) {
  fields(req.body, ['__v']);
  version(req.body.__v);
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id,
    __v: req.body.__v,
  });
  if (!task) fail('Task missing or changed. Refresh before deleting.', 409);
  const warning = await recordActivity(
    req.user._id,
    'task.deleted',
    task.title,
    `task:${task.id}:deleted`,
  );
  res.json({ ok: true, warning });
}
