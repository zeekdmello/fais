import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { connectDatabase } from '../src/config/database.js';
import { User, Task, Routine, RoutineCompletion, ActivityLog } from '../src/models/index.js';
import { today, addDays, scheduled } from '../src/utils/domain.js';
await connectDatabase();
const email = process.env.DEMO_EMAIL || 'demo@fais.local';
const password = process.env.DEMO_PASSWORD || 'FaisDemo2026!';
if (await User.exists({ email })) {
  console.log('Demo account already exists; seed skipped.');
  await mongoose.disconnect();
  process.exit(0);
}
const user = await User.create({
  name: 'Alex',
  email,
  passwordHash: await bcrypt.hash(password, 12),
  timezone: 'Asia/Kolkata',
});
const owner = user._id,
  date = today(user.timezone);
const items = [
  [
    'Finish the project proposal',
    'Study',
    'High',
    'In Progress',
    'Outline the idea, scope, and what success looks like.',
    date,
  ],
  [
    'Read a chapter of Atomic Habits',
    'Personal',
    'Medium',
    'Pending',
    'Just a few pages. Small steps count.',
    date,
  ],
  [
    'A little grocery run',
    'Personal',
    'Low',
    'Pending',
    'Oats, bananas, coffee, and something green.',
    date,
  ],
  [
    'Book a dentist appointment',
    'Health',
    'High',
    'Pending',
    'Call the clinic after lunch.',
    addDays(date, 1),
  ],
  [
    'Send the design notes',
    'Work',
    'Medium',
    'Completed',
    'Share the updated wireframes with the team.',
    date,
  ],
  [
    'Make time for a walk',
    'Health',
    'Low',
    'Completed',
    'Twenty minutes outside, no headphones.',
    date,
  ],
];
await Task.insertMany(
  items.map(([title, category, priority, status, description, dueDate], i) => ({
    owner,
    clientKey: crypto.randomUUID(),
    title,
    category,
    priority,
    status,
    description,
    dueDate,
    scheduledDate: date,
    dueTime: i === 0 ? '17:00' : '',
    completedAt: status === 'Completed' ? new Date() : null,
  })),
);
const routines = await Routine.insertMany(
  [
    ['A slow morning', 'sun', 'cream', '07:30'],
    ['Drink some water', 'water', 'blue', '08:00'],
    ['Read a few pages', 'book', 'pink', '08:30'],
    ['Move your body', 'shoe', 'green', '17:30'],
    ['A moment to pause', 'cup', 'cream', '18:00'],
    ['Unplug & unwind', 'moon', 'lavender', '22:00'],
  ].map(([title, icon, color, time], i) => ({
    owner,
    clientKey: crypto.randomUUID(),
    title,
    icon,
    color,
    time,
    order: i,
    startDate: addDays(date, -20),
    schedules: [
      { effectiveDate: addDays(date, -20), weekdays: [0, 1, 2, 3, 4, 5, 6], archived: false },
    ],
  })),
);
for (let offset = -20; offset <= 0; offset++)
  for (let i = 0; i < routines.length; i++)
    if (
      (offset === 0 ? i < 2 : (i - offset) % 5 !== 0) &&
      scheduled(routines[i], addDays(date, offset))
    )
      await RoutineCompletion.create({
        owner,
        routine: routines[i]._id,
        date: addDays(date, offset),
        active: true,
      });
await ActivityLog.create({
  owner,
  action: 'demo.seeded',
  label: 'Clearly labeled demo account with sample tasks and routine history',
  eventKey: crypto.randomUUID(),
});
console.log(`Demo data created for ${email}. Password: ${password}`);
await mongoose.disconnect();
