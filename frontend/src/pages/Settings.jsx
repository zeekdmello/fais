import { useState } from 'react';
import { useAutosave } from '../hooks/useAutosave';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader, Button, ErrorBox } from '../components/Common';
export default function Settings() {
  const { user, setUser } = useAuth(),
    [name, setName] = useState(user.name),
    [zone, setZone] = useState(user.timezone);
  const autosave = useAutosave({ __v: 0 }, async ({ __v, ...patch }) => {
    const data = await api('/settings', { method: 'PATCH', body: patch });
    setUser(data.user);
    return { __v: __v + 1 };
  });
  return (
    <>
      <PageHeader
        eyebrow="MAKE YOURSELF AT HOME"
        title="Your little corner."
        description="The details that make Fais yours."
      />
      <section className="panel settings-panel">
        <div className="settings-profile">
          <span className="avatar">{user.name.charAt(0)}</span>
          <div>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            autosave.retry();
          }}
        >
          <label>
            Your name
            <input
              required
              maxLength={80}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                autosave.change({ name: e.target.value }, true);
              }}
            />
          </label>
          <label>
            Email address
            <input readOnly value={user.email} />
          </label>
          <label>
            Your timezone
            <select
              value={zone}
              onChange={(e) => {
                setZone(e.target.value);
                autosave.change({ timezone: e.target.value }, true);
              }}
            >
              {[
                ...new Set([
                  'Asia/Kolkata',
                  'UTC',
                  user.timezone,
                  ...Intl.supportedValuesOf('timeZone'),
                ]),
              ].map((z) => (
                <option key={z}>{z}</option>
              ))}
            </select>
          </label>
          <p className="muted">
            Your timezone decides when a new day begins and when tasks become overdue. Changing it
            affects future date calculations; stored calendar dates are preserved.
          </p>
          <ErrorBox error={autosave.error} />
          <footer>
            <span role="status">{autosave.status}</span>
            {autosave.error && <Button>Retry</Button>}
          </footer>
        </form>
      </section>
      <section className="about-fais">
        <span className="brand">
          fais<span>✳</span>
        </span>
        <p>To do. To make. To make it yours.</p>
        <p className="small-note">Version 1.0 · Your own space for a little progress, every day.</p>
      </section>
    </>
  );
}
