'use client';

import { useState } from 'react';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const roles = ['student', 'teacher', 'admin'];
const grades = [10, 11, 12];
const pathways = ['STEM', 'Social Sciences', 'Arts & Sports'];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    grade: '10',
    pathway: 'STEM',
  });
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
    setStatus('Creating your account...');

    const payload = {
      ...formData,
      grade: Number(formData.grade),
    };

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        setStatus(result.error || result.errors?.join(' ') || 'Registration failed.');
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem('cbcAuthToken', result.token);
      localStorage.setItem('cbcAuthUser', JSON.stringify(result.user));
      setStatus(`Account created for ${result.user.name}. You can now continue to your portal.`);
      setIsSubmitting(false);
    } catch (error) {
      setStatus(`Unable to reach the backend at ${apiBaseUrl}.`);
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-12">
      <section className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">CBC Learning Platform</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Create an account</h1>
        <p className="mt-2 text-sm text-slate-600">
          Register as a student, teacher, or admin for the CBC senior school portal.
        </p>

        <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Full name</span>
            <input
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Jane Learner"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email address</span>
            <input
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="jane@example.com"
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
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Role</span>
            <select
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Grade</span>
            <select
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
            >
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  Grade {grade}
                </option>
              ))}
            </select>
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">CBC pathway</span>
            <select
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              name="pathway"
              value={formData.pathway}
              onChange={handleChange}
            >
              {pathways.map((pathway) => (
                <option key={pathway} value={pathway}>
                  {pathway}
                </option>
              ))}
            </select>
          </label>

          <button
            className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 md:col-span-2"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        {status ? <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{status}</p> : null}

        <p className="mt-6 text-center text-sm text-slate-600">
          Already registered?{' '}
          <a className="font-semibold text-blue-600 hover:text-blue-700" href="/login">
            Sign in
          </a>
        </p>
      </section>
    </main>
  );
    }
    
