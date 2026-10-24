// Removes only the explicitly named fixtures created by scripts/browser-check.mjs.
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';
import { User, Task, Routine, RoutineCompletion, ActivityLog } from '../src/models/index.js';
await connectDatabase();
const demo = await User.findOne({ email: 'demo@fais.local' });
if (demo) {
  const owner = demo._id;
  const routines = await Routine.find({ owner, title: /^Browser verification ritual(?: \d+)?$/ });
  await RoutineCompletion.deleteMany({ owner, routine: { $in: routines.map((r) => r._id) } });
  await Routine.deleteMany({ owner, _id: { $in: routines.map((r) => r._id) } });
  await Task.deleteMany({ owner, title: /^Browser verification (?:task|updated)(?: \d+)?$/ });
  await ActivityLog.deleteMany({
    owner,
    label: /^Browser verification (?:task|updated|ritual)(?: \d+)?$/,
  });
}
await mongoose.disconnect();
console.log('Named browser fixtures removed from the demo account.');
