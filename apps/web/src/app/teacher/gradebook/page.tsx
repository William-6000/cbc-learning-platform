"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Assessment, AssessmentScore, RubricScore } from "@cbc-platform/types";

interface StudentRow {
  id: string;
  firstName: string;
  lastName: string;
}

interface GradebookData {
  assessments: Assessment[];
  students: StudentRow[];
}

const RUBRIC_OPTIONS: { value: RubricScore; label: string; color: string }[] = [
  { value: "EE", label: "EE", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  { value: "ME", label: "ME", color: "bg-blue-100 text-blue-800 border-blue-300" },
  { value: "AE", label: "AE", color: "bg-amber-100 text-amber-800 border-amber-300" },
  { value: "BE", label: "BE", color: "bg-red-100 text-red-800 border-red-300" },
];

const RUBRIC_FULL: Record<RubricScore, string> = {
  EE: "Exceeding Expectation",
  ME: "Meeting Expectation",
  AE: "Approaching Expectation",
  BE: "Below Expectation",
};

function RubricBadge({ score }: { score: RubricScore }) {
  const option = RUBRIC_OPTIONS.find((o) => o.value === score);
  if (!option) return null;
  return (
    <span
      title={RUBRIC_FULL[score]}
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${option.color}`}
    >
      {option.label}
    </span>
  );
}

export default function GradebookPage() {
  const [classId, setClassId]       = useState<string>("");
  const [data, setData]             = useState<GradebookData | null>(null);
  const [gradingCell, setGradingCell] = useState<{
    assessmentId: string;
    studentId: string;
  } | null>(null);
  const [pendingScore, setPendingScore] = useState<RubricScore>("ME");
  const [pendingFeedback, setPendingFeedback] = useState("");
  const [saving, setSaving]         = useState(false);
  const [saveError, setSaveError]   = useState("");

  const loadGradebook = useCallback(async (id: string) => {
    if (!id) return;
    try {
      const result = await api.get<GradebookData>(
        `/assessments/class/${id}/gradebook`
      );
      setData(result);
    } catch {
      setData(null);
    }
  }, []);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("classId") || "";
    setClassId(id);
    if (id) loadGradebook(id);
  }, [loadGradebook]);

  function getScore(
    assessment: Assessment,
    studentId: string
  ): AssessmentScore | undefined {
    return assessment.scores?.find((s) => s.student?.id === studentId);
  }

  function openGradingModal(assessmentId: string, studentId: string) {
    setGradingCell({ assessmentId, studentId });
    setPendingScore("ME");
    setPendingFeedback("");
    setSaveError("");
  }

  async function saveGrade() {
    if (!gradingCell) return;
    setSaving(true);
    setSaveError("");

    try {
      await api.post(
        `/assessments/${gradingCell.assessmentId}/grade/${gradingCell.studentId}`,
        { score: pendingScore, feedback: pendingFeedback }
      );
      setGradingCell(null);
      await loadGradebook(classId);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Failed to save grade");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Formative Assessment Gradebook
            </h1>
            <p className="text-sm text-gray-500">
              CBC 4-tier rubric grading system
            </p>
          </div>
          <div className="flex items-center gap-3">
            {RUBRIC_OPTIONS.map((r) => (
              <span
                key={r.value}
                title={RUBRIC_FULL[r.value]}
                className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${r.color}`}
              >
                {r.label} — {RUBRIC_FULL[r.value]}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!data ? (
          <div className="text-center py-16 text-gray-400">
            Loading gradebook…
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left font-semibold text-gray-700 min-w-[180px]">
                      Student
                    </th>
                    {data.assessments.map((a) => (
                      <th
                        key={a.id}
                        className="px-3 py-3 text-center font-semibold text-gray-700 min-w-[120px] max-w-[160px]"
                      >
                        <div className="truncate" title={a.title}>
                          {a.title}
                        </div>
                        <div className="text-xs font-normal text-gray-400 truncate">
                          {a.subject?.name}
                        </div>
                        {a.competencyTags && a.competencyTags.length > 0 && (
                          <div className="mt-1 flex flex-wrap justify-center gap-1">
                            {a.competencyTags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="inline-block px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded"
                              >
                                {tag.replace(/_/g, " ")}
                              </span>
                            ))}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.students.map((student, rowIdx) => (
                    <tr
                      key={student.id}
                      className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                    >
                      <td className="sticky left-0 z-10 bg-inherit px-4 py-3 font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </td>
                      {data.assessments.map((assessment) => {
                        const scoreRecord = getScore(assessment, student.id);
                        return (
                          <td
                            key={assessment.id}
                            className="px-3 py-3 text-center"
                          >
                            {scoreRecord ? (
                              <button
                                onClick={() =>
                                  openGradingModal(assessment.id, student.id)
                                }
                                className="group relative"
                                title={`Feedback: ${scoreRecord.feedback || "None"}`}
                              >
                                <RubricBadge score={scoreRecord.score} />
                                <span className="sr-only">Edit grade</span>
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  openGradingModal(assessment.id, student.id)
                                }
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-dashed border-gray-300 text-gray-400 hover:border-green-400 hover:text-green-600 transition-colors"
                              >
                                + Grade
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Grading Modal */}
      {gradingCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-base font-bold text-gray-900 mb-1">
              Assign CBC Rubric Score
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Select the performance level and add optional feedback.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {RUBRIC_OPTIONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setPendingScore(r.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    pendingScore === r.value
                      ? `${r.color} border-current`
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-bold text-sm">{r.label}</p>
                  <p className="text-xs mt-0.5 text-gray-600">
                    {RUBRIC_FULL[r.value]}
                  </p>
                </button>
              ))}
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teacher Feedback (optional)
            </label>
            <textarea
              rows={3}
              value={pendingFeedback}
              onChange={(e) => setPendingFeedback(e.target.value)}
              placeholder="Add formative feedback for the student…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            {saveError && (
              <p className="mt-2 text-xs text-red-600">{saveError}</p>
            )}

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setGradingCell(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveGrade}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg disabled:opacity-60 hover:bg-green-700"
              >
                {saving ? "Saving…" : "Save Grade"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  }
