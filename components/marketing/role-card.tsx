import Link from 'next/link';
import { ArrowRight, CircleCheck, type LucideIcon } from 'lucide-react';

export type RoleCardProps = {
  eyebrow: string;
  icon: LucideIcon;
  title: string;
  description: string;
  /** Optional short benefit labels, each paired with a check icon. */
  benefits?: string[];
  ctaLabel: string;
  ctaHref: string;
  tone: 'light' | 'amber' | 'primary' | 'secondary';
};

type ToneClasses = {
  card: string;
  iconWrap: string;
  icon: string;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  benefitIcon: string;
};

/**
 * Shared card/eyebrow/title/description treatment for every tone that
 * renders a neutral (white) card with a coloured icon-wrap accent —
 * everything except `amber`, whose whole card is tinted.
 */
const NEUTRAL_CARD_BASE = {
  card: 'bg-white rounded-xl p-6 md:p-8 border border-border shadow-sm',
  eyebrow: 'font-mono text-xs font-bold tracking-wide text-text-secondary',
  title: 'font-heading text-xl font-semibold text-text-primary mb-2',
  description: 'font-sans text-sm text-text-secondary mb-7',
};

const TONE_CLASSES: Record<RoleCardProps['tone'], ToneClasses> = {
  light: {
    ...NEUTRAL_CARD_BASE,
    iconWrap:
      'w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center',
    icon: 'text-primary',
    cta: 'w-full h-14 bg-bg-dark text-white font-sans font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform',
    benefitIcon: 'text-success-momo',
  },
  amber: {
    card: 'bg-primary-container rounded-xl p-6 md:p-8 shadow-sm',
    iconWrap:
      'w-12 h-12 bg-on-primary-container/10 rounded-lg flex items-center justify-center',
    icon: 'text-on-primary-container',
    eyebrow:
      'font-mono text-xs font-bold tracking-wide text-on-primary-container/80',
    title: 'font-heading text-xl font-semibold text-on-primary-container mb-2',
    description: 'font-sans text-sm text-on-primary-container/90 mb-7',
    cta: 'w-full h-14 bg-on-primary-container text-primary-container font-sans font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform',
    benefitIcon: 'text-on-primary-container',
  },
  primary: {
    ...NEUTRAL_CARD_BASE,
    iconWrap:
      'w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center',
    icon: 'text-on-primary-container',
    cta: 'w-full h-14 bg-primary text-primary-foreground font-sans font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform',
    benefitIcon: 'text-success-momo',
  },
  secondary: {
    ...NEUTRAL_CARD_BASE,
    iconWrap:
      'w-12 h-12 bg-secondary-container rounded-lg flex items-center justify-center',
    icon: 'text-secondary-container-foreground',
    cta: 'w-full h-14 bg-secondary text-secondary-foreground font-sans font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform',
    benefitIcon: 'text-secondary',
  },
};

export function RoleCard({
  eyebrow,
  icon: Icon,
  title,
  description,
  benefits,
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
      {benefits && benefits.length > 0 && (
        <ul className="space-y-3 mb-7">
          {benefits.map((benefit) => (
            <li
              key={benefit}
              className="flex items-center gap-2 text-sm text-text-primary"
            >
              <CircleCheck
                aria-hidden="true"
                className={`h-4 w-4 shrink-0 ${classes.benefitIcon}`}
              />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      )}
      <Link href={ctaHref} className={classes.cta}>
        {ctaLabel}
        <ArrowRight aria-hidden="true" className="h-5 w-5" />
      </Link>
    </div>
  );
}
