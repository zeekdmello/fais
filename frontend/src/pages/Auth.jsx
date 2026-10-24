import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Art } from '../components/Art';
import { Button, ErrorBox } from '../components/Common';
export default function Auth({ register = false }) {
  const { user, setUser } = useAuth(),
    navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' }),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/app" replace />;
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await api(register ? '/auth/register' : '/auth/login', {
        method: 'POST',
        body: register ? form : { email: form.email, password: form.password },
      });
      setUser(data.user);
      navigate('/app');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-page">
      <div className="auth-story">
        <Link to="/" className="brand">
          fais<span>✳</span>
        </Link>
        <div>
          <span className="eyebrow">A LITTLE PROGRESS, EVERY DAY.</span>
          <h1>
            Make room
            <br />
            for a good day.
          </h1>
          <Art kind="plant" />
          <p>
            You don’t have to do it all.
            <br />
            Just start with one little thing.
          </p>
        </div>
        <span>To do. To make. To make it yours.</span>
      </div>
      <div className="auth-form">
        <Link to="/" className="back-link">
          ← Back to Fais
        </Link>
        <span className="eyebrow">{register ? 'YOUR FRESH START' : 'YOUR NEXT CHAPTER'}</span>
        <h2>{register ? 'Hello, you.' : 'Welcome back.'}</h2>
        <p>
          {register
            ? 'A little space for your plans, routines, and you.'
            : 'Your little things are right where you left them.'}
        </p>
        <form onSubmit={submit}>
          {register && (
            <label>
              Your name
              <input
                autoComplete="name"
                required
                maxLength={80}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="What should we call you?"
              />
            </label>
          )}
          <label>
            Email address
            <input
              autoComplete="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              autoComplete={register ? 'new-password' : 'current-password'}
              type="password"
              minLength={register ? 8 : 1}
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={register ? 'At least 8 characters' : 'Your password'}
            />
          </label>
          <ErrorBox error={error} />
          <Button className="yellow large" disabled={busy}>
            {busy ? 'Just a moment…' : register ? 'Create my account' : 'Let’s get into it'}
            <ArrowUpRight size={20} />
          </Button>
        </form>
        <p>
          {register ? 'Already have an account?' : 'New around here?'}{' '}
          <Link to={register ? '/login' : '/register'}>
            {register ? 'Log in' : 'Make yourself at home'}
          </Link>
        </p>
      </div>
    </main>
  );
}
