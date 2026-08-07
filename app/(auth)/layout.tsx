import type { ReactNode } from 'react';

/**
 * Shared wrapper for the OTP-only auth screens (/signin, /register/fleet,
 * /verify). Each screen supplies its own header per its design — this
 * layout only establishes the common page background.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-surface-container">{children}</div>;
}
