"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CompetencyScore, RubricScore } from "@cbc-platform/types";

const COMPETENCY_LABELS: Record<string, string> = {
  COMMUNICATION:      "Communication",
  CRITICAL_THINKING:  "Critical Thinking",
  CREATIVITY:         "Creativity",
  CITIZENSHIP:        "Citizenship",
  DIGITAL_LITERACY:   "Digital Literacy",
  LEARNING_TO_LEARN:  "Learning to Learn",
  SELF_EFFICACY:      "Self-Efficacy",
};

const LEVEL_CONFIG: Record<RubricScore | "NOT_ASSESSED", {
  label: string;
  color: string;
  bg: string;
  barColor: string;
}> = {
  EE:           { label: "Exceeding Expectation",  color: "text-emerald-700", bg: "bg-emerald-100", barColor: "bg-emerald-500" },
  ME:           { label: "Meeting Expectation",     color: "text-blue-700",    bg: "bg-blue-100",    barColor: "bg-blue-500" },
  AE:           { label: "Approaching Expectation", color: "text-amber-700",   bg: "bg-amber-100",   barColor: "bg-amber-500" },
  BE:           { label: "Below Expectation",       color: "text-red-700",     bg: "bg-red-100",     barColor: "bg-red-500" },
  NOT_ASSESSED: { label: "Not Yet Assessed",        color: "text-gray-500",    bg: "bg-gray-100",    barColor: "bg-gray-300" },
};

function weightToPercent(weight: number): number {
  return Math.round(((weight - 1) / 3) * 100);
}

const SVG_SIZE   = 280;
const CENTER     = SVG_SIZE / 2;
const MAX_RADIUS = 100;
const SIDES      = 7;

function computePolygonPoints(scores: CompetencyScore[]): string {
  return scores
    .map((s, i) => {
      const angle  = (Math.PI * 2 * i) / SIDES - Math.PI / 2;
      const r      = (s.averageWeight / 4) * MAX_RADIUS;
      const x      = CENTER + r * Math.cos(angle);
      const y      = CENTER + r * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(" ");
}

function computeGridPoints(fraction: number): string {
  return Array.from({ length: SIDES }, (_, i) => {
    const angle = (Math.PI * 2 * i) / SIDES - Math.PI / 2;
    const r     = fraction * MAX_RADIUS;
    const x     = CENTER + r * Math.cos(angle);
    const y     = CENTER + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(" ");
}

interface CompetencyRadarProps {
  studentId?: string;
}

export function CompetencyRadar({ studentId }: CompetencyRadarProps) {
  const [scores, setScores]   = useState<CompetencyScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = studentId
      ? `/assessments/child/${studentId}/progress`
      : "/assessments/my-competencies";

    api
      .get<{ competencyScores: CompetencyScore[] }>(endpoint)
      .then(({ competencyScores }) => setScores(competencyScores))
      .catch(() => setScores([]))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading competency data…
      </div>
    );
  }

  const dataPoints = computePolygonPoints(scores);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="mb-4">
        <h2 className="text-base font-bold text-gray-900">
          7 Core CBC Competencies
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Aggregated from all graded assessments
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* SVG Spider Chart */}
        <div className="flex-shrink-0 mx-auto">
          <svg
            width={SVG_SIZE}
            height={SVG_SIZE}
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            className="overflow-visible"
          >
            {/* Grid rings */}
            {[0.25, 0.5, 0.75, 1].map((fraction) => (
              <polygon
                key={fraction}
                points={computeGridPoints(fraction)}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}

            {/* Grid spokes */}
            {scores.map((_, i) => {
              const angle = (Math.PI * 2 * i) / SIDES - Math.PI / 2;
              const x2    = CENTER + MAX_RADIUS * Math.cos(angle);
              const y2    = CENTER + MAX_RADIUS * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={CENTER}
                  y1={CENTER}
                  x2={x2}
                  y2={y2}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              );
            })}

            {/* Data polygon */}
            {scores.length === 7 && (
              <polygon
                points={dataPoints}
                fill="rgba(16, 185, 129, 0.15)"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            )}

            {/* Data points */}
            {scores.map((s, i) => {
              const angle = (Math.PI * 2 * i) / SIDES - Math.PI / 2;
              const r     = (s.averageWeight / 4) * MAX_RADIUS;
              const cx    = CENTER + r * Math.cos(angle);
              const cy    = CENTER + r * Math.sin(angle);
              return (
                <circle
                  key={s.competency}
                  cx={cx}
                  cy={cy}
                  r={5}
                  fill="#10b981"
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}

            {/* Axis labels */}
            {scores.map((s, i) => {
              const angle    = (Math.PI * 2 * i) / SIDES - Math.PI / 2;
              const labelR   = MAX_RADIUS + 22;
              const lx       = CENTER + labelR * Math.cos(angle);
              const ly       = CENTER + labelR * Math.sin(angle);
              const anchor   =
                Math.abs(Math.cos(angle)) < 0.1
                  ? "middle"
                  : Math.cos(angle) > 0
                  ? "start"
                  : "end";

              return (
                <text
                  key={s.competency}
                  x={lx}
                  y={ly}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                  fontSize="9"
                  fill="#374151"
                  fontWeight="500"
                >
                  {COMPETENCY_LABELS[s.competency]}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Score Bars */}
        <div className="flex-1 w-full space-y-3">
          {scores.map((s) => {
            const config  = LEVEL_CONFIG[s.level];
            const percent = weightToPercent(s.averageWeight);

            return (
              <div key={s.competency}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-700">
                    {COMPETENCY_LABELS[s.competency]}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}
                  >
                    {s.level === "NOT_ASSESSED" ? "—" : s.level}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`${config.barColor} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex justify-between mt-0.5">
                  <span className="text-xs text-gray-400">
                    {s.assessmentsCount} assessment
                    {s.assessmentsCount !== 1 ? "s" : ""}
                  </span>
                  <span className="text-xs text-gray-400">{percent}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(["EE", "ME", "AE", "BE"] as RubricScore[]).map((level) => {
          const c = LEVEL_CONFIG[level];
          return (
            <div
              key={level}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${c.bg}`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${c.barColor}`} />
              <span className={`text-xs font-semibold ${c.color}`}>
                {level} — {c.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
      }
