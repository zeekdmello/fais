import { useState } from 'react';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { api } from '../services/api';
import { useData } from '../hooks/useData';
import { PageHeader, Button, ErrorBox, Empty } from '../components/Common';
import { TaskEditor } from '../components/TaskEditor';
import { TaskRow, Race } from '../components/Tasks';
export default function TasksPage() {
  const [filters, setFilters] = useState({
      search: '',
      priority: '',
      status: '',
      category: '',
      date: '',
      sort: 'priority',
    }),
    [editor, setEditor] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const {
    data,
    loading,
    error: loadError,
    reload,
  } = useData(() => api('/tasks?' + new URLSearchParams(filters)), [JSON.stringify(filters)]);
  const tasks = data?.tasks || [];
  async function change(task, patch) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await api('/tasks/' + task._id, { method: 'PATCH', body: { ...patch, __v: task.__v } });
      await reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function remove(task) {
    if (!window.confirm(`Delete “${task.title}”?`)) return;
    setBusy(true);
    try {
      await api('/tasks/' + task._id, { method: 'DELETE', body: { __v: task.__v } });
      await reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function clear() {
    const done = tasks.filter((t) => t.status === 'Completed');
    if (!window.confirm(`Delete ${done.length} completed tasks in the current filtered view?`))
      return;
    setBusy(true);
    try {
      for (const task of done)
        await api('/tasks/' + task._id, { method: 'DELETE', body: { __v: task.__v } });
    } catch (e) {
      setError(e.message);
    } finally {
      await reload();
      setBusy(false);
    }
  }
  const filter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
  const pending = tasks.filter((t) => t.status !== 'Completed'),
    done = tasks.filter((t) => t.status === 'Completed');
  return (
    <>
      <PageHeader
        eyebrow="ONE THING AT A TIME"
        title="My tasks."
        description="A place for everything on your mind."
        action={
          <Button className="yellow" onClick={() => setEditor('new')}>
            <Plus size={18} />
            New task
          </Button>
        }
      />
      <Race tasks={tasks} label="Current filtered view" />
      <div className="filters">
        <label className="search">
          <Search size={18} />
          <input
            aria-label="Search tasks"
            placeholder="Find a little thing…"
            value={filters.search}
            onChange={(e) => filter('search', e.target.value)}
          />
        </label>
        <SlidersHorizontal size={18} />
        {[
          ['priority', ['High', 'Medium', 'Low']],
          ['status', ['Pending', 'In Progress', 'Completed']],
          ['category', ['Study', 'Personal', 'Work', 'Health', 'Other']],
        ].map(([key, values]) => (
          <select
            key={key}
            aria-label={`Filter by ${key}`}
            value={filters[key]}
            onChange={(e) => filter(key, e.target.value)}
          >
            <option value="">
              All {key === 'category' ? 'categories' : key === 'status' ? 'statuses' : 'priorities'}
            </option>
            {values.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        ))}
        <input
          type="date"
          aria-label="Filter by date"
          value={filters.date}
          onChange={(e) => filter('date', e.target.value)}
        />
        <select
          aria-label="Sort tasks"
          value={filters.sort}
          onChange={(e) => filter('sort', e.target.value)}
        >
          <option value="priority">Priority first</option>
          <option value="due">Due date first</option>
          <option value="newest">Newest first</option>
        </select>
        <button
          className="text-button"
          onClick={() =>
            setFilters({
              search: '',
              priority: '',
              status: '',
              category: '',
              date: '',
              sort: 'priority',
            })
          }
        >
          Reset
        </button>
      </div>
      <ErrorBox error={error || loadError} retry={reload} />
      <section className="panel task-panel">
        <div className="section-title">
          <h2>
            Your next little steps <span className="count">{pending.length}</span>
          </h2>
        </div>
        {loading ? (
          <p className="loading">Loading your tasks…</p>
        ) : !tasks.length ? (
          <Empty title="A clear page. A fresh start." onAdd={() => setEditor('new')}>
            Add a task or adjust your filters.
          </Empty>
        ) : (
          pending.map((task) => (
            <TaskRow
              key={task._id}
              task={task}
              onEdit={setEditor}
              onChange={change}
              onDelete={remove}
              busy={busy}
            />
          ))
        )}
        {done.length > 0 && (
          <details className="completed-section" open>
            <summary>Little wins · {done.length} completed</summary>
            {done.map((task) => (
              <TaskRow
                key={task._id}
                task={task}
                onEdit={setEditor}
                onChange={change}
                onDelete={remove}
                busy={busy}
              />
            ))}
            <Button disabled={busy} onClick={clear}>
              Clear completed in this view
            </Button>
          </details>
        )}
      </section>
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
