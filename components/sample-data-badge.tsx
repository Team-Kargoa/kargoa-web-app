import { Info } from 'lucide-react';

/**
 * Understated pill shown next to a section heading whenever that section is
 * currently rendering fixture data because the real endpoint has no data
 * yet (missing, erroring, or returning empty) — see lib/api/with-fallback.ts.
 * Genuinely visible text, not a tooltip: sample numbers presented as real
 * are dangerous on approval and financial screens.
 */
export function SampleDataBadge({ className = '' }: { className?: string }) {
  return (
    <span
      data-testid="sample-data-badge"
      className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground ${className}`}
    >
      <Info aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
      <span className="font-semibold">Sample data</span>
      <span>— no backend data yet</span>
    </span>
  );
}
