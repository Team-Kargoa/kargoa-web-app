import Image from 'next/image';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Banknote,
  Route,
  ShieldCheck,
} from 'lucide-react';
import { RoleCard, type RoleCardProps } from '@/components/marketing/role-card';
import {
  ValueProp,
  type ValuePropProps,
} from '@/components/marketing/value-prop';
import { BottomNav } from '@/components/marketing/bottom-nav';

const ROLE_CARDS: RoleCardProps[] = [
  {
    eyebrow: 'INTERNAL',
    icon: LayoutDashboard,
    title: 'Admin Portal',
    description:
      'Manage global shipments, track fleet performance, and resolve logistical bottlenecks in real-time.',
    ctaLabel: 'Access Dashboard',
    ctaHref: '/auth',
    tone: 'light',
  },
  {
    eyebrow: 'PARTNERS',
    icon: Users,
    title: 'Fleet Partner',
    description:
      'Register your trucks, find consistent cargo loads, and optimize your earnings with our smart routing.',
    ctaLabel: 'Join the Fleet',
    ctaHref: '/register/fleet',
    tone: 'amber',
  },
];

const VALUE_PROPS: ValuePropProps[] = [
  {
    icon: Banknote,
    tone: 'success',
    title: 'Guaranteed Payments',
    description:
      'Instant MoMo settlements upon delivery confirmation. No more waiting weeks for your invoices.',
  },
  {
    icon: Route,
    tone: 'primary',
    title: 'Optimal Routing',
    description:
      "Navigate Cameroon's challenging terrain with our AI-powered route optimization for heavy vehicles across all provinces.",
  },
  {
    icon: ShieldCheck,
    tone: 'secondary',
    title: 'Verified Cargo',
    description:
      'All shipments are insured and pre-verified for weight and safety, ensuring zero legal friction.',
  },
];

export default function HomePage() {
  return (
    <main className="bg-background pb-24">
      {/* Hero */}
      <section className="relative w-full h-[530px] md:h-[640px] flex items-end overflow-hidden">
        <Image
          src="/hero.png"
          alt="Truck in Yaoundé"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/40 to-transparent" />
        <div className="relative z-10 w-full px-4 md:px-8 pb-10">
          <div className="max-w-6xl mx-auto">
            <span className="inline-block px-3 py-1 bg-primary-container text-on-primary-container font-mono text-xs font-bold tracking-wide rounded mb-4">
              RELIABLE LOGISTICS
            </span>
            <h1 className="font-heading text-2xl md:text-4xl font-bold text-white mb-2 leading-tight">
              Move Anything in Cameroon
            </h1>
            <p className="font-sans text-white/90 max-w-[85%] md:max-w-2xl">
              The nationwide digital backbone for freight, connecting truck
              owners to high-priority cargo across every region of Cameroon.
            </p>
          </div>
        </div>
      </section>

      {/* Role selection */}
      <section className="px-4 md:px-8 -mt-8 relative z-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {ROLE_CARDS.map((card) => (
            <RoleCard key={card.title} {...card} />
          ))}
        </div>
      </section>

      {/* Value proposition */}
      <section className="mt-12 px-4 md:px-8" id="role-selection">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="font-heading text-xl md:text-2xl font-semibold text-text-primary border-l-4 border-primary-container pl-4">
              Why Partner with Us?
            </h2>
          </div>
          <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-3 md:gap-8">
            {VALUE_PROPS.map((prop) => (
              <ValueProp key={prop.title} {...prop} />
            ))}
          </div>

          {/* Global CTA */}
          <div className="mt-12 bg-bg-dark rounded-2xl p-8 text-center">
            <h3 className="font-heading text-xl md:text-2xl font-semibold text-white mb-2">
              Ready to Scale?
            </h3>
            <p className="font-sans text-sm text-white/70 mb-6">
              Select your role to start your journey with KmerCargo today.
            </p>
            <div className="flex flex-col gap-3 md:flex-row md:justify-center">
              <Link
                href="/register"
                className="h-14 md:px-8 bg-primary-container text-on-primary-container font-sans font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                Get Started Now
              </Link>
              <Link
                href="/network-map"
                className="h-14 md:px-8 border border-border-dark text-white font-sans font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                View Network Map
              </Link>
            </div>
          </div>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}
