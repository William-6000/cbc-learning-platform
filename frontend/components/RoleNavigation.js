export default function RoleNavigation({ sections }) {
  return (
    <nav aria-label="Role-based portal navigation" className="mt-8 grid gap-4 lg:grid-cols-3">
      {sections.map((section) => (
        <section key={section.role} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-950">{section.role}</h2>
          <p className="mt-2 min-h-12 text-sm text-slate-600">{section.description}</p>
          <ul className="mt-4 space-y-2">
            {section.links.map((link) => (
              <li key={link.href}>
                <a
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-blue-50 hover:text-blue-700 hover:ring-blue-200"
                  href={link.href}
                >
                  <span>{link.label}</span>
                  <span aria-hidden="true">→</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  );
}
