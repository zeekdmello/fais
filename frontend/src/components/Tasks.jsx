import { Check, MoreHorizontal, Trash2 } from 'lucide-react';
import { Art } from './Art';
import { displayDate } from '../services/api';
export function Race({ tasks, label = 'All displayed tasks' }) {
  const done = tasks.filter((t) => t.status === 'Completed').length,
    percent = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  return (
    <div className="race">
      <div className="race-copy">
        <span className="eyebrow">EVERY LITTLE STEP COUNTS</span>
        <strong>
          {done}
          <span> / {tasks.length} completed</span>
        </strong>
        <p>
          {label} ·{' '}
          {tasks.length ? `${percent}% of the way there` : 'Your next adventure starts here'}
        </p>
      </div>
      <div className="track">
        <div className="car" style={{ left: `${percent * 0.77}%` }}>
          <Art kind="car" />
        </div>
        <span className="finish">⚑</span>
        <div className="road" />
      </div>
    </div>
  );
}
export function TaskRow({ task, onEdit, onChange, onDelete, busy }) {
  return (
    <div className={`task-row ${task.status === 'Completed' ? 'is-done' : ''}`}>
      <button
        disabled={busy}
        className="check-button"
        aria-label={`${task.status === 'Completed' ? 'Reopen' : 'Complete'} ${task.title}`}
        onClick={() =>
          onChange(task, { status: task.status === 'Completed' ? 'Pending' : 'Completed' })
        }
      >
        {task.status === 'Completed' && <Check size={18} />}
      </button>
      <button className="task-main" onClick={() => onEdit(task)}>
        <strong>{task.title}</strong>
        <span>
          {task.category}
          {task.dueDate &&
            ` · ${displayDate(task.dueDate)}${task.dueTime ? ' · ' + task.dueTime : ''}`}
          {task.status === 'In Progress' && ' · In progress'}
          {task.overdue && <b className="overdue">Overdue</b>}
        </span>
      </button>
      <select
        className={`priority ${task.priority.toLowerCase()}`}
        aria-label={`Priority for ${task.title}`}
        disabled={busy}
        value={task.priority}
        onChange={(e) => onChange(task, { priority: e.target.value })}
      >
        {['High', 'Medium', 'Low'].map((p) => (
          <option key={p}>{p}</option>
        ))}
      </select>
      <button
        className="icon-button"
        aria-label={`Edit ${task.title}`}
        onClick={() => onEdit(task)}
      >
        <MoreHorizontal size={19} />
      </button>
      {onDelete && (
        <button
          disabled={busy}
          className="icon-button delete-button"
          aria-label={`Delete ${task.title}`}
          onClick={() => onDelete(task)}
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
