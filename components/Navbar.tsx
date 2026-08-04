'use client';

import Link from 'next/link';
import { Truck } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Registration', href: '/register' },
  { label: 'Support', href: '/support' },
  { label: 'Help', href: '/help' },
];

export default function Navbar() {
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
            <Link
              href="/register"
              className="px-5 py-2 text-sm font-medium bg-primary-container text-on-primary-container rounded-xl hover:opacity-90 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
