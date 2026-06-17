"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Pathway, Subject } from "@cbc-platform/types";

const PATHWAY_COLORS: Record<string, string> = {
  STEM:                   "border-blue-500  bg-blue-50  text-blue-700",
  SOCIAL_SCIENCES:        "border-orange-500 bg-orange-50 text-orange-700",
  ARTS_AND_SPORTS_SCIENCE:"border-purple-500 bg-purple-50 text-purple-700",
};

const PATHWAY_LABELS: Record<string, string> = {
  STEM:                   "STEM",
  SOCIAL_SCIENCES:        "Social Sciences",
  ARTS_AND_SPORTS_SCIENCE:"Arts & Sports Science",
};

const COMPULSORY_SUBJECTS = [
  { code: "ENG101", name: "English" },
  { code: "KIS101", name: "Kiswahili / KSL" },
  { code: "CSL101", name: "Community Service Learning" },
  { code: "PE101",  name: "Physical Education" },
  { code: "ICT101", name: "ICT" },
  { code: "RE101",  name: "Religious Education" },
  { code: "IND101", name: "Indigenous Language" },
];

type WizardStep = "pathway" | "electives" | "confirm";

export default function PathwayWizardPage() {
  const router = useRouter();
  const [step, setStep]               = useState<WizardStep>("pathway");
  const [pathways, setPathways]       = useState<Pathway[]>([]);
  const [selectedPathway, setSelectedPathway] = useState<Pathway | null>(null);
  const [selectedElectives, setSelectedElectives] = useState<string[]>([]);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState("");

  useEffect(() => {
    api
      .get<{ pathways: Pathway[] }>("/pathways")
      .then(({ pathways }) => setPathways(pathways));
  }, []);

  function toggleElective(subjectId: string) {
    setSelectedElectives((prev) => {
      if (prev.includes(subjectId)) {
        return prev.filter((id) => id !== subjectId);
      }
      if (prev.length >= 4) return prev;
      return [...prev, subjectId];
    });
  }

  async function handleSubmit() {
    if (!selectedPathway) return;
    if (selectedElectives.length < 3) {
      setError("Please select at least 3 elective subjects.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await api.post("/pathways/select", {
        pathwayId: selectedPathway.id,
        electiveSubjectIds: selectedElectives,
      });
      router.push("/student/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold text-gray-900">
            Pathway Selection Wizard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Choose your CBC Senior School pathway and elective subjects
          </p>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center gap-2 mb-8">
          {(["pathway", "electives", "confirm"] as WizardStep[]).map(
            (s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                    step === s
                      ? "bg-green-600 text-white"
                      : ["pathway", "electives"].indexOf(step) > i
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {i + 1}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block capitalize">
                  {s}
                </span>
                {i < 2 && (
                  <div className="w-8 sm:w-16 h-0.5 bg-gray-200" />
                )}
              </div>
            )
          )}
        </nav>

        {/* Step 1: Pathway Selection */}
        {step === "pathway" && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Step 1: Choose Your Learning Pathway
            </h2>

            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm font-semibold text-amber-800 mb-2">
                Compulsory Subjects (auto-enrolled for all students):
              </p>
              <div className="flex flex-wrap gap-2">
                {COMPULSORY_SUBJECTS.map((s) => (
                  <span
                    key={s.code}
                    className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {pathways.map((pathway) => {
                const colorClasses =
                  PATHWAY_COLORS[pathway.name] ||
                  "border-gray-300 bg-gray-50 text-gray-700";
                const isSelected = selectedPathway?.id === pathway.id;

                return (
                  <button
                    key={pathway.id}
                    onClick={() => setSelectedPathway(pathway)}
                    className={`relative p-5 rounded-xl border-2 text-left transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                      isSelected
                        ? `${colorClasses} ring-2 ring-offset-1`
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 flex items-center justify-center w-5 h-5 bg-green-600 rounded-full">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </span>
                    )}
                    <h3 className="font-bold text-base mb-1">
                      {PATHWAY_LABELS[pathway.name] || pathway.name}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {pathway.description}
                    </p>
                    <p className="mt-2 text-xs font-medium text-gray-400">
                      {pathway.subjects.length} elective tracks available
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                disabled={!selectedPathway}
                onClick={() => setStep("electives")}
                className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
              >
                Next: Choose Electives →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Elective Selection */}
        {step === "electives" && selectedPathway && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              Step 2: Select Elective Subjects
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Choose{" "}
              <span className="font-semibold text-green-700">3 to 4</span>{" "}
              subjects from the{" "}
              <span className="font-semibold">
                {PATHWAY_LABELS[selectedPathway.name]}
              </span>{" "}
              pathway. ({selectedElectives.length} selected)
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedPathway.subjects.map((subject: Subject) => {
                const isSelected = selectedElectives.includes(subject.id);
                const isDisabled =
                  !isSelected && selectedElectives.length >= 4;

                return (
                  <button
                    key={subject.id}
                    onClick={() => toggleElective(subject.id)}
                    disabled={isDisabled}
                    className={`p-4 rounded-xl border-2 text-left transition-all focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      isSelected
                        ? "border-green-500 bg-green-50"
                        : isDisabled
                        ? "border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed"
                        : "border-gray-200 bg-white hover:border-green-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">
                          {subject.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {subject.code}
                        </p>
                      </div>
                      <div
                        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? "bg-green-500 border-green-500"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep("pathway")}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
              <button
                disabled={selectedElectives.length < 3}
                onClick={() => setStep("confirm")}
                className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
              >
                Review Selection →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === "confirm" && selectedPathway && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Step 3: Confirm Your Selection
            </h2>

            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                  Selected Pathway
                </p>
                <p className="font-bold text-gray-900 text-lg">
                  {PATHWAY_LABELS[selectedPathway.name]}
                </p>
              </div>

              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                  Compulsory Subjects (7)
                </p>
                <div className="flex flex-wrap gap-2">
                  {COMPULSORY_SUBJECTS.map((s) => (
                    <span
                      key={s.code}
                      className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium rounded-full"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                  Elective Subjects ({selectedElectives.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedPathway.subjects
                    .filter((s: Subject) =>
                      selectedElectives.includes(s.id)
                    )
                    .map((s: Subject) => (
                      <span
                        key={s.id}
                        className="px-2.5 py-1 bg-green-50 border border-green-200 text-green-800 text-xs font-medium rounded-full"
                      >
                        {s.name}
                      </span>
                    ))}
                </div>
              </div>
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep("electives")}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
              >
                {submitting ? "Saving…" : "Confirm & Save Selection ✓"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
        }
