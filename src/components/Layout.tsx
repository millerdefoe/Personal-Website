import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'HOME' },
  { to: '/career', label: 'CAREER' },
  { to: '/contact', label: 'CONTACT ME' }
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-slate-100">
      <header className="steam-topbar">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-8">
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-4 sm:gap-6">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `pb-1 text-base font-semibold tracking-wide transition ${
                      isActive
                        ? 'border-b-2 border-cyan-400 text-cyan-300'
                        : 'text-slate-200/85 hover:text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-4 w-full max-w-6xl px-4 pb-8 sm:px-8">{children}</main>

      <footer className="mx-auto mt-8 w-full max-w-6xl border-t border-sky-300/20 px-4 py-5 text-sm text-sky-200/70 sm:px-8">
        Built with React + AWS. Public portfolio for recruiters, private workspace for execution.
      </footer>
    </div>
  );
}
