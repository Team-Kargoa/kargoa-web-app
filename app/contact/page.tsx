// Placeholder page. There is no support desk or contact form built yet —
// this exists only so the footer's link resolves instead of hitting
// Next.js's raw 404. The email below is real (api_spec.yaml's
// info.contact.email); replace the rest of this file with finished
// contact copy before launch.
import Link from 'next/link';

const SUPPORT_EMAIL = 'engineering@kmercargo.cm';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-surface pt-32 pb-24 px-4 md:px-8 md:pt-36">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-heading text-3xl md:text-5xl font-bold text-text-primary mb-4">
          Contact Support
        </h1>
        <p className="font-sans text-text-secondary mb-2">
          A dedicated support page is not yet published. Until then, reach the
          team at{' '}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-primary hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>
          .
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
