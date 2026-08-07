import Link from 'next/link';
import { Truck } from 'lucide-react';

export type BrandLinkSize = 'sm' | 'md' | 'lg';

export type BrandLinkProps = {
  /**
   * Which of the three closed size presets to use. Each preset sets the
   * icon dimensions and the wordmark type scale together, so a screen
   * can never end up with an icon and a wordmark from two different
   * scales. Defaults to 'md' — components/Navbar.tsx's original
   * treatment, the reference this component was extracted from.
   */
  size?: BrandLinkSize;
  /**
   * Extra classes merged onto the wrapping link — color, hover
   * treatment, or this header's own spacing/height. Never use this to
   * resize the icon or wordmark; use `size` for that, so every screen
   * stays on one of the three closed presets instead of a hand-tuned
   * one-off that can silently drift (as the pre-extraction copies did).
   */
  className?: string;
};

const SIZES: Record<BrandLinkSize, { icon: string; text: string }> = {
  // Fleet sidebar (desktop + mobile header) and the admin sidebar's
  // compact h-9 row.
  sm: {
    icon: 'h-5 w-5',
    text: 'text-xl font-black tracking-tight font-heading',
  },
  // components/Navbar.tsx's original, unchanged treatment.
  md: {
    icon: 'h-6 w-6',
    text: 'text-2xl font-black tracking-tight font-heading',
  },
  // register/fleet and verify's original header: a bigger, more
  // prominent icon paired with a smaller, tighter wordmark — deliberate
  // for those compact top bars, not a mistake in the scale.
  lg: {
    icon: 'h-7 w-7',
    text: 'text-lg font-bold tracking-tight font-heading',
  },
};

/**
 * The KmerCargo brand: a Truck icon (decorative) beside the visible
 * wordmark, linking back to the landing page. This is the one place
 * that lockup is defined — every screen (the marketing navbar, the
 * fleet registration and verify headers, the fleet sidebar, and the
 * admin sidebar) renders this component rather than its own copy.
 */
export function BrandLink({ size = 'md', className }: BrandLinkProps) {
  const { icon, text } = SIZES[size];
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 ${className ?? ''}`.trim()}
    >
      <Truck className={icon} aria-hidden="true" />
      <span className={text}>KmerCargo</span>
    </Link>
  );
}
