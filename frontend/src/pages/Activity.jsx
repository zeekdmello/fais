import { useState } from 'react';
import { Check, Plus, History } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useData } from '../hooks/useData';
import { PageHeader, Button, ErrorBox, Empty } from '../components/Common';
export default function Activity() {
  const { user } = useAuth(),
    [page, setPage] = useState(1),
    [action, setAction] = useState(''),
    [date, setDate] = useState('');
  const { data, error, reload } = useData(
    () => api('/activity?' + new URLSearchParams({ page, action, date })),
    [page, action, date],
  );
  return (
    <>
      <PageHeader
        eyebrow="YOUR TRAIL OF LITTLE THINGS"
        title="The story so far."
        description="A record of the steps you’ve taken."
      />
      <div className="filters">
        <label>
          Action
          <select
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All actions</option>
            {[
              'task.created',
              'task.edited',
              'task.completed',
              'task.reopened',
              'task.deleted',
              'routine.created',
              'routine.edited',
              'routine.completed',
              'routine.undone',
            ].map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <Button
          onClick={() => {
            setDate('');
            setAction('');
            setPage(1);
          }}
        >
          Reset
        </Button>
      </div>
      <ErrorBox error={error} retry={reload} />
      <section className="panel activity-list">
        {data?.items.length ? (
          data.items.map((item) => (
            <div className="activity-row" key={item._id}>
              <span className="activity-icon">
                {item.action.includes('completed') ? (
                  <Check size={19} />
                ) : item.action.includes('created') ? (
                  <Plus size={19} />
                ) : (
                  <History size={19} />
                )}
              </span>
              <div>
                <strong>{item.label}</strong>
                <span>
                  {item.action.replace('.', ' ').replace('demo seeded', 'Demo data created')}
                </span>
              </div>
              <time>
                {new Date(item.createdAt).toLocaleString('en-IN', {
                  timeZone: user.timezone,
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </time>
            </div>
          ))
        ) : (
          <Empty title="Your story starts here.">Your saved changes will appear here.</Empty>
        )}
      </section>
      <div className="pagination">
        <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
          ← Previous
        </Button>
        <span>
          Page {page} of {data?.pages || 1}
        </span>
        <Button disabled={page >= (data?.pages || 1)} onClick={() => setPage(page + 1)}>
          Next →
        </Button>
      </div>
    </>
  );
}
