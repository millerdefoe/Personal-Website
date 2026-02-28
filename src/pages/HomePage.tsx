import { RecentActivitySection } from '../components/RecentActivitySection';

export function HomePage() {
  return (
    <section className="space-y-6">
      <div className="section-card relative overflow-hidden rounded-xl p-6">
        <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-cyan-400/10 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start">
          <img
            src="/profile-photo.JPG"
            alt="Portrait photo"
            className="h-44 w-32 rounded border border-sky-200/20 object-cover sm:h-52 sm:w-40"
          />
          <div>
            <p className="badge mb-3 inline-block rounded px-2 py-1 text-xs">Available for Internships</p>
            <h1 className="font-display text-3xl text-cyan-100 sm:text-4xl">Spyridon Giakoumatos</h1>
            <p className="mt-3 max-w-2xl text-lg text-sky-100/85">
              I'm a computer science student at Nanyang Technological University (NTU), 
              specializing in artificial intelligence. I am an avid gamer as you can tell from my Steam inspired portfolio!
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="section-card rounded-xl p-5">
          <h2 className="font-display text-xl text-cyan-100">Now Building</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sky-100/85">
            <li>End to end AI pipeline for software development.</li>
          </ul>
        </div>
        <div className="section-card rounded-xl p-5">
          <h2 className="font-display text-xl text-cyan-100">Strengths</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-sky-100/85">
            <li>AI Engineering</li>
            <li>Data Science</li>
            <li>Software Development</li>
            <li>Machine Learning</li>
            <li>Web Development</li>
          </ul>
        </div>
      </div>

      <RecentActivitySection />
    </section>
  );
}
