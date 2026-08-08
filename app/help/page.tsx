// Placeholder page. Help documentation has not been written by the team
// yet — this exists only so the navbar's link resolves instead of hitting
// Next.js's raw 404. Replace this file's contents with finished help
// documentation before launch.
import Link from 'next/link';

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-surface pt-32 pb-24 px-4 md:px-8 md:pt-36">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-heading text-3xl md:text-5xl font-bold text-text-primary mb-4">
          Help
        </h1>
        <p className="font-sans text-text-secondary mb-2">
          Help documentation is not yet published. It will appear here before
          launch.
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
