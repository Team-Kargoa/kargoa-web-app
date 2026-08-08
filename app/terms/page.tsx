// Placeholder page. The real Terms of Service copy has not been drafted
// by the team yet — this exists only so the footer's link resolves
// instead of hitting Next.js's raw 404. Replace this file's contents
// with the finished legal copy before launch.
import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-surface pt-32 pb-24 px-4 md:px-8 md:pt-36">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-heading text-3xl md:text-5xl font-bold text-text-primary mb-4">
          Terms of Service
        </h1>
        <p className="font-sans text-text-secondary mb-2">
          This document is not yet published. Our finished Terms of Service will
          appear here before launch.
        </p>
        <Link
          href="/"
          className="font-sans text-sm text-primary hover:underline"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
