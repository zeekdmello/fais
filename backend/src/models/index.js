import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const owner = { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true };
const options = { timestamps: true, optimisticConcurrency: true };
const userSchema = new Schema(
  {
    name: String,
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, select: false },
    timezone: { type: String, default: 'Asia/Kolkata' },
  },
  options,
);
const taskSchema = new Schema(
  {
    owner,
    clientKey: String,
    title: String,
    description: { type: String, default: '' },
    category: { type: String, default: 'Personal' },
    priority: { type: String, default: 'Medium' },
    status: { type: String, default: 'Pending' },
    scheduledDate: { type: String, default: '' },
    dueDate: { type: String, default: '' },
    dueTime: { type: String, default: '' },
    completedAt: { type: Date, default: null },
  },
  options,
);
taskSchema.index({ owner: 1, clientKey: 1 }, { unique: true });
taskSchema.index({ owner: 1, dueDate: 1 });
const scheduleSchema = new Schema(
  { effectiveDate: String, weekdays: [Number], archived: Boolean },
  { _id: false },
);
const routineSchema = new Schema(
  {
    owner,
    clientKey: String,
    title: String,
    icon: { type: String, default: 'sun' },
    color: { type: String, default: 'cream' },
    time: { type: String, default: '' },
    startDate: String,
    order: Number,
    schedules: [scheduleSchema],
  },
  options,
);
routineSchema.index({ owner: 1, clientKey: 1 }, { unique: true });
const completionSchema = new Schema(
  {
    owner,
    routine: { type: Schema.Types.ObjectId, required: true },
    date: String,
    active: Boolean,
  },
  options,
);
completionSchema.index({ owner: 1, routine: 1, date: 1 }, { unique: true });
const activitySchema = new Schema(
  { owner, action: String, label: String, eventKey: { type: String, unique: true } },
  { timestamps: true },
);
activitySchema.index({ owner: 1, createdAt: -1 });
export const User = model('User', userSchema);
export const Task = model('Task', taskSchema);
export const Routine = model('Routine', routineSchema);
export const RoutineCompletion = model('RoutineCompletion', completionSchema);
export const ActivityLog = model('ActivityLog', activitySchema);
