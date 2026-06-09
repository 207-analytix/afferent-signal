'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${active
        ? 'bg-teal-700 text-white shadow-sm'
        : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'}`}
    >
      {label}
    </Link>
  );
}

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const { authed, logout } = useAuth();
  const pathname = usePathname();
  const loginPage = pathname === '/login';

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-[var(--bg)]/90 backdrop-blur dark:border-stone-800/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-700 dark:text-teal-300">Afferent Signal</p>
            <p className="text-sm text-stone-500">Retail intent command surface</p>
          </div>
          {!loginPage && authed && (
            <div className="flex items-center gap-2">
              <nav className="hidden gap-2 md:flex">
                <NavLink href="/" label="Matrix" />
                <NavLink href="/triage" label="Triage" />
                <NavLink href="/analytics" label="Analytics" />
              </nav>
              <button
                onClick={logout}
                className="rounded-2xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6">{children}</main>
    </div>
  );
}
