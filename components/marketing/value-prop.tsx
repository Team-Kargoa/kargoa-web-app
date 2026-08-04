import type { LucideIcon } from 'lucide-react';

export type ValuePropProps = {
  icon: LucideIcon;
  tone: 'success' | 'primary' | 'secondary';
  title: string;
  description: string;
};

const TONE_CLASSES: Record<
  ValuePropProps['tone'],
  { bg: string; text: string }
> = {
  success: { bg: 'bg-success-momo/10', text: 'text-success-momo' },
  primary: { bg: 'bg-primary/10', text: 'text-primary' },
  secondary: { bg: 'bg-secondary/10', text: 'text-secondary' },
};

export function ValueProp({
  icon: Icon,
  tone,
  title,
  description,
}: ValuePropProps) {
  const { bg, text } = TONE_CLASSES[tone];

  return (
    <div className="flex gap-4">
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full ${bg} flex items-center justify-center`}
      >
        <Icon aria-hidden="true" className={text} />
      </div>
      <div>
        <h4 className="font-sans font-semibold text-text-primary">{title}</h4>
        <p className="font-sans text-sm text-text-secondary">{description}</p>
      </div>
    </div>
  );
}
