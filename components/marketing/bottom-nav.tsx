import Link from 'next/link';
import { ClipboardList, Headset, CircleHelp } from 'lucide-react';

const LINKS = [
  {
    label: 'Registration',
    href: '/register',
    icon: ClipboardList,
    active: true,
  },
  { label: 'Support', href: '/support', icon: Headset, active: false },
  { label: 'Help', href: '/help', icon: CircleHelp, active: false },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 h-20 bg-bg-dark border-t border-border-dark">
      {LINKS.map(({ label, href, icon: Icon, active }) => (
        <Link
          key={href}
          href={href}
          className={
            active
              ? 'flex flex-col items-center justify-center gap-1 bg-primary-container text-on-primary-container rounded-xl px-4 py-2 transition-all duration-200'
              : 'flex flex-col items-center justify-center gap-1 text-text-secondary rounded-xl px-4 py-2 transition-all duration-200'
          }
        >
          <Icon aria-hidden="true" className="h-5 w-5" />
          <span className="font-sans text-xs">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
