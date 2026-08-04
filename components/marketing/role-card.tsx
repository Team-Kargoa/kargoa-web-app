import Link from 'next/link';
import { ArrowRight, type LucideIcon } from 'lucide-react';

export type RoleCardProps = {
  eyebrow: string;
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  tone: 'light' | 'amber';
};

export function RoleCard({
  eyebrow,
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaHref,
  tone,
}: RoleCardProps) {
  const isAmber = tone === 'amber';

  return (
    <div
      className={
        isAmber
          ? 'bg-primary-container rounded-xl p-6 shadow-sm'
          : 'bg-white rounded-xl p-6 border border-border shadow-sm'
      }
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className={
            isAmber
              ? 'w-12 h-12 bg-on-primary-container/10 rounded-lg flex items-center justify-center'
              : 'w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center'
          }
        >
          <Icon
            aria-hidden="true"
            className={isAmber ? 'text-on-primary-container' : 'text-primary'}
          />
        </div>
        <span
          className={
            isAmber
              ? 'font-mono text-xs font-bold tracking-wide text-on-primary-container/80'
              : 'font-mono text-xs font-bold tracking-wide text-text-secondary'
          }
        >
          {eyebrow}
        </span>
      </div>
      <h3
        className={
          isAmber
            ? 'font-heading text-xl font-semibold text-on-primary-container mb-2'
            : 'font-heading text-xl font-semibold text-text-primary mb-2'
        }
      >
        {title}
      </h3>
      <p
        className={
          isAmber
            ? 'font-sans text-sm text-on-primary-container/90 mb-6'
            : 'font-sans text-sm text-text-secondary mb-6'
        }
      >
        {description}
      </p>
      <Link
        href={ctaHref}
        className={
          isAmber
            ? 'w-full h-14 bg-on-primary-container text-primary-container font-sans font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform'
            : 'w-full h-14 bg-bg-dark text-white font-sans font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform'
        }
      >
        {ctaLabel}
        <ArrowRight aria-hidden="true" className="h-5 w-5" />
      </Link>
    </div>
  );
}
