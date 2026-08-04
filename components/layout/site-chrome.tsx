'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return <>{children}</>;
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
