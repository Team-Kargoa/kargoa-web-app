'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import type { UserSummary } from '@/lib/api/types';

// Routes that render their own dedicated header (or none, by design) and
// so must not also receive the marketing pill navbar.
const CHROMELESS_ROUTES = [
  '/admin',
  '/signin',
  '/register/fleet',
  '/verify',
  '/fleet',
];

export type SiteChromeProps = {
  children: React.ReactNode;
  /**
   * The signed-in user, resolved server-side (see lib/current-user.ts)
   * and passed down from app/layout.tsx, a Server Component — this
   * Client Component cannot read the httpOnly session cookie itself.
   */
  user: UserSummary | null;
};

export function SiteChrome({ children, user }: SiteChromeProps) {
  const pathname = usePathname();
  if (CHROMELESS_ROUTES.some((route) => pathname.startsWith(route))) {
    return <>{children}</>;
  }
  return (
    <>
      <Navbar user={user} />
      {children}
    </>
  );
}
