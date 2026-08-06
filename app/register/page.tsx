import Image from 'next/image';
import { Truck, ShieldCheck } from 'lucide-react';
import { RoleCard, type RoleCardProps } from '@/components/marketing/role-card';
import Footer from '@/components/Footer';

const ROLE_CARDS: RoleCardProps[] = [
  {
    eyebrow: '',
    icon: ShieldCheck,
    title: 'I am an Admin',
    description:
      'Coordinate regional logistics hubs, monitor driver safety, and oversee large-scale operations across the corridor.',
    benefits: [
      'High-density data monitoring',
      'Regional compliance tools',
      'Incident management console',
    ],
    ctaLabel: 'Request Admin Access',
    ctaHref: '/signin',
    tone: 'secondary',
  },
  {
    eyebrow: '',
    icon: Truck,
    title: 'I am a Fleet Owner',
    description:
      'Manage multiple trucks across Cameroon with real-time tracking, automated dispatching, and optimized route planning.',
    benefits: [
      'Multi-vehicle fleet dashboard',
      'Fuel consumption analytics',
      'Guaranteed payment cycles',
    ],
    ctaLabel: 'Register Fleet',
    ctaHref: '/register/fleet',
    tone: 'primary',
  },
];

const STATS = [
  { value: '500+', label: 'TRUCKS ACTIVE' },
  { value: '10k+', label: 'MONTHLY TRIPS' },
  { value: '99.2%', label: 'SAFETY RATING' },
];

export default function RegisterPage() {
  return (
    <>
      <main className="min-h-screen pb-24 bg-surface">
        {/* Hero */}
        <section className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden flex items-center px-4 md:px-8">
          <Image
            src="/hero.jpg"
            alt="Fleet of cargo trucks at a Cameroon logistics terminal"
            fill
            priority
            sizes="100vw"
            className="object-cover brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/40 to-transparent" />
          <div className="relative z-10 max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-widest text-primary-container mb-2 block">
              National Logistics Hub
            </span>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
              The Backbone of Cameroon Logistics
            </h1>
            <p className="font-sans text-white/90">
              Join the most trusted cargo ecosystem in Central Africa. Choose
              your path to start moving.
            </p>
          </div>
        </section>

        {/* Path selection */}
        <section className="px-4 md:px-8 -mt-12 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto">
            {ROLE_CARDS.map((card) => (
              <RoleCard key={card.title} {...card} />
            ))}
          </div>
        </section>

        {/* Network statistics */}
        <section className="mt-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto bg-surface-container rounded-2xl p-10 flex flex-wrap justify-around gap-8 text-center border border-border">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className="font-mono text-2xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="font-mono text-xs uppercase tracking-wide text-text-secondary">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
