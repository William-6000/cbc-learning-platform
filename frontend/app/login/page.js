'use client';

import { useState } from 'react';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus('Signing in...');

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (!response.ok) {
        setStatus(result.error || 'Login failed. Please check your credentials.');
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem('cbcAuthToken', result.token);
      localStorage.setItem('cbcAuthUser', JSON.stringify(result.user));
      setStatus(`Welcome back, ${result.user.name}.`);
      setIsSubmitting(false);
    } catch (error) {
      setStatus(`Unable to reach the backend at ${apiBaseUrl}.`);
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-12">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">CBC Learning Platform</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">
          Access your student, teacher, or admin workspace.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email address</span>
            <input
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="learner@example.com"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </label>

          <button
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {status ? <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{status}</p> : null}

        <p className="mt-6 text-center text-sm text-slate-600">
          Need an account?{' '}
          <a className="font-semibold text-blue-600 hover:text-blue-700" href="/register">
            Register here
          </a>
        </p>
      </section>
    </main>
  );
    }
                
