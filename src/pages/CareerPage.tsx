const milestones = [
  {
    period: '2026',
    title: 'Portfolio + Interview Preparation',
    details:
      'Built a Steam-style personal portfolio and prepared project narratives focused on architecture decisions and delivery impact.'
  },
  {
    period: '2025',
    title: 'PPoDD',
    details:
      'Developed and iterated on PPoDD with a focus on reliable frontend behavior and clean repository structure for collaboration.',
    link: 'https://github.com/millerdefoe/PPoDD'
  },
  {
    period: '2025',
    title: 'Where To WebApp Final',
    details:
      'Delivered a full-stack web app with practical UI/UX choices and modular implementation patterns.',
    link: 'https://github.com/millerdefoe/Where-To-WebApp-Final'
  },
  {
    period: '2024',
    title: 'BorrowBuddy',
    details:
      'Built BorrowBuddy to solve real coordination problems and strengthen product-thinking plus engineering execution.',
    link: 'https://github.com/millerdefoe/BorrowBuddy'
  }
];

export function CareerPage() {
  return (
    <section className="section-card rounded-xl p-5">
      <h1 className="text-3xl text-cyan-100">Career Timeline</h1>
      <p className="mt-2 text-sky-100/85">
        Snapshot of my engineering journey, projects, and growth trajectory.
      </p>

      <div className="mt-5 space-y-4 border-l border-sky-300/30 pl-5">
        {milestones.map((item) => (
          <article key={`${item.period}-${item.title}`} className="relative rounded border border-sky-200/10 bg-black/35 p-4">
            <span className="absolute -left-[1.62rem] top-5 h-3 w-3 rounded-full bg-cyan-300" />
            <p className="text-xs uppercase tracking-wider text-sky-300">{item.period}</p>
            <h2 className="text-2xl text-slate-100">{item.title}</h2>
            <p className="mt-1 text-slate-300/90">{item.details}</p>
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm text-cyan-200 hover:text-cyan-100"
              >
                View project repository
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
