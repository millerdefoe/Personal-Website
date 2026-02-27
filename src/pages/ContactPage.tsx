export function ContactPage() {
  return (
    <section className="space-y-4">
      <div className="section-card rounded-xl p-5">
        <h1 className="font-display text-2xl text-cyan-100">Contact</h1>
        <p className="mt-2 text-sky-100/85">
          For interviews and opportunities, reach out directly using the channels below.
        </p>
        <ul className="mt-4 space-y-2 text-sky-100/90">
          <li>Email: <a className="text-cyan-200" href="mailto:you@example.com">you@example.com</a></li>
          <li>GitHub: <a className="text-cyan-200" href="https://github.com/your-username">github.com/your-username</a></li>
          <li>LinkedIn: <a className="text-cyan-200" href="https://linkedin.com/in/your-profile">linkedin.com/in/your-profile</a></li>
        </ul>
      </div>

      <div className="section-card rounded-xl p-5">
        <h2 className="font-display text-xl text-cyan-100">Contact Form (Optional Integration)</h2>
        <p className="text-sky-100/85">
          Wire this to AWS SES via API Gateway + Lambda or a third-party endpoint (Formspree/Resend) for email delivery.
        </p>
      </div>
    </section>
  );
}
