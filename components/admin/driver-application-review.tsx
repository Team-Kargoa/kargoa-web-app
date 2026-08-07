import Link from 'next/link';
import { ArrowLeft, Camera, FileCheck2, FileText, IdCard } from 'lucide-react';
import type { ReactNode } from 'react';

import type { DriverApplication } from '@/lib/api/admin';
import { formatDate, formatPhone, getInitials } from '@/lib/format';

export type DriverApplicationReviewProps = {
  application: DriverApplication;
  /** ApproveDriverForm/RejectDriverForm — passed in rather than imported
   * directly so this stays a plain presentational component the page test
   * can exercise without pulling in their client-side state. */
  approveControl: ReactNode;
  rejectControl: ReactNode;
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

function statusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status.charAt(0).toUpperCase() + status.slice(1);
}

type Document = {
  key: keyof DriverApplication;
  label: string;
  icon: typeof FileText;
};

// admin_driver_application_review/code.html + screen.png: reused for the
// identity card / document grid / bottom action bar layout. The design's
// per-document "Verified"/match-percentage badges assume a verification
// pipeline this backend does not expose (DriverApplication has no per-
// document status field), and its "Admin Notes" textarea has no backing
// field either — both are dropped rather than shipped as decoration with
// no function. Each document is a plain link to the object URL the
// backend actually returns, opened in a new tab.
const DOCUMENTS: Document[] = [
  { key: 'national_id_document', label: 'National ID Document', icon: IdCard },
  { key: 'license_document', label: 'License Document', icon: FileText },
  { key: 'live_selfie', label: 'Live Selfie', icon: Camera },
  {
    key: 'registration_doc',
    label: 'Registration Document',
    icon: FileCheck2,
  },
];

function applicantName(application: DriverApplication): {
  name: string;
  /** True when full_name was empty and the phone number is standing in for
   * it — matches AdminHeader's adminIdentity() convention of showing a
   * number in font-mono, never as if it were a name. */
  isPhoneFallback: boolean;
} {
  const trimmed = application.full_name.trim();
  if (trimmed) return { name: trimmed, isPhoneFallback: false };
  return {
    name: formatPhone(application.phone_number),
    isPhoneFallback: true,
  };
}

export function DriverApplicationReview({
  application,
  approveControl,
  rejectControl,
}: DriverApplicationReviewProps) {
  const { name, isPhoneFallback } = applicantName(application);
  const phone = formatPhone(application.phone_number);
  const hasRejectionReason = application.rejection_reason.trim().length > 0;

  return (
    <div className="flex flex-col gap-8 pb-28">
      <Link
        href="/admin/drivers"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        <span>Back to queue</span>
      </Link>

      <section className="flex flex-col items-center gap-6 rounded-xl border border-border bg-card p-6 shadow-sm md:flex-row">
        <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
          {getInitials(name) || '—'}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1
            className={`text-2xl font-bold text-foreground ${isPhoneFallback ? 'font-mono' : ''}`}
          >
            {name}
          </h1>
          <div className="mt-2 flex flex-wrap justify-center gap-4 md:justify-start">
            <span className="font-mono text-sm text-muted-foreground">
              {phone}
            </span>
            <span className="font-mono text-sm text-muted-foreground">
              {application.plate_number}
            </span>
            <span className="text-sm text-muted-foreground">
              {application.vehicle_category}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 md:items-end">
          <span className="rounded-full bg-primary-container/20 px-3 py-1 text-xs font-bold text-primary-container-foreground">
            {statusLabel(application.verification_status)}
          </span>
          <span className="text-xs text-muted-foreground">
            Submitted: {formatDate(application.submitted_at)}
          </span>
        </div>
      </section>

      {hasRejectionReason && (
        <section
          aria-label="Rejection reason"
          className="rounded-xl border border-error/30 bg-error-container p-4"
        >
          <h2 className="text-xs font-bold uppercase tracking-wide text-error">
            Rejection reason
          </h2>
          <p className="mt-1 text-sm text-error">
            {application.rejection_reason}
          </p>
        </section>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-foreground">
          Application Documents
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {DOCUMENTS.map((document) => (
            <a
              key={document.key}
              href={application[document.key] as string}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <document.icon className="size-5 text-primary" aria-hidden="true" />
              <span className="font-semibold text-foreground">
                {document.label}
              </span>
            </a>
          ))}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 p-4 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 md:flex-row">
          {rejectControl}
          {approveControl}
        </div>
      </div>
    </div>
  );
}
