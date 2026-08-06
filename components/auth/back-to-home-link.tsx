import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/**
 * Arrow-back control shown on every auth screen (signin, fleet
 * registration, verify) so a user mid-flow can always return to the
 * marketing landing page. A real `next/link` `<Link>`, not an imperative
 * `router.push`, so it is a genuine, middle-click-able navigation and its
 * `href` can be asserted in tests.
 */
export function BackToHomeLink() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 rounded-full px-2 py-1 font-sans text-sm text-text-secondary hover:bg-surface-container hover:text-text-primary transition-all active:scale-95"
    >
      <ArrowLeft aria-hidden="true" className="h-5 w-5" />
      <span>Back to home</span>
    </Link>
  );
}
