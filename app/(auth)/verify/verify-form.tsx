'use client';

import { useActionState, useState } from 'react';
import { ArrowRight, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { confirmOtp, sendOtp } from '../actions';
import { OtpField } from '@/components/auth/otp-field';
import { BackToHomeLink } from '@/components/auth/back-to-home-link';
import { BrandLink } from '@/components/brand-link';
import { maskPhone } from '@/lib/format';
import type { OtpPurpose } from '@/lib/api/types';

export type VerifyFormProps = {
  phone: string;
  purpose: OtpPurpose;
  role?: string;
};

const TRUST_BADGES = [
  {
    icon: Lock,
    title: 'End-to-End Encrypted',
    subtitle: 'Secure Protocol V2.4',
  },
  {
    icon: ShieldCheck,
    title: 'Owner Identity Guard',
    subtitle: 'Fleet Protected',
  },
];

export function VerifyForm({ phone, purpose, role }: VerifyFormProps) {
  const [state, formAction, pending] = useActionState(confirmOtp, {
    error: null,
  });
  const [resendState, resendAction, resendPending] = useActionState(sendOtp, {
    error: null,
  });
  const [hasResent, setHasResent] = useState(false);
  const resendConfirmed =
    hasResent && !resendPending && resendState.error === null;

  return (
    <>
      <header className="w-full sticky top-0 bg-surface z-50">
        <div className="flex items-center justify-between px-4 md:px-8 py-4 max-w-7xl mx-auto">
          <h1>
            <BrandLink
              size="lg"
              className="text-primary hover:opacity-90 transition"
            />
          </h1>
          <BackToHomeLink />
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="max-w-xl w-full flex flex-col gap-6">
          <div className="bg-surface p-8 rounded-xl border border-border">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-2">
              Verify Your Identity
            </h2>
            <p className="font-sans text-text-secondary">
              A 6-digit code has been sent to{' '}
              <span className="font-mono font-bold text-primary">
                {maskPhone(phone)}
              </span>
            </p>
          </div>

          <div className="bg-surface p-8 rounded-xl border border-border shadow-sm flex flex-col items-center gap-8">
            <form
              className="flex flex-col items-center gap-8 w-full"
              action={formAction}
            >
              <input type="hidden" name="phone_number" value={phone} />
              <input type="hidden" name="purpose" value={purpose} />
              {purpose === 'registration' && role && (
                <input type="hidden" name="role" value={role} />
              )}
              <OtpField name="code" dividerAfterIndex={2} />

              {state.error && (
                <p role="alert" className="font-sans text-sm text-error">
                  {state.error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full h-14 bg-primary-container text-on-primary-container font-sans font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-80 disabled:cursor-not-allowed"
              >
                <span>Verify &amp; Continue</span>
                {pending ? (
                  <Loader2
                    aria-hidden="true"
                    className="h-5 w-5 animate-spin"
                  />
                ) : (
                  <ArrowRight aria-hidden="true" className="h-5 w-5" />
                )}
              </button>
            </form>

            <form action={resendAction} onSubmit={() => setHasResent(true)}>
              <input type="hidden" name="phone_number" value={phone} />
              <input type="hidden" name="purpose" value={purpose} />
              <button
                type="submit"
                disabled={resendPending}
                className="text-primary font-sans text-sm hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendPending ? 'Resending...' : 'Resend Verification Code'}
              </button>
            </form>

            {resendState.error && (
              <p role="alert" className="font-sans text-sm text-error">
                {resendState.error}
              </p>
            )}
            {!resendState.error && resendConfirmed && (
              <p className="font-sans text-sm text-success-momo">
                A new code has been sent.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TRUST_BADGES.map(({ icon: Icon, title, subtitle }) => (
              <div
                key={title}
                className="bg-surface-container p-6 rounded-xl border border-border flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center">
                  <Icon aria-hidden="true" className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-mono text-xs font-bold text-text-primary">
                    {title}
                  </h3>
                  <p className="text-[10px] text-text-secondary uppercase tracking-wider">
                    {subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
