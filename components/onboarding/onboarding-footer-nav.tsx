import { ClipboardCheck, LifeBuoy, HelpCircle } from 'lucide-react';

// The design's BottomNavBar for the onboarding flow points at "Registration",
// "Support" and "Help" — none of which are routes this app has built ("Support"
// and "Help" don't exist anywhere in the app, and "Registration" would just be
// the multi-step flow already on screen). Rendered as plain, non-interactive
// labels rather than links to routes that don't exist, matching the precedent
// set for /fleet's header nav in the previous phase of this project.
const FOOTER_NAV_ITEMS = [
  { label: 'Registration', icon: ClipboardCheck, active: true },
  { label: 'Support', icon: LifeBuoy, active: false },
  { label: 'Help', icon: HelpCircle, active: false },
] as const;

export function OnboardingFooterNav() {
  return (
    <nav
      aria-label="Onboarding sections"
      className="fixed bottom-0 w-full z-50 flex justify-around items-center px-4 h-20 pb-safe bg-bg-dark border-t border-border-dark md:hidden"
    >
      {FOOTER_NAV_ITEMS.map(({ label, icon: Icon, active }) => (
        <span
          key={label}
          className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all ${
            active
              ? 'bg-primary-container text-primary-container-foreground'
              : 'text-text-secondary'
          }`}
        >
          <Icon aria-hidden="true" className="h-5 w-5" />
          <span className="text-sm">{label}</span>
        </span>
      ))}
    </nav>
  );
}
