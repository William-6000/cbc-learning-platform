import Link from 'next/link';

      <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200" aria-labelledby="subjects-heading">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Grades 10-12 catalog</p>
            <h2 id="subjects-heading" className="mt-1 text-2xl font-bold text-slate-950">Subject Pages</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Browse CBC Senior School subjects by pathway and grade, including topics, competency indicators, learning outcomes, and assessment links.
            </p>
          </div>
          <Link className="inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700" href="/subjects">
            View all subjects
          </Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Link className="rounded-xl bg-blue-50 p-4 text-blue-800 ring-1 ring-blue-200 transition hover:bg-blue-100" href="/subjects/stem">
            <span className="text-sm font-semibold">STEM</span>
            <span className="mt-1 block text-xs text-blue-700">Blue pathway subjects →</span>
          </Link>
          <Link className="rounded-xl bg-emerald-50 p-4 text-emerald-800 ring-1 ring-emerald-200 transition hover:bg-emerald-100" href="/subjects/social-sciences">
            <span className="text-sm font-semibold">Social Sciences</span>
            <span className="mt-1 block text-xs text-emerald-700">Green pathway subjects →</span>
          </Link>
          <Link className="rounded-xl bg-orange-50 p-4 text-orange-800 ring-1 ring-orange-200 transition hover:bg-orange-100" href="/subjects/arts-sports">
            <span className="text-sm font-semibold">Arts & Sports</span>
            <span className="mt-1 block text-xs text-orange-700">Orange pathway subjects →</span>
          </Link>
        </div>
      </section>
    
