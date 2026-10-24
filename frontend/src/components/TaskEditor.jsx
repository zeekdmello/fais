import { useState, useCallback } from 'react';
import { Modal, Button, ErrorBox } from './Common';
import { api } from '../services/api';
import { useAutosave } from '../hooks/useAutosave';
const blank = {
  title: '',
  description: '',
  category: 'Personal',
  priority: 'Medium',
  status: 'Pending',
  scheduledDate: '',
  dueDate: '',
  dueTime: '',
};
export function TaskEditor({ task, onClose, onSaved }) {
  const [form, setForm] = useState(task || blank),
    [busy, setBusy] = useState(false),
    [createError, setCreateError] = useState(''),
    [key] = useState(() => crypto.randomUUID());
  const autosave = useAutosave(task || { __v: 0 }, async (patch) => {
    const result = await api(`/tasks/${task._id}`, { method: 'PATCH', body: patch });
    onSaved();
    return result.task;
  });
  const close = useCallback(() => {
    if (autosave.queue.dirty && !window.confirm('Edits have not saved. Discard them and close?'))
      return;
    onClose();
  }, [onClose, autosave.queue]);
  function change(name, value, immediate = false) {
    setForm((f) => ({ ...f, [name]: value }));
    if (task) autosave.change({ [name]: value }, immediate);
  }
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setCreateError('');
    try {
      await api('/tasks', { method: 'POST', body: { ...form, clientKey: key } });
      onSaved();
      onClose();
    } catch (e) {
      setCreateError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title={task ? 'A little more detail' : 'Make room for a task'} onClose={close}>
      <form onSubmit={submit}>
        <label>
          Task title
          <input
            required
            maxLength={140}
            value={form.title}
            onChange={(e) => change('title', e.target.value)}
            placeholder="What would you like to do?"
          />
        </label>
        <label htmlFor="task-notes">Notes</label>
        <textarea
          id="task-notes"
          rows={4}
          maxLength={4000}
          value={form.description}
          onChange={(e) => change('description', e.target.value)}
          placeholder="A few details, a small first step…"
          style={{ marginTop: -12, marginBottom: 20 }}
        />
        <div className="form-grid">
          {[
            ['priority', ['High', 'Medium', 'Low']],
            ['category', ['Study', 'Personal', 'Work', 'Health', 'Other']],
            ['status', ['Pending', 'In Progress', 'Completed']],
          ].map(([name, values]) => (
            <label key={name}>
              {name}
              <select value={form[name]} onChange={(e) => change(name, e.target.value, true)}>
                {values.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
          ))}
          <label>
            Scheduled date
            <input
              type="date"
              value={form.scheduledDate}
              onChange={(e) => change('scheduledDate', e.target.value)}
            />
          </label>
          <label>
            Due date
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => {
                setForm((f) => ({
                  ...f,
                  dueDate: e.target.value,
                  dueTime: e.target.value ? f.dueTime : '',
                }));
                if (task)
                  autosave.change({
                    dueDate: e.target.value,
                    ...(!e.target.value ? { dueTime: '' } : {}),
                  });
              }}
            />
          </label>
          <label>
            Due time
            <input
              type="time"
              disabled={!form.dueDate}
              value={form.dueTime}
              onChange={(e) => change('dueTime', e.target.value)}
            />
          </label>
        </div>
        <ErrorBox error={createError || autosave.error} />
        <footer>
          {task ? (
            <>
              <span className="save-status" role="status">
                {autosave.status}
              </span>
              {autosave.error && (
                <Button type="button" onClick={autosave.retry}>
                  Retry
                </Button>
              )}
              <Button type="button" onClick={close}>
                Done
              </Button>
            </>
          ) : (
            <Button className="yellow" disabled={busy}>
              {busy ? 'Adding…' : 'Add task'}
              <span>↗</span>
            </Button>
          )}
        </footer>
      </form>
    </Modal>
  );
}
