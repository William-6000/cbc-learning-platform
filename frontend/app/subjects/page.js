import Link from 'next/link';

import { getSubjects, grades, pathwayThemes } from '../../lib/subjects';

export const metadata = {
  title: 'CBC Subjects | Senior School',
};

function SubjectCard({ subject, selectedGrade }) {
  const theme = pathwayThemes[subject.pathway];
  const visibleGrades = selectedGrade === 'all' ? grades : [Number(selectedGrade)];

  return (
    <article className={`rounded-2xl bg-white p-6 shadow-sm ring-1 ${theme.cardRing}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${theme.badge}`}>
          {theme.name}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
          Grades {visibleGrades.join(', ')}
        </span>
      </div>
      <h2 className="mt-4 text-2xl font-bold text-slate-950">{subject.name}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{subject.description}</p>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {visibleGrades.map((grade) => (
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

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Competency indicators</h3>
          <ul className="mt-2 space-y-2 text-sm text-slate-700">
            {subject.competencyIndicators.map((indicator) => (
              <li key={indicator} className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                {indicator}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Learning outcomes</h3>
          <ul className="mt-2 space-y-2 text-sm text-slate-700">
            {subject.learningOutcomes.map((outcome) => (
              <li key={outcome} className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                {outcome}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Link
        className={`mt-5 inline-flex rounded-lg px-4 py-2 text-sm font-semibold transition ${theme.button}`}
        href={subject.assessmentHref}
      >
        View assessments
      </Link>
    </article>
  );
}

export default async function SubjectsPage({ searchParams }) {
  const params = await searchParams;
  const selectedPathway = pathwayThemes[params?.pathway]?.slug || 'all';
  const selectedGrade = grades.includes(Number(params?.grade)) ? String(params.grade) : 'all';
  const subjects = getSubjects({ pathway: selectedPathway, grade: selectedGrade });

  return (
    <main className="mx-auto max-w-7xl p-6 md:p-10">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">CBC Senior School</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-950">Subject pathways for Grades 10-12</h1>
            <p className="mt-3 max-w-3xl text-slate-600">
              Explore STEM, Social Sciences, and Arts & Sports subjects with grade-level topics, competency indicators, learning outcomes, and assessment links.
            </p>
          </div>
          <Link className="text-sm font-semibold text-blue-700 hover:text-blue-900" href="/">
            ← Back to dashboard
          </Link>
        </div>
      </header>

      <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200" aria-label="Subject filters">
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Filter by pathway</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 ${selectedPathway === 'all' ? 'bg-slate-900 text-white ring-slate-900' : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'}`} href={`/subjects?grade=${selectedGrade}`}>
                All pathways
              </Link>
              {Object.values(pathwayThemes).map((pathway) => (
                <Link
                  key={pathway.slug}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 ${selectedPathway === pathway.slug ? pathway.badge : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'}`}
                  href={`/subjects?pathway=${pathway.slug}&grade=${selectedGrade}`}
                >
                  {pathway.name}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Filter by grade</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 ${selectedGrade === 'all' ? 'bg-slate-900 text-white ring-slate-900' : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'}`} href={`/subjects?pathway=${selectedPathway}`}>
                All grades
              </Link>
              {grades.map((grade) => (
                <Link
                  key={grade}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 ${selectedGrade === String(grade) ? 'bg-slate-900 text-white ring-slate-900' : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'}`}
                  href={`/subjects?pathway=${selectedPathway}&grade=${grade}`}
                >
                  Grade {grade}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3" aria-label="Pathway pages">
        {Object.values(pathwayThemes).map((pathway) => (
          <Link key={pathway.slug} className={`rounded-2xl p-5 ring-1 transition hover:-translate-y-0.5 hover:shadow-md ${pathway.softBg} ${pathway.cardRing}`} href={pathway.pageHref}>
            <p className={`text-sm font-semibold ${pathway.accentText}`}>{pathway.color} pathway</p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">{pathway.name}</h2>
            <p className="mt-2 text-sm text-slate-600">Open the dedicated pathway subject page →</p>
          </Link>
        ))}
      </section>

      <section className="mt-8 space-y-6" aria-label="Subjects">
        {subjects.map((subject) => (
          <SubjectCard key={`${subject.pathway}-${subject.slug}`} subject={subject} selectedGrade={selectedGrade} />
        ))}
      </section>
    </main>
  );
}
