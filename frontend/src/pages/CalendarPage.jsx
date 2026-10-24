import { useState, useEffect } from 'react';
import { api, localDate, displayDate } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useData } from '../hooks/useData';
import { PageHeader, MonthPicker, ErrorBox } from '../components/Common';
import { Check, CalendarDays } from 'lucide-react';
export default function CalendarPage() {
  const { user } = useAuth(),
    today = localDate(user.timezone),
    [month, setMonth] = useState(today.slice(0, 7)),
    [selected, setSelected] = useState(today);
  const { data, error, reload } = useData(
    () => api('/calendar?from=' + month + '-01'),
    [month, user.timezone],
  );
  const {
    data: detail,
    error: detailError,
    reload: reloadDetails,
  } = useData(async () => {
    const [tasks, routines] = await Promise.all([api('/tasks'), api('/routines?date=' + selected)]);
    return {
      tasks: tasks.tasks.filter(
        (t) =>
          t.scheduledDate === selected ||
          t.dueDate === selected ||
          (t.completedAt && localDate(user.timezone, new Date(t.completedAt)) === selected),
      ),
      routines: routines.routines.filter((r) => r.scheduled),
    };
  }, [selected, user.timezone]);
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') {
        reload();
        reloadDetails();
      }
    };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    const timer = window.setInterval(refresh, 30000);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
      window.clearInterval(timer);
    };
  }, [reload, reloadDetails]);
  const offset = (new Date(month + '-01T12:00:00').getDay() + 6) % 7;
  return (
    <>
      <PageHeader
        eyebrow="THE BIGGER PICTURE"
        title="One day at a time."
        description="Every little square tells a story."
        action={
          <MonthPicker
            month={month}
            setMonth={(m) => {
              setMonth(m);
              setSelected(m + '-01');
            }}
          />
        }
      />
      <ErrorBox error={error} retry={reload} />
      <div className="calendar-layout">
        <section className="panel calendar-panel">
          <div className="calendar-heading">
            <CalendarDays />
            <h2>{displayDate(month + '-01', { month: 'long', year: 'numeric' })}</h2>
            <span>
              {data?.routine.completed || 0} routines · {data?.tasks.completedInPeriod || 0} tasks
              completed
            </span>
          </div>
          <div className="calendar-grid">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <span className="calendar-weekday" key={i}>
                {d}
              </span>
            ))}
            {Array.from({ length: offset }, (_, i) => (
              <span key={'blank' + i} />
            ))}
            {data?.daily.map((day) => (
              <button
                key={day.date}
                className={`${selected === day.date ? 'selected' : ''} ${day.date === today ? 'today' : ''}`}
                onClick={() => setSelected(day.date)}
                aria-label={`${day.date}: ${day.completed} of ${day.total} routines, ${day.tasks} tasks completed, ${day.taskCompleted} of ${day.taskTotal} listed tasks complete`}
              >
                <strong>{Number(day.date.slice(-2))}</strong>
                <span className="calendar-routine-indicator" title="Rituals completed / scheduled">
                  <span>R {day.total ? `${day.completed}/${day.total}` : '—'}</span>
                  <span className="calendar-routine-track" aria-hidden="true">
                    <span
                      style={{ width: `${day.total ? (day.completed / day.total) * 100 : 0}%` }}
                    />
                  </span>
                </span>
                <span
                  className="calendar-routine-indicator calendar-task-indicator"
                  title="Tasks completed / listed for this date"
                >
                  <span>T {day.taskTotal ? `${day.taskCompleted}/${day.taskTotal}` : '—'}</span>
                  <span className="calendar-routine-track calendar-task-track" aria-hidden="true">
                    <span
                      style={{
                        width: `${day.taskTotal ? (day.taskCompleted / day.taskTotal) * 100 : 0}%`,
                      }}
                    />
                  </span>
                </span>
              </button>
            ))}
          </div>
          <div className="calendar-legend">
            <span>
              <i className="green" />R = rituals completed / scheduled
            </span>
            <span>
              <i className="blue" />T = tasks completed / listed
            </span>
          </div>
          <p className="small-note">
            Green tracks rituals. Blue tracks tasks scheduled, due or completed on that date.
            Updates on return and every 30 seconds while open.
          </p>
        </section>
        <aside className="panel date-detail">
          <span className="eyebrow">A PAGE FROM YOUR MONTH</span>
          <h2>{displayDate(selected, { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
          <ErrorBox error={detailError} retry={reloadDetails} />
          <h3>Daily rituals</h3>
          <p className="small-note">
            {detail?.routines.filter((r) => r.completed).length || 0} of{' '}
            {detail?.routines.length || 0} completed
          </p>
          {detail?.routines.length ? (
            detail.routines.map((r) => (
              <div className="detail-row" key={r._id}>
                <span className={`mini-check ${r.completed ? 'done' : ''}`}>
                  {r.completed ? <Check size={14} /> : '·'}
                </span>
                {r.title}
              </div>
            ))
          ) : (
            <p className="muted">No routines scheduled.</p>
          )}
          <h3>Tasks scheduled, due or completed</h3>
          <p className="small-note">
            {detail?.tasks.filter((t) => t.status === 'Completed').length || 0} of{' '}
            {detail?.tasks.length || 0} listed tasks completed
          </p>
          {detail?.tasks.length ? (
            detail.tasks.map((t) => (
              <div className="detail-row" key={t._id}>
                <span className={`mini-check ${t.status === 'Completed' ? 'done' : ''}`}>
                  {t.status === 'Completed' ? <Check size={14} /> : '·'}
                </span>
                <div>
                  {t.title}
                  <small>
                    {t.priority} · {t.status}
                  </small>
                </div>
              </div>
            ))
          ) : (
            <p className="muted">No tasks scheduled, due or completed on this date.</p>
          )}
          <p className="small-note">
            Green bars show completed / scheduled rituals. Future days are excluded from completion
            rates.
          </p>
        </aside>
      </div>
    </>
  );
}
