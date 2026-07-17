'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between rounded-full border border-gray-200 bg-white/80 backdrop-blur-md px-6 py-3 shadow-sm">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight">KARGOA</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-gray-700 hover:text-black transition"
            >
              How It Works
            </Link>

            <Link
              href="#features"
              className="text-sm font-medium text-gray-700 hover:text-black transition"
            >
              Features
            </Link>

            <Link
              href="#drivers"
              className="text-sm font-medium text-gray-700 hover:text-black transition"
            >
              Drivers
            </Link>

            <Link
              href="#faq"
              className="text-sm font-medium text-gray-700 hover:text-black transition"
            >
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <button className="px-5 py-2 text-sm font-medium bg-black text-white rounded-full hover:opacity-90 transition">
              Download App
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
