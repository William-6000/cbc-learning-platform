"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CslLog } from "@cbc-platform/types";

export default function CslApprovalsPage() {
  const [pendingLogs, setPendingLogs] = useState<CslLog[]>([]);
  const [loading, setLoading]         = useState(true);
  const [reviewing, setReviewing]     = useState<string | null>(null);
  const [feedback, setFeedback]       = useState<Record<string, string>>({});
  const [error, setError]             = useState("");

  async function loadPending() {
    try {
      const result = await api.get<{ pendingLogs: CslLog[] }>("/csl/pending");
      setPendingLogs(result.pendingLogs);
    } catch {
      setPendingLogs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPending();
  }, []);

  async function handleReview(logId: string, status: "APPROVED" | "REJECTED") {
    setReviewing(logId);
    setError("");

    try {
      await api.patch(`/csl/${logId}/review`, {
        status,
        teacherFeedback: feedback[logId] || "",
      });
      await loadPending();
      setFeedback((prev) => {
        const next = { ...prev };
        delete next[logId];
        return next;
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Review failed");
    } finally {
      setReviewing(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold text-gray-900">
            CSL Approval Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Review and approve student CSL hour submissions
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            Loading pending submissions…
          </div>
        ) : pendingLogs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="text-5xl mb-3">✅</div>
            <p className="font-semibold text-gray-700">
              All caught up! No pending CSL submissions.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 font-medium">
              {pendingLogs.length} submission
              {pendingLogs.length !== 1 ? "s" : ""} pending review
            </p>

            {pendingLogs.map((log) => (
              <div
                key={log.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-gray-900">
                        {log.title}
                      </h3>
                      <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-full">
                        Pending
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-0.5">
                      {log.student?.firstName} {log.student?.lastName}
                      {log.student?.grade && (
                        <span className="ml-1 text-gray-400">
                          · {log.student.grade.replace("_", " ")}
                        </span>
                      )}
                      {" · "}
                      Submitted{" "}
                      {new Date(log.submittedAt).toLocaleDateString("en-KE", {
                        day:   "numeric",
                        month: "short",
                        year:  "numeric",
                      })}
                    </p>

                    <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                      {log.description}
                    </p>

                    {log.evidenceUrls.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {log.evidenceUrls.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded px-2 py-0.5 hover:bg-blue-100"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                            Evidence {i + 1}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0 text-center min-w-[60px]">
                    <p className="text-2xl font-bold text-gray-900">
                      {log.hoursLogged}
                    </p>
                    <p className="text-xs text-gray-400">hours</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Feedback for student (optional):
                  </label>
                  <textarea
                    rows={2}
                    value={feedback[log.id] || ""}
                    onChange={(e) =>
                      setFeedback((prev) => ({
                        ...prev,
                        [log.id]: e.target.value,
                      }))
                    }
                    placeholder="Add feedback before approving or rejecting…"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                  />

                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={() => handleReview(log.id, "APPROVED")}
                      disabled={reviewing === log.id}
                      className="flex-1 sm:flex-none px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg disabled:opacity-60 hover:bg-emerald-700 transition-colors"
                    >
                      {reviewing === log.id ? "Saving…" : "✓ Approve"}
                    </button>
                    <button
                      onClick={() => handleReview(log.id, "REJECTED")}
                      disabled={reviewing === log.id}
                      className="flex-1 sm:flex-none px-5 py-2 bg-red-50 text-red-700 border border-red-200 text-sm font-semibold rounded-lg disabled:opacity-60 hover:bg-red-100 transition-colors"
                    >
                      ✗ Request Revision
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
            }
