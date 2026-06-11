import Link from 'next/link';

import { grades, pathwayThemes, subjectsByPathway } from '../../../lib/subjects';

export const metadata = {
  title: 'Social Sciences Subjects | CBC Senior School',
};

export default function SocialSciencesSubjectsPage() {
  const pathway = pathwayThemes['social-sciences'];
  const subjects = subjectsByPathway['social-sciences'];

  return (
    <main className="mx-auto max-w-7xl p-6 md:p-10">
      <header className={`rounded-3xl p-6 shadow-sm ring-1 md:p-8 ${pathway.softBg} ${pathway.cardRing}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className={`text-xs font-bold uppercase tracking-wide ${pathway.accentText}`}>Green pathway</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-950">Social Sciences subjects</h1>
            <p className="mt-3 max-w-3xl text-slate-700">
              Humanities, enterprise, religious education, and civic inquiry subjects for Grades 10-12 with community-centred learning.
            </p>
          </div>
          <Link className="text-sm font-semibold text-emerald-700 hover:text-emerald-900" href="/subjects">
            ← All subjects
          </Link>
        </div>
      </header>

      <section className="mt-8 grid gap-6">
        {subjects.map((subject) => (
          <article key={subject.slug} className={`rounded-2xl bg-white p-6 shadow-sm ring-1 ${pathway.cardRing}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${pathway.badge}`}>Social Sciences</span>
                <h2 className="mt-4 text-2xl font-bold text-slate-950">{subject.name}</h2>
              </div>
              <Link className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${pathway.button}`} href={subject.assessmentHref}>
                View assessments
              </Link>
            </div>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">{subject.description}</p>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {grades.map((grade) => (
                <section key={grade} className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <h3 className="font-semibold text-slate-900">Grade {grade} topics</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                    {subject.topicsByGrade[grade].map((topic) => (
                      <li key={topic}>{topic}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Competency indicators</h3>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {subject.competencyIndicators.map((indicator) => (
                    <li key={indicator} className="rounded-lg bg-emerald-50 px-3 py-2 ring-1 ring-emerald-100">{indicator}</li>
                  ))}
                </ul>
              </section>
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Learning outcomes</h3>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {subject.learningOutcomes.map((outcome) => (
                    <li key={outcome} className="rounded-lg bg-emerald-50 px-3 py-2 ring-1 ring-emerald-100">{outcome}</li>
                  ))}
                </ul>
              </section>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
