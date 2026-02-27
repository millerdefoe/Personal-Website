import { RecentActivitySection } from '../components/RecentActivitySection';

export function HomePage() {
  return (
    <section className="space-y-6">
      <div className="section-card relative overflow-hidden rounded-xl p-6">
        <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-cyan-400/10 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start">
          <img
            src="/profile-photo.svg"
            alt="Portrait photo"
            className="h-44 w-32 rounded border border-sky-200/20 object-cover sm:h-52 sm:w-40"
          />
          <div>
            <p className="badge mb-3 inline-block rounded px-2 py-1 text-xs">Available for SWE roles</p>
            <h1 className="font-display text-3xl text-cyan-100 sm:text-4xl">Engineering Portfolio</h1>
            <p className="mt-3 max-w-2xl text-lg text-sky-100/85">
              I build production-focused web products with React, TypeScript, and AWS serverless services.
              This site includes public project showcases and a secure private productivity space.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="section-card rounded-xl p-5">
          <h2 className="font-display text-xl text-cyan-100">Now Building</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sky-100/85">
            <li>Interactive project case studies with architecture notes and outcomes.</li>
            <li>Automated CI/CD for zero-downtime portfolio updates.</li>
            <li>Performance optimization and strong accessibility for recruiter-friendly UX.</li>
          </ul>
        </div>
        <div className="section-card rounded-xl p-5">
          <h2 className="font-display text-xl text-cyan-100">Strengths</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-sky-100/85">
            <li>React + TypeScript</li>
            <li>AWS Serverless</li>
            <li>API Design</li>
            <li>Cloud Security</li>
            <li>Data Modeling</li>
            <li>Performance</li>
          </ul>
        </div>
      </div>

      <RecentActivitySection />
    </section>
  );
}
