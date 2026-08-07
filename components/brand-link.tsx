import Link from 'next/link';
import { Truck } from 'lucide-react';

export type BrandLinkProps = {
  /**
   * Extra classes merged onto the wrapping link — color, hover
   * treatment, or spacing/height for this screen's header. The
   * icon-plus-wordmark structure and its size are fixed here so every
   * screen uses the same lockup instead of a hand-copied one that can
   * drift (as the "FLEET LOGISTICS" and admin-sidebar "K" badge cases
   * did before this component existed).
   */
  className?: string;
};

/**
 * The KmerCargo brand: a Truck icon (decorative) beside the visible
 * wordmark, linking back to the landing page. This is the one place
 * that lockup is defined — every screen (the marketing navbar, the
 * fleet registration and verify headers, the fleet sidebar, and the
 * admin sidebar) renders this component rather than its own copy.
 */
export function BrandLink({ className }: BrandLinkProps) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 ${className ?? ''}`.trim()}
    >
      <Truck className="h-6 w-6" aria-hidden="true" />
      <span className="text-2xl font-black tracking-tight font-heading">
        KmerCargo
      </span>
    </Link>
  );
}
