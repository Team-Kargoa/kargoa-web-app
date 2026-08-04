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

const TONE_CLASSES: Record<
  RoleCardProps['tone'],
  {
    card: string;
    iconWrap: string;
    icon: string;
    eyebrow: string;
    title: string;
    description: string;
    cta: string;
  }
> = {
  light: {
    card: 'bg-white rounded-xl p-6 border border-border shadow-sm',
    iconWrap:
      'w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center',
    icon: 'text-primary',
    eyebrow: 'font-mono text-xs font-bold tracking-wide text-text-secondary',
    title: 'font-heading text-xl font-semibold text-text-primary mb-2',
    description: 'font-sans text-sm text-text-secondary mb-6',
    cta: 'w-full h-14 bg-bg-dark text-white font-sans font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform',
  },
  amber: {
    card: 'bg-primary-container rounded-xl p-6 shadow-sm',
    iconWrap:
      'w-12 h-12 bg-on-primary-container/10 rounded-lg flex items-center justify-center',
    icon: 'text-on-primary-container',
    eyebrow:
      'font-mono text-xs font-bold tracking-wide text-on-primary-container/80',
    title: 'font-heading text-xl font-semibold text-on-primary-container mb-2',
    description: 'font-sans text-sm text-on-primary-container/90 mb-6',
    cta: 'w-full h-14 bg-on-primary-container text-primary-container font-sans font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform',
  },
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
  const classes = TONE_CLASSES[tone];

  return (
    <div className={classes.card}>
      <div className="flex justify-between items-start mb-4">
        <div className={classes.iconWrap}>
          <Icon aria-hidden="true" className={classes.icon} />
        </div>
        <span className={classes.eyebrow}>{eyebrow}</span>
      </div>
      <h3 className={classes.title}>{title}</h3>
      <p className={classes.description}>{description}</p>
      <Link href={ctaHref} className={classes.cta}>
        {ctaLabel}
        <ArrowRight aria-hidden="true" className="h-5 w-5" />
      </Link>
    </div>
  );
}
