import { ActivityLog } from '../models/index.js';
export async function recordActivity(owner, action, label, eventKey) {
  try {
    await ActivityLog.updateOne(
      { eventKey },
      { $setOnInsert: { owner, action, label, eventKey } },
      { upsert: true },
    );
    return null;
  } catch {
    return 'Your change was saved, but its activity entry could not be recorded. Activity history may be incomplete.';
  }
}
