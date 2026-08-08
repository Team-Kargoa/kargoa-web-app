import Link from 'next/link';
import { Eye } from 'lucide-react';

import type { DriverApplication, PaginationMeta } from '@/lib/api/admin';
import { formatDate, formatPhone } from '@/lib/format';

export type DriverApplicationQueueProps = {
  applications: DriverApplication[];
  meta: PaginationMeta;
  /** The active `?status=` filter, or undefined for "All". */
  status?: string;
};

// admin_fleet_approval_queue/code.html + screen.png: reused for layout,
// table treatment and the SHOWING x-y OF n line, but that design is drawn
// for fleet applications (organization, fleet size, region). Driver
// applications have no equivalent fields, so the table binds to the
// DriverApplication shape instead: NAME (falls back to the formatted
// phone), PHONE, PLATE, VEHICLE CATEGORY, STATUS, SUBMITTED. The design's
// region dropdown and free-text search box have no backing field/endpoint
// on drivers, so they're dropped rather than shipped as decoration with no
// function; the status dropdown becomes plain filter links (?status=) so
// the queue works with server-rendered navigation instead of client JS.
const STATUS_FILTERS: { value?: string; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
];

const STATUS_META: Record<string, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className:
      'bg-primary-container/20 text-primary-container-foreground border border-primary-container/40',
  },
  approved: {
    label: 'Approved',
    className:
      'bg-success-momo/10 text-success-momo border border-success-momo/30',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-error-container text-error border border-error/30',
  },
};

function statusBadge(status: string) {
  const meta = STATUS_META[status] ?? {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    className: 'bg-muted text-muted-foreground border border-border',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

function buildHref(status: string | undefined, page: number | undefined) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (page && page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `/admin/drivers?${query}` : '/admin/drivers';
}

function applicantName(application: DriverApplication): string {
  const trimmed = application.full_name.trim();
  return trimmed || formatPhone(application.phone_number);
}

export function DriverApplicationQueue({
  applications,
  meta,
  status,
}: DriverApplicationQueueProps) {
  const start = meta.count === 0 ? 0 : (meta.page - 1) * meta.page_size + 1;
  const end = Math.min(meta.page * meta.page_size, meta.count);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Driver Verification Queue
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Review driver applications and documents before they can accept
            trips.
          </p>
        </div>
      </div>

      <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => {
          const active = filter.value === status;
          return (
            <Link
              key={filter.label}
              href={buildHref(filter.value, undefined)}
              aria-current={active ? 'page' : undefined}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Phone
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Plate
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Vehicle Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Submitted
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {applications.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-sm text-muted-foreground"
                  >
                    No driver applications match this filter.
                  </td>
                </tr>
              ) : (
                applications.map((application) => {
                  const name = applicantName(application);
                  return (
                    <tr key={application.id} className="hover:bg-muted/40">
                      <td className="px-6 py-4 font-semibold text-foreground">
                        {name}
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-muted-foreground">
                        {formatPhone(application.phone_number)}
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-muted-foreground">
                        {application.plate_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {application.vehicle_category}
                      </td>
                      <td className="px-6 py-4">
                        {statusBadge(application.verification_status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {formatDate(application.submitted_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/drivers/${application.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold text-primary hover:bg-muted"
                        >
                          <Eye className="size-4" aria-hidden="true" />
                          <span>View {name}</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
            Showing {start}-{end} of {meta.count} applications
          </p>
          <div className="flex items-center gap-2">
            {meta.page > 1 ? (
              <Link
                href={buildHref(status, meta.page - 1)}
                aria-label="Previous page"
                className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Previous
              </Link>
            ) : null}
            {meta.page < meta.total_pages ? (
              <Link
                href={buildHref(status, meta.page + 1)}
                aria-label="Next page"
                className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Next
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
