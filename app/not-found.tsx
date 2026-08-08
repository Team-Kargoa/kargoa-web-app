import Link from 'next/link';
import { Compass } from 'lucide-react';
import { BrandLink } from '@/components/brand-link';

/**
 * Next's not-found boundary: rendered whenever notFound() is called (e.g.
 * app/admin/drivers/[id]/page.tsx for a missing driver application) or a
 * route simply doesn't exist. Kept deliberately simple and on-brand —
 * design tokens only, one link back to the app's entry point.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface px-4 text-center">
      <BrandLink size="md" />
      <Compass aria-hidden="true" className="h-12 w-12 text-primary" />
      <div>
        <h1 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
          Page not found
        </h1>
        <p className="mt-2 max-w-md font-sans text-text-secondary">
          We couldn’t find the page you’re looking for. It may have moved or the
          link may be incorrect.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-xl bg-primary px-5 py-2.5 font-sans text-sm font-medium text-primary-foreground transition hover:opacity-90"
      >
        Back to home
      </Link>
    </main>
  );
}
