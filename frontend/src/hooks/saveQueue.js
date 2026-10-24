// One request at a time; new edits remain pending until the current version is confirmed.
export class SaveQueue {
  constructor(record, save, notify) {
    this.record = record;
    this.save = save;
    this.notify = notify;
    this.pending = {};
    this.busy = false;
    this.error = null;
  }
  add(patch) {
    Object.assign(this.pending, patch);
    this.error = null;
    this.notify('Unsaved changes');
  }
  async flush() {
    if (this.busy) return;
    if (!Object.keys(this.pending).length) return;
    const patch = this.pending;
    this.pending = {};
    this.busy = true;
    this.error = null;
    this.notify('Saving…');
    try {
      this.record = await this.save({ ...patch, __v: this.record.__v });
      this.busy = false;
      if (Object.keys(this.pending).length) await this.flush();
      else this.notify('Saved');
    } catch (error) {
      this.pending = { ...patch, ...this.pending };
      this.busy = false;
      this.error = error;
      this.notify('Could not save — Retry', error);
    }
  }
  get dirty() {
    return this.busy || Object.keys(this.pending).length > 0;
  }
}
