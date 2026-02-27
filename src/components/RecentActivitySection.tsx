import { useMemo, useState } from 'react';
import { projects } from '../data/projects';

export function RecentActivitySection() {
  const allStacks = useMemo(
    () => Array.from(new Set(projects.flatMap((p) => p.stacks))).sort((a, b) => a.localeCompare(b)),
    []
  );
  const [selectedStack, setSelectedStack] = useState<string>('All');
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  const filtered =
    selectedStack === 'All' ? projects : projects.filter((project) => project.stacks.includes(selectedStack));
  const totalHours = filtered.reduce((sum, project) => sum + project.hours, 0);

  return (
    <section className="section-card rounded-b-xl border-t-0 px-3 pb-4 pt-0 sm:px-5 sm:pb-5">
      <div className="mx-[-0.75rem] mb-3 flex items-center justify-between bg-gradient-to-r from-sky-900/45 to-indigo-900/35 px-4 py-3 text-xl text-slate-100 sm:mx-[-1.25rem] sm:px-5 sm:text-2xl">
        <h2>Recent Activity</h2>
        <p>{totalHours.toFixed(1)} hours past 2 weeks</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedStack('All')}
          className={`rounded px-3 py-1 text-sm ${
            selectedStack === 'All' ? 'bg-cyan-500/20 text-cyan-100' : 'bg-slate-900/50'
          }`}
        >
          All
        </button>
        {allStacks.map((stack) => (
          <button
            key={stack}
            onClick={() => setSelectedStack(stack)}
            className={`rounded px-3 py-1 text-sm ${
              selectedStack === stack ? 'bg-cyan-500/20 text-cyan-100' : 'bg-slate-900/50'
            }`}
          >
            {stack}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((project) => {
          const plannedFeatureCount = project.progressTotal - project.progressDone;
          const isExpanded = expandedProjectId === project.id;

          return (
            <article key={project.id} className="rounded border border-sky-200/10 bg-black/45 p-3 sm:p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                  <img
                    src={project.banner}
                    alt={`${project.title} banner`}
                    className="h-20 w-36 rounded-sm object-cover sm:h-24 sm:w-56"
                  />
                  <div className="min-w-0">
                    <h3 className="truncate text-3xl text-slate-100">{project.title}</h3>
                    <p className="truncate text-sm text-slate-300/80">{project.summary}</p>
                  </div>
                </div>
                <div className="text-left text-base leading-tight text-slate-300/80 md:text-right">
                  <p>{project.hours} hrs on record</p>
                  <p>last updated on {project.lastUpdated}</p>
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-3 rounded bg-slate-800/65 p-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-1 items-center gap-3 text-xl text-slate-200/95">
                    <p>Project Progress</p>
                    <p className="text-slate-400">
                      {project.progressDone} of {project.progressTotal}
                    </p>
                    <div className="h-6 flex-1 rounded-full border border-black/70 bg-slate-950/80 p-1">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-slate-500 to-slate-300"
                        style={{ width: `${(project.progressDone / project.progressTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedProjectId((prev) => (prev === project.id ? null : project.id))}
                    className="rounded border border-cyan-300/35 bg-cyan-500/10 px-3 py-1.5 text-sm font-semibold text-cyan-100 hover:shadow-glow"
                  >
                    {isExpanded ? 'Hide Details' : 'View Details'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {project.badges.map((badge) => (
                    <div
                      key={badge}
                      className="flex h-12 w-12 items-center justify-center rounded bg-gradient-to-b from-sky-200 to-indigo-500 text-xs font-semibold text-slate-900"
                    >
                      {badge}
                    </div>
                  ))}
                  <div className="flex h-12 items-center justify-center rounded bg-slate-800 px-3 text-2xl font-semibold text-slate-100">
                    +{project.extraCount}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-2 rounded border border-sky-300/15 bg-slate-950/55 p-3">
                  <p className="mb-2 text-sm text-slate-300/90">{project.description}</p>
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mb-3 inline-block rounded border border-sky-300/35 bg-slate-900/70 px-3 py-1.5 text-sm text-cyan-200 hover:text-cyan-100"
                  >
                    View on GitHub
                  </a>
                  <div className="mb-2">
                    <p className="text-xs uppercase tracking-wide text-sky-300/80">Tech Stack</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {project.stacks.map((stack) => (
                        <span
                          key={stack}
                          className="rounded border border-sky-400/25 bg-sky-900/20 px-2 py-0.5 text-xs text-slate-200"
                        >
                          {stack}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-sky-300/80">
                      Planned Features ({plannedFeatureCount})
                    </p>
                    {project.plannedFeatures.length === 0 ? (
                      <p className="mt-1 text-sm text-slate-400">No planned features remaining.</p>
                    ) : (
                      <ul className="mt-1 list-disc pl-5 text-sm text-slate-300/90">
                        {project.plannedFeatures.map((feature) => (
                          <li key={feature}>{feature}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
