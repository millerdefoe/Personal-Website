const milestones = [
  {
    period: 'Future',
    title: 'Your Intern',
    company: 'Your Company',
    details:
      'Maximising Shareholder Value for your company.'
  },
  {
    period: '2026',
    title: 'Data Scientist Intern',
    company: 'Monetary Authority of Singapore (MAS)',
    details:
      'Designed and deployed LangChain RAG pipelines and a DASH platform for MAS workflows; improved answer correctness and vector storage efficiency.'
  },
  {
    period: '2025',
    title: 'Artificial Intelligence Engineer Intern',
    company: 'Home Team Science and Technology Agency (HTX)',
    details:
      'Delivered multi-modal AI for traffic-violation detection (82% precision, 85% recall) and Gen-AI detection pipelines; built Flask backend and REST APIs for enforcement teams.'
  },
  {
    period: '2025',
    title: 'Student AI Researcher',
    company: 'Nanyang Technological University (NTU)',
    details:
      'Designed PyTorch dataset distillation framework; first-author peer-reviewed paper at ICUR 2025.'
  }
];

export function CareerPage() {
  return (
    <section className="section-card rounded-xl p-5">
      <h1 className="text-3xl text-cyan-100">Career Timeline</h1>
      <p className="mt-2 text-sky-100/85">
        Where I've worked and what I've done.
      </p>

      <div className="mt-5 space-y-4 border-l border-sky-300/30 pl-5">
        {milestones.map((item) => (
          <article key={`${item.period}-${item.title}`} className="relative rounded border border-sky-200/10 bg-black/35 p-4">
            <span className="absolute -left-[1.62rem] top-5 h-3 w-3 rounded-full bg-cyan-300" />
            <p className="text-xs uppercase tracking-wider text-sky-300">{item.period}</p>
            <h2 className="text-2xl text-slate-100">{item.title}</h2>
            <p className="mt-0.5 text-slate-300/90">{item.company}</p>
            <p className="mt-1 text-slate-300/90">{item.details}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
