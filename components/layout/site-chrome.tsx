'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';

// Routes that render their own dedicated header (or none, by design) and
// so must not also receive the marketing pill navbar.
const CHROMELESS_ROUTES = ['/admin', '/signin', '/register/fleet', '/verify'];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (CHROMELESS_ROUTES.some((route) => pathname.startsWith(route))) {
    return <>{children}</>;
  }
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
