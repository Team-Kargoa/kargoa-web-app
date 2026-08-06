import { TrendingUp, type LucideIcon } from 'lucide-react';

export type StatCardTone = 'neutral' | 'gradient' | 'danger';

export type StatCardAvatar = {
  initials: string;
  tone: 'primary' | 'secondary' | 'tertiary';
};

export type StatCardProps = {
  label: string;
  value: string;
  valueSuffix?: string;
  /** Decorative icon shown faded in the card's corner; omit for cards that don't use one. */
  icon?: LucideIcon;
  tone?: StatCardTone;
  /** e.g. "+12.4% vs last week" */
  trend?: string;
  progress?: { current: number; max: number };
  /** e.g. "Requires Action" */
  badge?: string;
  avatars?: StatCardAvatar[];
  footnote?: string;
};

const CARD_TONE_CLASSES: Record<StatCardTone, string> = {
  neutral:
    'bg-surface border border-border rounded-xl p-6 shadow-sm relative overflow-hidden',
  gradient:
    'bg-gradient-to-br from-primary to-primary-container rounded-xl p-6 shadow-sm relative overflow-hidden',
  danger:
    'bg-surface border border-border rounded-xl p-6 shadow-sm relative overflow-hidden',
};

const LABEL_TONE_CLASSES: Record<StatCardTone, string> = {
  neutral: 'text-text-secondary',
  gradient: 'text-primary-foreground/80',
  danger: 'text-text-secondary',
};

const VALUE_TONE_CLASSES: Record<StatCardTone, string> = {
  neutral: 'text-primary',
  gradient: 'text-primary-foreground',
  danger: 'text-error',
};

const SUFFIX_TONE_CLASSES: Record<StatCardTone, string> = {
  neutral: 'text-text-secondary',
  gradient: 'text-primary-foreground/90',
  danger: 'text-text-secondary',
};

const AVATAR_TONE_CLASSES: Record<StatCardAvatar['tone'], string> = {
  primary: 'bg-primary-container text-on-primary-container',
  secondary: 'bg-secondary-container text-secondary-container-foreground',
  tertiary: 'bg-tertiary-container text-tertiary-container-foreground',
};

export function StatCard({
  label,
  value,
  valueSuffix,
  icon: Icon,
  tone = 'neutral',
  trend,
  progress,
  badge,
  avatars,
  footnote,
}: StatCardProps) {
  return (
    <div className={CARD_TONE_CLASSES[tone]}>
      {Icon && (
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Icon aria-hidden="true" className="h-14 w-14" />
        </div>
      )}

      <p
        className={`font-sans text-sm mb-1 uppercase tracking-wider ${LABEL_TONE_CLASSES[tone]}`}
      >
        {label}
      </p>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span
            className={`font-mono text-3xl font-bold ${VALUE_TONE_CLASSES[tone]}`}
          >
            {value}
          </span>
          {valueSuffix && (
            <span className={`font-mono text-lg ${SUFFIX_TONE_CLASSES[tone]}`}>
              {valueSuffix}
            </span>
          )}
        </div>
        {badge && (
          <span className="bg-error-container text-error px-3 py-1 rounded-full text-xs font-bold shrink-0">
            {badge}
          </span>
        )}
      </div>

      {progress && (
        <div
          role="progressbar"
          aria-valuenow={progress.current}
          aria-valuemin={0}
          aria-valuemax={progress.max}
          aria-label={label}
          className="mt-4 w-full bg-surface-container h-2 rounded-full overflow-hidden"
        >
          <div
            className="bg-primary h-full rounded-full"
            style={{
              width: `${
                progress.max > 0 ? (progress.current / progress.max) * 100 : 0
              }%`,
            }}
          />
        </div>
      )}

      {trend && (
        <div className="mt-4 flex items-center gap-1 text-xs font-bold bg-primary-foreground/20 text-primary-foreground w-fit px-2 py-1 rounded">
          <TrendingUp aria-hidden="true" className="h-3.5 w-3.5" />
          <span>{trend}</span>
        </div>
      )}

      {avatars && avatars.length > 0 && (
        <div className="mt-6 flex -space-x-2">
          {avatars.map((avatar, index) => (
            <div
              key={`${avatar.initials}-${index}`}
              className={`w-8 h-8 rounded-full border-2 border-surface flex items-center justify-center text-[10px] font-bold ${AVATAR_TONE_CLASSES[avatar.tone]}`}
            >
              {avatar.initials}
            </div>
          ))}
        </div>
      )}

      {footnote && (
        <p className="mt-2 text-xs text-text-secondary">{footnote}</p>
      )}
    </div>
  );
}
