"use client";

import { useEffect, useState, FormEvent } from "react";
import { api } from "@/lib/api";
import { CslLog } from "@cbc-platform/types";

const STATUS_CONFIG = {
  PENDING:  { label: "Pending Review", color: "bg-amber-50 text-amber-700 border-amber-200" },
  APPROVED: { label: "Approved",       color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED: { label: "Needs Revision", color: "bg-red-50 text-red-700 border-red-200" },
};

export default function CslPage() {
  const [logs, setLogs]             = useState<CslLog[]>([]);
  const [approvedHours, setApprovedHours] = useState(0);
  const [showForm, setShowForm]     = useState(false);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");

  // Form state
  const [title, setTitle]           = useState("");
  const [description, setDescription] = useState("");
  const [hoursLogged, setHoursLogged] = useState<number>(1);
  const [evidenceUrls, setEvidenceUrls] = useState<string>("");

  const CSL_REQUIRED_HOURS = 40;

  async function loadLogs() {
    try {
      const result = await api.get<{ logs: CslLog[]; approvedHours: number }>(
        "/csl/my-logs"
      );
      setLogs(result.logs);
      setApprovedHours(result.approvedHours);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    const urls = evidenceUrls
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);

    try {
      await api.post("/csl/submit", {
        title,
        description,
        hoursLogged: Number(hoursLogged),
        evidenceUrls: urls,
      });

      setSuccess("CSL log submitted successfully! It is now pending teacher review.");
      setTitle("");
      setDescription("");
      setHoursLogged(1);
      setEvidenceUrls("");
      setShowForm(false);
      await loadLogs();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  const progressPercent = Math.min(
    Math.round((approvedHours / CSL_REQUIRED_HOURS) * 100),
    100
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Community Service Learning (CSL)
            </h1>
            <p className="text-sm text-gray-500">
              Log your service hours and upload evidence for teacher review
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setError("");
              setSuccess("");
            }}
            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            + Log Hours
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Progress Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Approved CSL Hours
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-0.5">
                {approvedHours}
                <span className="text-lg text-gray-400 font-medium">
                  /{CSL_REQUIRED_HOURS} hrs
                </span>
              </p>
            </div>
            <div
              className={`text-center w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 ${
                progressPercent >= 100
                  ? "border-emerald-500 text-emerald-700"
                  : "border-green-200 text-green-700"
              }`}
            >
              <span className="text-2xl font-bold">{progressPercent}%</span>
              <span className="text-xs">done</span>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-700 ${
                progressPercent >= 100 ? "bg-emerald-500" : "bg-green-500"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {progressPercent >= 100 && (
            <p className="mt-2 text-sm font-semibold text-emerald-700">
              ✓ You have completed your required CSL hours!
            </p>
          )}
        </div>

        {success && (
          <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm">
            {success}
          </div>
        )}

        {/* Submission Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4">
              New CSL Log Entry
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Environmental Clean-up at Uhuru Park"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reflection / Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what you did, what you learned, and how it relates to your CBC competencies…"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hours Logged
                </label>
                <input
                  type="number"
                  required
                  min={0.5}
                  max={200}
                  step={0.5}
                  value={hoursLogged}
                  onChange={(e) => setHoursLogged(parseFloat(e.target.value))}
                  className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Evidence URLs (one per line)
                </label>
                <textarea
                  rows={3}
                  value={evidenceUrls}
                  onChange={(e) => setEvidenceUrls(e.target.value)}
                  placeholder="https://drive.google.com/…&#10;https://photos.google.com/…"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Paste links to photos, videos, or documents (Google Drive, OneDrive, etc.)
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg disabled:opacity-60 hover:bg-green-700"
                >
                  {submitting ? "Submitting…" : "Submit for Review"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Log History */}
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-3">
            My CSL Portfolio
          </h2>

          {loading ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              Loading logs…
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              No CSL logs yet. Click &quot;+ Log Hours&quot; to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => {
                const statusCfg = STATUS_CONFIG[log.status];
                return (
                  <div
                    key={log.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm text-gray-900">
                            {log.title}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.color}`}
                          >
                            {statusCfg.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Submitted:{" "}
                          {new Date(log.submittedAt).toLocaleDateString("en-KE", {
                            day:   "numeric",
                            month: "short",
                            year:  "numeric",
                          })}
                        </p>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {log.description}
                        </p>

                        {log.teacherFeedback && (
                          <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                            <p className="text-xs font-semibold text-blue-700 mb-0.5">
                              Teacher Feedback:
                            </p>
                            <p className="text-xs text-blue-800">
                              {log.teacherFeedback}
                            </p>
                          </div>
                        )}

                        {log.evidenceUrls.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {log.evidenceUrls.map((url, i) => (
                              <a
                                key={i}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-green-700 underline hover:text-green-900"
                              >
                                Evidence {i + 1}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex-shrink-0 text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {log.hoursLogged}
                        </p>
                        <p className="text-xs text-gray-400">hours</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
              }
