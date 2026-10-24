import { useState, useCallback } from 'react';
import { Modal, Button, ErrorBox } from './Common';
import { api, localDate } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAutosave } from '../hooks/useAutosave';
export function RoutineEditor({ routine, onClose, onSaved }) {
  const { user } = useAuth();
  const [form, setForm] = useState(
      routine
        ? {
            title: routine.title,
            icon: routine.icon,
            color: routine.color,
            time: routine.time,
            weekdays: routine.nextSchedule?.weekdays ||
              routine.schedule?.weekdays || [0, 1, 2, 3, 4, 5, 6],
            archived: routine.nextSchedule?.archived || false,
          }
        : {
            title: '',
            icon: 'sun',
            color: 'cream',
            time: '',
            weekdays: [0, 1, 2, 3, 4, 5, 6],
            startDate: localDate(user.timezone),
          },
    ),
    [key] = useState(() => crypto.randomUUID()),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const autosave = useAutosave(routine || { __v: 0 }, async (patch) => {
    const data = await api(`/routines/${routine._id}`, { method: 'PATCH', body: patch });
    onSaved();
    return data.routine;
  });
  const close = useCallback(() => {
    if (autosave.queue.dirty && !window.confirm('Discard unsaved edits?')) return;
    onClose();
  }, [onClose, autosave.queue]);
  function change(name, value, immediate = false) {
    setForm((f) => ({ ...f, [name]: value }));
    if (routine) autosave.change({ [name]: value }, immediate);
  }
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/routines', { method: 'POST', body: { ...form, clientKey: key } });
      onSaved();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title={routine ? 'Shape your routine' : 'A small daily ritual'} onClose={close}>
      <form onSubmit={submit}>
        <label>
          Routine name
          <input
            maxLength={100}
            required
            value={form.title}
            placeholder="Something worth repeating"
            onChange={(e) => change('title', e.target.value)}
          />
        </label>
        <div className="form-grid">
          <label>
            Illustration
            <select value={form.icon} onChange={(e) => change('icon', e.target.value, true)}>
              {['sun', 'book', 'leaf', 'cup', 'moon', 'heart', 'shoe', 'water'].map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </label>
          <label>
            Tile color
            <select value={form.color} onChange={(e) => change('color', e.target.value, true)}>
              {['cream', 'pink', 'blue', 'green', 'lavender'].map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </label>
          <label>
            Time (optional)
            <input type="time" value={form.time} onChange={(e) => change('time', e.target.value)} />
          </label>
          {!routine && (
            <label>
              Start date
              <input
                required
                type="date"
                min={localDate(user.timezone)}
                value={form.startDate}
                onChange={(e) => change('startDate', e.target.value)}
              />
            </label>
          )}
        </div>
        <fieldset>
          <legend>Repeat on</legend>
          <div className="weekday-select">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <button
                key={day}
                type="button"
                aria-pressed={form.weekdays.includes(index)}
                onClick={() =>
                  change(
                    'weekdays',
                    form.weekdays.includes(index)
                      ? form.weekdays.filter((d) => d !== index)
                      : [...form.weekdays, index],
                    true,
                  )
                }
              >
                {day}
              </button>
            ))}
          </div>
        </fieldset>
        {routine && (
          <>
            <p className="muted">
              Schedule and archive changes apply tomorrow (or the start date, if later). Past days
              keep their original schedule.
            </p>
            <label className="inline-check">
              <input
                type="checkbox"
                checked={form.archived}
                onChange={(e) => change('archived', e.target.checked, true)}
              />
              Archive this routine
            </label>
          </>
        )}
        <ErrorBox error={error || autosave.error} />
        <footer>
          {routine ? (
            <>
              <span role="status">{autosave.status}</span>
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
              {busy ? 'Adding…' : 'Add routine'} ↗
            </Button>
          )}
        </footer>
      </form>
    </Modal>
  );
}
