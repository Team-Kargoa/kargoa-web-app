'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  FileText,
  BadgeCheck,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { OnboardingHeader } from './onboarding-header';
import { OnboardingFooterNav } from './onboarding-footer-nav';

const FLEET_SIZE_OPTIONS = [
  { value: '1-5', label: '1 - 5 Vehicles' },
  { value: '6-20', label: '6 - 20 Vehicles' },
  { value: '21-50', label: '21 - 50 Vehicles' },
  { value: '50+', label: 'More than 50' },
];

// Matches the design's own client-side progress script: 6 tracked fields
// (company name, tax id, fleet size, both document uploads, terms checkbox),
// each filled field adds an equal share of the remaining 33% above the 66%
// baseline for completing step 1.
const TRACKED_FIELD_COUNT = 6;
const BASE_PERCENT = 66;

function UploadCard({
  icon: Icon,
  title,
  description,
  fileName,
  onSelect,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
  fileName: string | null;
  onSelect: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="bg-surface p-6 rounded-xl border border-border flex flex-col items-center text-center">
      <div className="mb-4 w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary-container">
        <Icon aria-hidden="true" className="h-8 w-8" />
      </div>
      <h4 className="font-sans font-semibold mb-1">{title}</h4>
      <p className="text-text-secondary text-sm mb-4">{description}</p>
      <label
        className={`w-full py-3 border-2 border-dashed rounded-lg font-sans font-semibold cursor-pointer transition-colors ${
          fileName
            ? 'border-success-momo bg-success-momo/5 text-success-momo'
            : 'border-border text-primary-container hover:bg-primary-container/5'
        }`}
      >
        {fileName ? (
          <span className="flex items-center justify-center gap-2">
            <BadgeCheck aria-hidden="true" className="h-4 w-4" />
            {fileName}
          </span>
        ) : (
          'Select File'
        )}
        <input
          className="hidden"
          type="file"
          aria-label={`Select ${title} file`}
          onChange={onSelect}
        />
      </label>
    </div>
  );
}

export function BusinessInfoForm() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [fleetSize, setFleetSize] = useState('');
  const [businessRegFile, setBusinessRegFile] = useState<string | null>(null);
  const [ownerIdFile, setOwnerIdFile] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const filledCount = [
    companyName,
    taxId,
    fleetSize,
    businessRegFile,
    ownerIdFile,
    termsAccepted ? 'yes' : '',
  ].filter(Boolean).length;
  const percent = Math.min(
    BASE_PERCENT + Math.round((filledCount / TRACKED_FIELD_COUNT) * 33),
    100,
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push('/onboarding/vehicle');
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <OnboardingHeader />

      <main className="flex-grow pt-20 pb-32 px-4 md:px-8 max-w-4xl mx-auto w-full">
        <section className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="font-mono text-xs text-text-secondary">
              STEP 02 OF 03
            </span>
            <span className="font-mono text-xs text-primary-container">
              {percent}% COMPLETE
            </span>
          </div>
          <div className="w-full bg-surface-high h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary-container h-full transition-all duration-500 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
          <h2 className="mt-6 font-heading text-2xl md:text-3xl font-bold text-text-primary">
            Company &amp; Verification
          </h2>
          <p className="text-text-secondary mt-1">
            Provide your legal business details to start managing your fleet on
            KmerCargo.
          </p>
        </section>

        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Building2
                aria-hidden="true"
                className="h-5 w-5 text-primary-container"
              />
              <h3 className="font-heading text-xl text-text-primary">
                Business Identity
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="company-name"
                  className="text-xs font-mono font-bold text-text-secondary uppercase tracking-wider"
                >
                  Company Name
                </label>
                <input
                  id="company-name"
                  type="text"
                  placeholder="e.g. Douala Express Logistics"
                  className="h-14 px-4 rounded-lg border-2 border-border focus:border-primary-container focus:ring-0 transition-colors"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="tax-id"
                  className="text-xs font-mono font-bold text-text-secondary uppercase tracking-wider"
                >
                  Tax ID (NIU)
                </label>
                <input
                  id="tax-id"
                  type="text"
                  placeholder="M000000000000X"
                  className="h-14 px-4 rounded-lg border-2 border-border focus:border-primary-container focus:ring-0 transition-colors font-mono uppercase"
                  value={taxId}
                  onChange={(event) => setTaxId(event.target.value)}
                />
                <p className="text-[10px] text-text-secondary">
                  Your 14-character Num&eacute;ro d&apos;Identifiant Unique.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="fleet-size"
                  className="text-xs font-mono font-bold text-text-secondary uppercase tracking-wider"
                >
                  Number of Vehicles
                </label>
                <select
                  id="fleet-size"
                  className="w-full h-14 px-4 rounded-lg border-2 border-border focus:border-primary-container focus:ring-0 bg-transparent"
                  value={fleetSize}
                  onChange={(event) => setFleetSize(event.target.value)}
                >
                  <option value="">Select range</option>
                  {FLEET_SIZE_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UploadCard
              icon={FileText}
              title="Business Registration"
              description="Upload a clear PDF or JPG of your Commerce Register (RCCM)."
              fileName={businessRegFile}
              onSelect={(event) =>
                setBusinessRegFile(event.target.files?.[0]?.name ?? null)
              }
            />
            <UploadCard
              icon={ShieldCheck}
              title="Owner Identity Card"
              description="A high-quality scan of your CNI or Passport (both sides)."
              fileName={ownerIdFile}
              onSelect={(event) =>
                setOwnerIdFile(event.target.files?.[0]?.name ?? null)
              }
            />
          </div>

          <div className="flex items-start gap-3 px-2">
            <input
              id="terms"
              type="checkbox"
              className="mt-1 rounded border-border text-primary-container focus:ring-primary-container h-5 w-5"
              checked={termsAccepted}
              onChange={(event) => setTermsAccepted(event.target.checked)}
            />
            <label htmlFor="terms" className="text-sm text-text-secondary">
              I certify that all information provided is accurate according to
              Cameroon&apos;s Ministry of Transport regulations and
              KmerCargo&apos;s{' '}
              {/* /terms doesn't exist yet — non-interactive text rather than
                  a dead link, until that route ships. */}
              <span className="text-primary-container underline">
                Terms of Service
              </span>
              .
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 h-14 rounded-xl border-2 border-border font-sans font-semibold text-text-primary hover:bg-surface-high active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Back
            </button>
            <button
              type="submit"
              className="flex-[2] h-14 rounded-xl bg-primary-container text-primary-container-foreground font-sans font-semibold shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Submit for Verification
              <BadgeCheck aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
        </form>
      </main>

      <OnboardingFooterNav />
    </div>
  );
}
