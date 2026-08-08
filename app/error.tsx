'use client';

import Link from 'next/link';
import { TriangleAlert } from 'lucide-react';
import { BrandLink } from '@/components/brand-link';

/**
 * Next's root error boundary — must be a Client Component per Next's
 * contract, receiving { error, reset }. Catches whatever an admin or
 * fleet page lets propagate (e.g. app/admin/drivers/page.tsx and
 * app/admin/settings/page.tsx both let ApiError bubble on a 401/403/500)
 * instead of showing Next's raw error screen.
 *
 * Deliberately never renders `error.message`, `error.digest` or any other
 * error internals — those can carry raw API error text the user has no
 * use for and shouldn't see.
 */
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface px-4 text-center">
      <BrandLink size="md" />
      <TriangleAlert aria-hidden="true" className="h-12 w-12 text-primary" />
      <div>
        <h1 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
          Something went wrong
        </h1>
        <p className="mt-2 max-w-md font-sans text-text-secondary">
          An unexpected error occurred. Try again, or head back to the home
          page.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-primary px-5 py-2.5 font-sans text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-xl border border-border px-5 py-2.5 font-sans text-sm font-medium text-text-primary transition hover:bg-muted"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
