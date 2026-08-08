import Link from 'next/link';

const FOOTER_LINKS = [
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Contact Support', href: '/contact' },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-surface py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center md:items-start">
          <span className="font-heading text-xl font-bold text-primary mb-2">
            KmerCargo
          </span>
          <p className="font-sans text-sm text-text-secondary">
            © {new Date().getFullYear()} KmerCargo Logistics Ecosystem. All
            rights reserved.
          </p>
        </div>
        <div className="flex gap-6">
          {FOOTER_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="font-sans text-sm text-text-secondary hover:text-primary transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
