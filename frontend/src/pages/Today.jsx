import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowUpRight, Check, Flame, Flag, Sun } from 'lucide-react';
import { api, localDate, displayDate } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useData } from '../hooks/useData';
import { PageHeader, Button, ErrorBox, Empty } from '../components/Common';
import { TaskRow } from '../components/Tasks';
import { TaskEditor } from '../components/TaskEditor';
import { Board } from '../components/Board';
import { Art, Spark } from '../components/Art';
export default function Today() {
  const { user } = useAuth(),
    date = localDate(user.timezone);
  const [editor, setEditor] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const {
    data,
    error: loadError,
    loading,
    reload,
  } = useData(async () => {
    const [tasks, routines, report] = await Promise.all([
      api('/tasks'),
      api('/routines?date=' + date),
      api('/statistics'),
    ]);
    return { tasks: tasks.tasks, routines: routines.routines.filter((r) => r.scheduled), report };
  }, [date]);
  const tasks = data?.tasks || [],
    routines = data?.routines || [],
    due = tasks.filter(
      (t) =>
        t.status !== 'Completed' && (t.scheduledDate === date || t.dueDate === date || t.overdue),
    ),
    priority = tasks.filter((t) => t.priority === 'High' && t.status !== 'Completed'),
    done = routines.filter((r) => r.completed).length,
    streak = Math.max(0, ...(data?.report.streaks || []).map((s) => s.streak));
  async function change(task, patch) {
    if (busy) return;
    setBusy(true);
    try {
      await api('/tasks/' + task._id, { method: 'PATCH', body: { ...patch, __v: task.__v } });
      await reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function toggle(r) {
    if (busy) return;
    setBusy(true);
    try {
      await api(`/routines/${r._id}/completions/${date}`, {
        method: 'PUT',
        body: { completed: !r.completed },
      });
      await reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeader
        eyebrow={displayDate(date, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }).toUpperCase()}
        title={`A good day starts here, ${user.name.split(' ')[0]}.`}
        action={
          <Button className="yellow" onClick={() => setEditor('new')}>
            <Plus size={18} />
            New task
          </Button>
        }
      />
      <section className="welcome-banner">
        <div>
          <span className="eyebrow">YOUR DAY, AT YOUR PACE</span>
          <h2>
            Small steps.
            <br />
            Good things ahead.
          </h2>
          <p>You don’t have to do it all. Just the next little thing.</p>
          <Link to="/app/routines">
            Find your rhythm <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="banner-art">
          <span className="banner-spark">
            <Spark />
          </span>
          <Art kind="sun" />
          <span className="hand-note">a fresh start, every day</span>
        </div>
      </section>
      <div className="stat-strip">
        {[
          [Flag, 'On your list', due.length, 'tasks for today'],
          [Check, 'Little wins', done + '/' + routines.length, 'routines today'],
          [Flame, 'Keeping the rhythm', streak, 'day best current streak'],
        ].map(([Icon, label, value, sub]) => (
          <div key={label}>
            <span className="stat-icon">
              <Icon size={21} />
            </span>
            <div>
              <span>{label}</span>
              <strong>
                {value}
                <small>{sub}</small>
              </strong>
            </div>
          </div>
        ))}
      </div>
      <ErrorBox error={error || loadError} retry={reload} />
      {loading ? (
        <p className="loading">Gathering your little things…</p>
      ) : (
        <div className="today-columns">
          <section className="panel">
            <div className="section-title">
              <div>
                <span className="eyebrow">MAKE SPACE FOR WHAT MATTERS</span>
                <h2>
                  A little focus <span className="count">{priority.length}</span>
                </h2>
              </div>
              <Link to="/app/tasks">
                All tasks <ArrowUpRight size={15} />
              </Link>
            </div>
            {priority.length ? (
              priority
                .slice(0, 4)
                .map((task) => (
                  <TaskRow
                    key={task._id}
                    task={task}
                    onEdit={setEditor}
                    onChange={change}
                    busy={busy}
                  />
                ))
            ) : (
              <Empty title="Room to breathe.">No unfinished high-priority tasks.</Empty>
            )}
            <div className="section-title secondary">
              <h3>Also on today’s page</h3>
            </div>
            {due
              .filter((t) => t.priority !== 'High')
              .slice(0, 4)
              .map((task) => (
                <TaskRow
                  key={task._id}
                  task={task}
                  onEdit={setEditor}
                  onChange={change}
                  busy={busy}
                />
              ))}
            {!due.filter((t) => t.priority !== 'High').length && (
              <p className="muted inset">A little breathing room in your day.</p>
            )}
            <button className="add-line" onClick={() => setEditor('new')}>
              <Plus size={18} />
              Add a little thing
            </button>
          </section>
          <section className="panel routine-preview">
            <div className="section-title">
              <div>
                <span className="eyebrow">SHOW UP FOR YOURSELF</span>
                <h2>Your daily rhythm</h2>
              </div>
              <Sun size={22} />
            </div>
            <div className="routine-progress">
              <span>
                {done} of {routines.length} little rituals
              </span>
              <strong>{routines.length ? Math.round((done / routines.length) * 100) : 0}%</strong>
            </div>
            <div className="progress-bar">
              <span style={{ width: `${routines.length ? (done / routines.length) * 100 : 0}%` }} />
            </div>
            {routines.length ? (
              <Board
                compact
                routines={routines.slice(0, 6)}
                onToggle={toggle}
                busy={busy ? routines.find((r) => r)?._id : null}
              />
            ) : (
              <Empty title="Find your rhythm.">Create your first repeating routine.</Empty>
            )}
            <Link className="board-link" to="/app/routines">
              Open my routine board <ArrowUpRight size={17} />
            </Link>
          </section>
        </div>
      )}
      <div className="daily-note">
        <span>✳</span>
        <p>“You don’t need a perfect day to make a little progress.”</p>
        <span>A NOTE TO SELF</span>
      </div>
      {editor && (
        <TaskEditor
          task={editor === 'new' ? null : editor}
          onClose={() => setEditor(null)}
          onSaved={reload}
        />
      )}
    </>
  );
}
