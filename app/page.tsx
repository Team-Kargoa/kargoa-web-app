import { Package, Van, MapPin, Check } from 'lucide-react';

const TITLE = 'Move Cargo Across Cameroon. Faster. Safer. Smarter.';

const WELCOME_MESSAGE =
  'Connect with verified transporters, track shipments in real time, and manage deliveries from pickup to destination all through one powerful logistics platform.';

export default function HomePage() {
  return (
    <main className="bg-white">
      {/* hero */}
      <section
        className="
          relative
          h-[160vh]
          w-full
          bg-[linear-gradient(to_bottom,rgba(255,255,255,1)_0%,rgba(255,255,255,0)_55%),url('/hero.png')]
          bg-cover
          bg-center
          bg-no-repeat
          overflow-hidden
        "
      >
        <div className="max-w-5xl mx-auto px-6 pt-28 text-center md:mt-30 ">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-black leading-none mb-6">
            {TITLE}
          </h1>

          <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-600 leading-relaxed mb-8">
            {WELCOME_MESSAGE}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-8 py-4 rounded-full bg-black text-white font-semibold hover:opacity-90 transition">
              Request Transport
            </button>

            <button className="px-8 py-4 rounded-full border border-black text-black font-semibold hover:bg-black hover:text-white transition">
              Become A Driver
            </button>
          </div>
        </div>
      </section>

      {/* problem and solution */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Logistics In Cameroon Is Still Too Complicated
            </h2>

            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Finding trusted transporters, tracking shipments, and managing
              deliveries shouldn&apos;t be difficult.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-red-50 rounded-3xl p-8">
              <h3 className="text-2xl font-bold mb-6">Current Challenges</h3>

              <ul className="space-y-4 text-lg">
                <li>&#10060; Finding reliable transporters takes time</li>
                <li>&#10060; No visibility after cargo leaves</li>
                <li>&#10060; Unverified drivers create risk</li>
                <li>&#10060; Communication is fragmented</li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-3xl p-8">
              <h3 className="text-2xl font-bold mb-6">Kargoa Changes That</h3>

              <p className="text-lg text-gray-700 leading-relaxed">
                Kargoa connects individuals, drivers, and companies into one
                digital platform where deliveries can be booked, tracked, and
                managed from start to finish.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* how it works */}
      <section className="py-28 bg-gray-50 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How Kargoa Works
            </h2>

            <p className="text-gray-600 text-lg">
              Move cargo in four simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm">
              <div className="text-4xl mb-4">
                <Package size={24} color="#b45309" fill="#fde68a" />
              </div>
              <h3 className="font-bold text-xl mb-3">Request Shipment</h3>
              <p className="text-gray-600">
                Enter pickup and delivery details.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm">
              <div className="text-4xl mb-4">
                <Van size={24} color="#1d4ed8" fill="#dbeafe" />
              </div>
              <h3 className="font-bold text-xl mb-3">Get Matched</h3>
              <p className="text-gray-600">
                Connect with verified transporters.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm">
              <div className="text-4xl mb-4">
                <MapPin size={24} color="#ef4444" />
              </div>
              <h3 className="font-bold text-xl mb-3">Track Live</h3>
              <p className="text-gray-600">
                Follow shipment progress in real time.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm">
              <div className="text-4xl mb-4">
                <Check size={24} color="green" />
              </div>
              <h3 className="font-bold text-xl mb-3">Delivered</h3>
              <p className="text-gray-600">
                Receive confirmation and complete payment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* features */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need In One Platform
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="📍"
              title="Live Tracking"
              description="Track shipments from pickup to delivery."
            />

            <FeatureCard
              icon="🛡"
              title="Verified Drivers"
              description="Every transporter is verified before approval."
            />

            <FeatureCard
              icon="💳"
              title="Secure Payments"
              description="Transparent pricing and payment management."
            />

            <FeatureCard
              icon="📊"
              title="Analytics"
              description="Monitor deliveries and performance."
            />

            <FeatureCard
              icon="💬"
              title="Communication"
              description="Stay connected throughout the delivery."
            />

            <FeatureCard
              icon="📄"
              title="Delivery Records"
              description="Maintain proof of delivery history."
            />
          </div>
        </div>
      </section>

      {/* call to action */}
      <section className="bg-black text-white py-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">Ready To Move Smarter?</h2>

          <p className="text-xl text-gray-300 mb-10">
            Join businesses and drivers using Kargoa to simplify logistics
            across Cameroon.
          </p>

          <button className="bg-white text-black px-8 py-4 rounded-full font-semibold">
            Get Started
          </button>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="p-8 rounded-3xl border border-gray-200 hover:shadow-lg transition">
      <div className="text-4xl mb-4">{icon}</div>

      <h3 className="text-xl font-bold mb-3">{title}</h3>

      <p className="text-gray-600">{description}</p>
    </div>
  );
}
