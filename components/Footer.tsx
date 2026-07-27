import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Company */}
          <div>
            <h2 className="text-3xl font-bold mb-4">Kargoa</h2>

            <p className="text-gray-400 leading-relaxed">
              Connecting shippers, drivers, and businesses through smarter
              logistics technology across Cameroon.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>

            <div className="flex flex-col gap-3 text-gray-400">
              <Link href="/">Home</Link>
              <Link href="/tracking">Track Shipment</Link>
              <Link href="/drivers">Become A Driver</Link>
              <Link href="/pricing">Pricing</Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>

            <div className="flex flex-col gap-3 text-gray-400">
              <Link href="/about">About Us</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/careers">Careers</Link>
              <Link href="/blog">Blog</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>

            <div className="space-y-3 text-gray-400">
              <p>Douala, Cameroon</p>
              <p>support@kargoa.com</p>
              <p>+237 XXX XXX XXX</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Kargoa. All rights reserved.
          </p>

          <div className="flex gap-6 mt-4 md:mt-0 text-sm text-gray-500">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
