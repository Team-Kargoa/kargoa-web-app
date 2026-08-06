'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Truck, LogIn, Loader2, ArrowRight } from 'lucide-react';
import { sendOtp } from '../actions';
import { PhoneField } from '@/components/auth/phone-field';
import { BackToHomeLink } from '@/components/auth/back-to-home-link';

const PURPOSE = 'login';

export default function SignInPage() {
  const [state, formAction, pending] = useActionState(sendOtp, {
    error: null,
  });
  const router = useRouter();
  const phoneRef = useRef('');
  const submittedRef = useRef(false);

  useEffect(() => {
    if (submittedRef.current && !pending && state.error === null) {
      router.push(
        `/verify?phone=${encodeURIComponent(phoneRef.current)}&purpose=${PURPOSE}`,
      );
    }
  }, [state, pending, router]);

  return (
    <>
      <header className="w-full sticky top-0 bg-surface z-50">
        <div className="flex items-center justify-end px-4 md:px-8 py-4 max-w-7xl mx-auto">
          <BackToHomeLink />
        </div>
      </header>

      <main className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[480px] flex flex-col">
          <div className="bg-surface rounded-xl shadow-2xl p-8 md:p-10 flex flex-col gap-8">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-20 h-20 bg-primary-container rounded-xl flex items-center justify-center shadow-lg">
                <Truck
                  aria-hidden="true"
                  className="h-10 w-10 text-on-primary-container"
                />
              </div>
              <div>
                <h1 className="font-heading text-3xl font-bold text-text-primary tracking-tight">
                  KmerCargo
                </h1>
                <h2 className="font-heading text-xl font-semibold text-primary mt-1">
                  Admin Portal
                </h2>
                <p className="font-sans text-text-secondary mt-2">
                  Enter your credentials to manage the logistics fleet.
                </p>
              </div>
            </div>

            <form
              className="flex flex-col gap-6"
              action={formAction}
              onSubmit={(event) => {
                submittedRef.current = true;
                const formData = new FormData(event.currentTarget);
                phoneRef.current = formData.get('phone_number') as string;
              }}
            >
              <input type="hidden" name="purpose" value={PURPOSE} />
              <PhoneField
                name="phone_number"
                label="Enter Admin Code or Password"
              />

              {state.error && (
                <p role="alert" className="font-sans text-sm text-error">
                  {state.error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="h-14 rounded-xl bg-gradient-to-br from-primary-container to-primary text-white font-sans font-semibold shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed"
              >
                <span>Sign In to Dashboard</span>
                {pending ? (
                  <Loader2
                    aria-hidden="true"
                    className="h-5 w-5 animate-spin"
                  />
                ) : (
                  <LogIn aria-hidden="true" className="h-5 w-5" />
                )}
              </button>
            </form>

            <div className="flex flex-col items-center gap-4 border-t border-border pt-6">
              <Link
                href="/contact"
                className="font-sans text-sm font-semibold text-primary hover:underline flex items-center gap-2 group"
              >
                Request Admin Access
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                />
              </Link>
              <p className="font-sans text-xs text-text-secondary text-center px-4">
                Strictly for authorized logistics personnel and fleet managers
                in Cameroon.
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-between items-center px-4">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="w-2 h-2 rounded-full bg-success-momo animate-pulse"
              />
              <span className="font-mono text-xs text-text-secondary">
                System Online
              </span>
            </div>
            <div className="flex gap-4">
              <span className="font-mono text-xs text-text-secondary opacity-60">
                v4.2.0
              </span>
              <span className="font-mono text-xs text-text-secondary opacity-60">
                Yaound&eacute; HQ
              </span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
