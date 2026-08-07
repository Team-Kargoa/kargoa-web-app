'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  UserCircle,
  ArrowRight,
  ShieldCheck,
  Lock,
  Route,
  ClipboardCheck,
  Loader2,
} from 'lucide-react';
import { sendOtp } from '../../actions';
import { PhoneField } from '@/components/auth/phone-field';
import { BackToHomeLink } from '@/components/auth/back-to-home-link';
import { BrandLink } from '@/components/brand-link';
import Footer from '@/components/Footer';

const PURPOSE = 'registration';
const ROLE = 'fleet_owner';

const STATS = [
  { value: '500+', label: 'Active Fleets' },
  { value: '10M+', label: 'KM Tracked' },
  { value: '24/7', label: 'Support' },
];

const TRUST_ICONS = [
  { icon: Lock, label: 'Secure Payment' },
  { icon: Route, label: 'Real-time Tracking' },
  { icon: ClipboardCheck, label: 'Compliance Verified' },
];

export default function FleetRegistrationPage() {
  const [state, formAction, pending] = useActionState(sendOtp, {
    error: null,
  });
  const router = useRouter();
  const phoneRef = useRef('');
  const submittedRef = useRef(false);

  useEffect(() => {
    if (submittedRef.current && !pending && state.error === null) {
      router.push(
        `/verify?phone=${encodeURIComponent(phoneRef.current)}&purpose=${PURPOSE}&role=${ROLE}`,
      );
    }
  }, [state, pending, router]);

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
          <div className="flex items-center gap-4">
            <BackToHomeLink />
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-text-secondary hidden md:block">
                CAMEROON OPS
              </span>
              <UserCircle aria-hidden="true" className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col md:flex-row max-w-7xl mx-auto w-full px-4 md:px-8 py-8 md:py-12 gap-12 items-center">
        {/* Left column: marketing */}
        <div className="w-full md:w-1/2 flex flex-col gap-8">
          <div className="relative rounded-xl overflow-hidden shadow-md border border-border aspect-[4/3] md:aspect-auto md:h-[500px]">
            <Image
              src="/hero.jpg"
              alt="Fleet of cargo trucks lined up at a Cameroon logistics terminal"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/30 to-transparent flex flex-col justify-end p-8">
              <div className="bg-primary-container text-on-primary-container inline-flex items-center gap-2 px-3 py-1 rounded-full w-fit mb-4">
                <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                <span className="font-mono text-xs font-bold tracking-wide">
                  INSTITUTIONAL GRADE SECURITY
                </span>
              </div>
              <p className="text-white font-heading text-2xl leading-tight">
                Optimizing heavy-haulage across the CEMAC region.
              </p>
            </div>
          </div>

          <div className="hidden md:grid grid-cols-3 gap-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="bg-surface p-4 rounded-lg border border-border"
              >
                <span className="font-heading text-2xl text-primary block">
                  {stat.value}
                </span>
                <span className="font-mono text-xs text-text-secondary">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: registration card */}
        <div className="w-full md:w-1/2 flex flex-col max-w-md mx-auto md:mx-0">
          <div className="bg-surface border border-border rounded-xl p-8 md:p-10 shadow-sm">
            <div className="mb-8">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-2">
                Partner with KmerCargo
              </h2>
              <p className="text-text-secondary font-sans">
                Enter your phone number to start managing your fleet across
                Cameroon.
              </p>
            </div>

            <form
              className="space-y-6"
              action={formAction}
              onSubmit={(event) => {
                submittedRef.current = true;
                const formData = new FormData(event.currentTarget);
                phoneRef.current = formData.get('phone_number') as string;
              }}
            >
              <input type="hidden" name="purpose" value={PURPOSE} />
              <div className="space-y-2">
                <PhoneField name="phone_number" label="Business Phone Number" />
                <p className="text-xs font-sans text-text-secondary italic">
                  Security: We will send a 6-digit verification code to this
                  number.
                </p>
              </div>

              {state.error && (
                <p role="alert" className="font-sans text-sm text-error">
                  {state.error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full h-14 bg-primary-container text-on-primary-container font-sans font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all active:scale-95 shadow-sm disabled:opacity-80 disabled:cursor-not-allowed"
              >
                <span>Continue to Registration</span>
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

            <div className="mt-8 pt-8 border-t border-border flex flex-col items-center gap-4">
              <p className="text-text-secondary font-sans text-sm text-center">
                Already have an account?{' '}
                <Link
                  href="/signin"
                  className="text-primary font-bold hover:underline"
                >
                  Login if you already have an account
                </Link>
              </p>
              <div className="flex flex-wrap justify-center gap-4 opacity-60">
                {TRUST_ICONS.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <Icon
                      aria-hidden="true"
                      className="h-5 w-5 text-text-secondary"
                    />
                    <span className="font-mono text-[10px] text-text-secondary">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="w-2 h-2 rounded-full bg-success-momo animate-pulse"
              />
              <span className="font-mono text-[10px] text-text-secondary">
                SERVER STATUS: OPTIMAL
              </span>
            </div>
            <span className="font-mono text-[10px] text-text-secondary">
              v4.2.1-Yaound&eacute;
            </span>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
