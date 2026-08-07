'use client';

import Link from 'next/link';
import { Truck } from 'lucide-react';
import type { UserSummary } from '@/lib/api/types';
import { formatPhone, getInitials } from '@/lib/format';

const NAV_LINKS = [
  { label: 'Registration', href: '/register' },
  { label: 'Support', href: '/support' },
  { label: 'Help', href: '/help' },
];

export type NavbarProps = {
  /**
   * The signed-in fleet owner or admin, or null if signed out (including
   * when the session cookie is missing, expired, or belongs to a role
   * with no dashboard here). Resolved server-side in app/layout.tsx via
   * lib/current-user.ts and threaded down through SiteChrome, since this
   * Client Component cannot read the httpOnly session cookie itself.
   */
  user: UserSummary | null;
};

export default function Navbar({ user }: NavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between rounded-full border border-gray-200 bg-surface/80 backdrop-blur-md px-6 py-3 shadow-sm">
          <Link href="/" className="flex items-center gap-2">
            <Truck className="h-6 w-6" aria-hidden="true" />
            <span className="text-2xl font-black tracking-tight font-heading">
              KmerCargo
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-medium text-gray-700 hover:text-black transition"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <DashboardLink user={user} />
            ) : (
              <Link
                href="/register"
                className="px-5 py-2 text-sm font-medium bg-primary-container text-on-primary-container rounded-xl hover:opacity-90 transition"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function DashboardLink({ user }: { user: UserSummary }) {
  const trimmedName = user.full_name.trim();
  const displayName = trimmedName || formatPhone(user.phone_number);
  const initials = trimmedName
    ? getInitials(trimmedName)
    : user.phone_number.replace(/\D/g, '').slice(-2);
  const href = user.role === 'admin' ? '/admin' : '/fleet';

  return (
    <Link
      href={href}
      aria-label={`${displayName} — Dashboard`}
      className="flex items-center gap-2 pl-1 pr-4 py-1 text-sm font-medium bg-primary-container text-on-primary-container rounded-xl hover:opacity-90 transition"
    >
      <span
        aria-hidden="true"
        className="w-8 h-8 rounded-full bg-surface text-on-primary-container flex items-center justify-center text-xs font-bold"
      >
        {initials}
      </span>
      <span className={trimmedName ? undefined : 'font-mono'}>
        {displayName}
      </span>
    </Link>
  );
}
