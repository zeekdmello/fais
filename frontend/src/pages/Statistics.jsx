import { useState } from 'react';
import { api, localDate, shiftDate } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useData } from '../hooks/useData';
import { PageHeader, MonthPicker, ErrorBox } from '../components/Common';
import { Art } from '../components/Art';
export default function Statistics() {
  const { user } = useAuth(),
    today = localDate(user.timezone),
    [month, setMonth] = useState(today.slice(0, 7)),
    [period, setPeriod] = useState('month');
  const weekday = (new Date(today + 'T12:00:00').getDay() + 6) % 7,
    from = period === 'month' ? month + '-01' : shiftDate(today, -weekday),
    to = period === 'week' ? shiftDate(from, 6) : '';
  const { data, error, reload } = useData(
    () => api('/statistics?' + new URLSearchParams({ from, ...(to ? { to } : {}) })),
    [from, to],
  );
  const max = Math.max(1, ...(data?.daily || []).map((d) => d.completed + d.tasks));
  return (
    <>
      <PageHeader
        eyebrow="LOOK HOW FAR YOU’VE COME"
        title="Little steps add up."
        description="Your progress, with a little perspective."
        action={
          <MonthPicker
            month={month}
            setMonth={(value) => {
              setMonth(value);
              setPeriod('month');
            }}
          />
        }
      />
      <div className="tabs">
        {['month', 'week'].map((p) => (
          <button key={p} className={period === p ? 'active' : ''} onClick={() => setPeriod(p)}>
            {p === 'month' ? 'Selected month' : 'This week'}
          </button>
        ))}
      </div>
      <ErrorBox error={error} retry={reload} />
      <div className="report-grid">
        <article className="report-card cream">
          <span className="eyebrow">ROUTINE COMPLETION</span>
          <strong>
            {data?.routine.percentage ?? '—'}
            <small>{data?.routine.percentage != null ? '%' : ''}</small>
          </strong>
          <p>
            {data?.routine.completed || 0} of {data?.routine.total || 0} scheduled occurrences
          </p>
          <Art kind="sun" />
        </article>
        <article className="report-card green">
          <span className="eyebrow">TASKS COMPLETED IN PERIOD</span>
          <strong>{data?.tasks.completedInPeriod || 0}</strong>
          <p>A little less on your mind.</p>
          <Art kind="book" />
        </article>
        <article className="report-card pink">
          <span className="eyebrow">MOST COMPLETED ROUTINE</span>
          <h2>{data?.routine.most?.title || 'Your next little ritual'}</h2>
          <p>
            {data?.routine.most
              ? `${data.routine.most.count} check-ins in this period`
              : 'Your first check-in starts the story.'}
          </p>
          <Art kind="heart" />
        </article>
      </div>
      <section className="panel chart-panel">
        <div className="section-title">
          <div>
            <span className="eyebrow">A LITTLE, EVERY DAY</span>
            <h2>Your daily progress</h2>
          </div>
          <div className="chart-legend">
            <span>● Routines</span>
            <span>● Tasks</span>
          </div>
        </div>
        <div
          className="bar-chart"
          role="img"
          aria-label="Daily completed routine and task counts; exact values are in the table below"
        >
          {data?.daily.map((d) => (
            <div
              className="bar-column"
              key={d.date}
              title={`${d.date}: ${d.completed} routines, ${d.tasks} tasks`}
            >
              <div className="bar-stack">
                <div className="task-bar" style={{ height: `${(d.tasks / max) * 140}px` }} />
                <div className="routine-bar" style={{ height: `${(d.completed / max) * 140}px` }} />
              </div>
              <span>{Number(d.date.slice(-2))}</span>
            </div>
          ))}
        </div>
        <details>
          <summary>View daily counts</summary>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Routines done</th>
                  <th>Scheduled</th>
                  <th>Tasks done</th>
                </tr>
              </thead>
              <tbody>
                {data?.daily.map((d) => (
                  <tr key={d.date}>
                    <td>{d.date}</td>
                    <td>{d.completed}</td>
                    <td>
                      {d.total}
                      {d.future ? ' (future)' : ''}
                    </td>
                    <td>{d.tasks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>
      <div className="stats-bottom">
        <section className="panel">
          <div className="section-title">
            <h2>Tasks, at a glance</h2>
          </div>
          <p className="muted inset">Current totals across all your tasks.</p>
          {Object.entries(data?.tasks.byStatus || {}).map(([name, count]) => (
            <div className="breakdown" key={name}>
              <span>{name}</span>
              <strong>{count}</strong>
            </div>
          ))}
          <div className="priority-counts">
            {Object.entries(data?.tasks.byPriority || {}).map(([name, count]) => (
              <span key={name} className={'priority ' + name.toLowerCase()}>
                {name} · {count}
              </span>
            ))}
          </div>
        </section>
        <section className="panel">
          <div className="section-title">
            <h2>Keeping your rhythm</h2>
          </div>
          {data?.streaks.map((s) => (
            <div className="breakdown" key={s.title}>
              <span>{s.title}</span>
              <strong>{s.streak} days</strong>
            </div>
          ))}
          {!data?.streaks.length && <p className="muted inset">Add a routine to start a streak.</p>}
        </section>
      </div>
      <p className="small-note">
        Routine rates include scheduled occurrences through today in {user.timezone}; future days
        are excluded. Streaks count consecutive scheduled days, skip unscheduled days, and allow
        today to remain unfinished. Task completion counts use the current completion timestamp;
        reopening removes that completion.
      </p>
    </>
  );
}
