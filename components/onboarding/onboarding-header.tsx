'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export type OnboardingHeaderProps = {
  /** Right-aligned tracking label, e.g. "FLEET_ONBOARDING" (vehicle step only). */
  trackingLabel?: string;
};

export function OnboardingHeader({ trackingLabel }: OnboardingHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex items-center px-4 h-14 w-full z-50 bg-bg-dark border-b border-border-dark fixed top-0">
      <button
        type="button"
        aria-label="Go back"
        onClick={() => router.back()}
        className="mr-4 text-primary-container active:scale-95 transition-transform"
      >
        <ArrowLeft aria-hidden="true" className="h-5 w-5" />
      </button>
      <h1 className="font-heading text-xl font-bold text-primary-container">
        KmerCargo
      </h1>
      {trackingLabel && (
        <span className="ml-auto font-mono text-xs text-text-secondary tracking-widest">
          {trackingLabel}
        </span>
      )}
    </header>
  );
}
