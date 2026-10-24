import { useState } from 'react';
import { Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import { api, localDate, shiftDate, displayDate } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useData } from '../hooks/useData';
import { PageHeader, Button, ErrorBox, Empty } from '../components/Common';
import { Board } from '../components/Board';
import { RoutineEditor } from '../components/RoutineEditor';
export default function RoutinesPage() {
  const { user } = useAuth(),
    today = localDate(user.timezone);
  const [date, setDate] = useState(today),
    [editor, setEditor] = useState(null),
    [busy, setBusy] = useState(null),
    [error, setError] = useState('');
  const { data, error: loadError, reload } = useData(() => api('/routines?date=' + date), [date]);
  const weekday = (new Date(date + 'T12:00:00').getDay() + 6) % 7,
    start = shiftDate(date, -weekday);
  const { data: week } = useData(
    () => api(`/calendar?from=${start}&to=${shiftDate(start, 6)}`),
    [start, data],
  );
  const routines = data?.routines.filter((r) => r.scheduled) || [],
    done = routines.filter((r) => r.completed).length;
  async function act(r, path, method, body) {
    if (busy) return;
    setBusy(r._id);
    setError('');
    try {
      await api(`/routines/${r._id}${path}`, { method, body });
      await reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  }
  return (
    <>
      <PageHeader
        eyebrow="SHOW UP. CHECK IN. KEEP GOING."
        title="Your daily rhythm."
        description="Small rituals, a little more you."
        action={
          <Button className="yellow" onClick={() => setEditor('new')}>
            <Plus size={18} />
            New routine
          </Button>
        }
      />
      <div className="week-nav">
        <Button aria-label="Previous week" onClick={() => setDate(shiftDate(date, -7))}>
          <ArrowLeft size={18} />
        </Button>
        <strong>{displayDate(date, { month: 'long', year: 'numeric' })}</strong>
        <Button onClick={() => setDate(today)}>Today</Button>
        <Button aria-label="Next week" onClick={() => setDate(shiftDate(date, 7))}>
          <ArrowRight size={18} />
        </Button>
      </div>
      <div className="week-strip">
        {Array.from({ length: 7 }, (_, i) => {
          const day = shiftDate(start, i),
            stat = week?.routine.days.find((d) => d.date === day),
            percent = stat?.total ? (stat.completed / stat.total) * 100 : 0;
          return (
            <button
              key={day}
              className={date === day ? 'selected' : ''}
              onClick={() => setDate(day)}
            >
              <span>{day === today ? 'Today' : displayDate(day, { weekday: 'short' })}</span>
              <strong
                style={{
                  background: `linear-gradient(to top, #a8d977 ${percent}%, transparent ${percent}%)`,
                }}
              >
                {Number(day.slice(-2))}
              </strong>
              <small>
                {stat?.completed || 0}/{stat?.total || 0}
              </small>
            </button>
          );
        })}
      </div>
      <div className="board-caption">
        <h2>
          {done} <span>/ {routines.length} little wins</span>
        </h2>
        <span>
          {date > today
            ? 'A little look ahead — future check-ins are locked.'
            : 'Any order. Your pace. Make your move.'}
        </span>
      </div>
      <div className="progress-bar">
        <span style={{ width: `${routines.length ? (done / routines.length) * 100 : 0}%` }} />
      </div>
      <ErrorBox error={error || loadError} retry={reload} />
      {routines.length ? (
        <Board
          routines={routines}
          busy={busy}
          future={date > today}
          onEdit={setEditor}
          onToggle={(r) => act(r, `/completions/${date}`, 'PUT', { completed: !r.completed })}
          onMove={(r, direction) => act(r, '/order', 'POST', { direction, __v: r.__v })}
        />
      ) : (
        <Empty title="An open space in your day." onAdd={() => setEditor('new')}>
          No routines scheduled for this date.
        </Empty>
      )}
      <details className="routine-library">
        <summary>Manage all routines · {data?.routines.length || 0}</summary>
        {data?.routines.map((r) => (
          <div key={r._id}>
            <span>
              {r.title}{' '}
              <small>
                {r.nextSchedule?.archived
                  ? 'Archived from next effective date'
                  : !r.scheduled
                    ? 'Not scheduled on this date'
                    : ''}
              </small>
            </span>
            <Button onClick={() => setEditor(r)}>Edit routine</Button>
          </div>
        ))}
      </details>
      {editor && (
        <RoutineEditor
          routine={editor === 'new' ? null : editor}
          onClose={() => setEditor(null)}
          onSaved={reload}
        />
      )}
    </>
  );
}
