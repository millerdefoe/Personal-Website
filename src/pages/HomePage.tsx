import { RecentActivitySection } from '../components/RecentActivitySection';
import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <section>
      <div className="section-card overflow-hidden rounded-xl p-4 sm:p-6">
        <div className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative">
                <img
                  src="/profile-photo.JPG"
                  alt="Portrait photo"
                  className="h-40 w-40 rounded-sm border border-cyan-300/45 object-cover shadow-[0_0_25px_rgba(43,209,255,0.35)] sm:h-64 sm:w-64"
                />
              </div>
              <div className="pt-1">
                <h1 className="text-2xl text-slate-100 sm:text-4xl">Spyridon Giakoumatos</h1>
                <p className="mt-2 text-base text-slate-300/90 sm:text-xl">AI Engineer • NTU CS (AI)</p>
                <p className="mt-4 max-w-2xl text-base text-slate-200/85">
                  Building practical AI and full-stack systems with strong product focus, measurable outcomes, and
                  clean engineering execution.
                </p>
              </div>
            </div>

            <aside className="w-full p-1 lg:max-w-sm">
              <div className="flex items-center gap-3">
                <p className="text-xl text-slate-100 sm:text-2xl">Level</p>
                <span className="rounded-full border-2 border-amber-400 px-2 py-0.5 text-lg text-slate-100 sm:text-xl">24</span>
              </div>
              <div className="mt-3 flex items-center gap-3 rounded bg-black/35 p-3">
                <img
                  src="/years-of-service-4.png"
                  alt="4 years of service"
                  className="h-14 w-14 shrink-0 rounded object-cover sm:h-16 sm:w-16"
                />
                <div>
                  <p className="text-base text-slate-200 sm:text-lg">Years of Service</p>
                  <p className="text-lg text-slate-100 sm:text-xl">750 XP</p>
                </div>
              </div>
              <Link
                to="/career"
                className="mt-3 inline-block rounded bg-slate-700/80 px-4 py-2 text-sm text-slate-100 hover:bg-slate-600/80"
              >
                View Career
              </Link>
            </aside>
          </div>

          <div className="rounded border border-sky-300/20 bg-slate-900/45">
            <div className="bg-gradient-to-r from-sky-800/45 to-indigo-900/35 px-4 py-2 text-xl text-slate-100">
              Journey Snapshot
            </div>
            <div className="grid gap-4 px-4 py-4 sm:grid-cols-3">
              <div>
                <p className="text-3xl text-slate-100 sm:text-4xl">12+</p>
                <p className="text-base text-slate-300/80">Projects Built</p>
              </div>
              <div>
                <p className="text-3xl text-slate-100 sm:text-4xl">3</p>
                <p className="text-base text-slate-300/80">Core Domains</p>
              </div>
              <div>
                <p className="text-3xl text-slate-100 sm:text-4xl">2027</p>
                <p className="text-base text-slate-300/80">Graduation Track</p>
              </div>
            </div>
          </div>

          <RecentActivitySection embedded />
        </div>
      </div>
    </section>
  );
}
