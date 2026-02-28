import { useEffect, useMemo, useState } from 'react';
import { projects } from '../data/projects';
import type { Project } from '../types';

const DEFAULT_CSV_URL = '/data/projects.csv';

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === ',') {
      row.push(cell.trim());
      cell = '';
      continue;
    }

    if (!inQuotes && (char === '\n' || char === '\r')) {
      if (char === '\r' && next === '\n') {
        index += 1;
      }
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    rows.push(row);
  }

  return rows.filter((csvRow) => csvRow.length > 1 || csvRow[0] !== '');
}

function splitList(value: string): string[] {
  if (!value) return [];
  return value
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
}

function toNumber(value: string, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function mapCsvToProjects(csvText: string): Project[] {
  const rows = parseCsv(csvText);
  if (rows.length < 2) return [];

  const [headers, ...dataRows] = rows;
  const headerIndex = new Map(headers.map((header, index) => [header, index]));

  const get = (row: string[], key: string) => {
    const idx = headerIndex.get(key);
    return idx === undefined ? '' : (row[idx] ?? '').trim();
  };

  return dataRows
    .map((row) => ({
      id: get(row, 'id'),
      title: get(row, 'title'),
      summary: get(row, 'summary'),
      description: get(row, 'description'),
      stacks: splitList(get(row, 'stacks')),
      githubUrl: get(row, 'githubUrl'),
      liveUrl: get(row, 'liveUrl') || undefined,
      banner: get(row, 'banner'),
      hours: toNumber(get(row, 'hours')),
      lastUpdated: get(row, 'lastUpdated'),
      progressDone: toNumber(get(row, 'progressDone')),
      progressTotal: toNumber(get(row, 'progressTotal')),
      badges: splitList(get(row, 'badges')),
      extraCount: toNumber(get(row, 'extraCount')),
      plannedFeatures: splitList(get(row, 'plannedFeatures'))
    }))
    .filter((project) => project.id && project.title && project.summary);
}

export function RecentActivitySection() {
  const [projectList, setProjectList] = useState<Project[]>(projects);
  const allStacks = useMemo(
    () => Array.from(new Set(projectList.flatMap((p) => p.stacks))).sort((a, b) => a.localeCompare(b)),
    [projectList]
  );
  const [selectedStack, setSelectedStack] = useState<string>('All');
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const csvUrl = import.meta.env.VITE_PROJECTS_CSV_URL || DEFAULT_CSV_URL;

    async function loadProjects() {
      try {
        const response = await fetch(csvUrl, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Failed to fetch CSV (${response.status})`);
        }
        const csvText = await response.text();
        const parsedProjects = mapCsvToProjects(csvText);

        if (isMounted && parsedProjects.length > 0) {
          setProjectList(parsedProjects);
        }
      } catch (error) {
        console.warn('Failed to load projects CSV, using static fallback data.', error);
      }
    }

    loadProjects();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered =
    selectedStack === 'All'
      ? projectList
      : projectList.filter((project) => project.stacks.includes(selectedStack));
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
          const plannedFeatureCount = Math.max(project.progressTotal - project.progressDone, 0);
          const isExpanded = expandedProjectId === project.id;
          const progressPercent = project.progressTotal > 0 ? (project.progressDone / project.progressTotal) * 100 : 0;

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
                        style={{ width: `${progressPercent}%` }}
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
