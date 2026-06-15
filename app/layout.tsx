import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Kargoa Admin Dashboard',
  description:
    'Admin dashboard for the KmerCargo platform: manage driver ' +
    'onboarding, fleet verification, financial ledgers, and disputes.',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
