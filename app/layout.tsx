import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import Footer from './components/Footer';
import Navbar from './components/Navbar';

export const metadata: Metadata = {
  title: 'Kargoa Admin Dashboard',
  description:
    'Admin dashboard for the KmerCargo platform: manage driver onboarding, fleet verification, financial ledgers, and disputes.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
