import Link from 'next/link';
import { Eye } from 'lucide-react';

import type { PaginationMeta } from '@/lib/api/admin';
import type { AdminBookingSummary } from '@/lib/api/bookings';
import { formatDate, formatXaf } from '@/lib/format';

export type BookingListProps = {
  bookings: AdminBookingSummary[];
  meta: PaginationMeta;
  /** The active `?status=` filter, or undefined for "All". */
  status?: string;
};

// Booking.Status has 8 values (apps/bookings/models.py) — rather than one
// filter link per value, these are the ones an admin actually scans for
// day to day; the rest stay reachable by editing the URL's ?status= param
// directly, same escape hatch the design already relies on elsewhere.
const STATUS_FILTERS: { value?: string; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'pending_dispatch', label: 'Pending Dispatch' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'dispatch_failed', label: 'Dispatch Failed' },
];

const STATUS_META: Record<string, { label: string; className: string }> = {
  pending_dispatch: {
    label: 'Pending Dispatch',
    className:
      'bg-primary-container/20 text-primary-container-foreground border border-primary-container/40',
  },
  driver_accepted: {
    label: 'Driver Accepted',
    className: 'bg-blue-500/10 text-blue-700 border border-blue-500/30',
  },
  driver_en_route: {
    label: 'En Route',
    className: 'bg-blue-500/10 text-blue-700 border border-blue-500/30',
  },
  arrived_at_pickup: {
    label: 'Arrived',
    className: 'bg-blue-500/10 text-blue-700 border border-blue-500/30',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-violet-500/10 text-violet-700 border border-violet-500/30',
  },
  completed: {
    label: 'Completed',
    className:
      'bg-success-momo/10 text-success-momo border border-success-momo/30',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-muted text-muted-foreground border border-border',
  },
  dispatch_failed: {
    label: 'Dispatch Failed',
    className: 'bg-error-container text-error border border-error/30',
  },
};

function statusBadge(status: string) {
  const meta = STATUS_META[status] ?? {
    label: status,
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
  return query ? `/admin/bookings?${query}` : '/admin/bookings';
}

function driverLabel(booking: AdminBookingSummary): string {
  return booking.driver?.vehicle?.plate_number ?? 'Unassigned';
}

export function BookingList({ bookings, meta, status }: BookingListProps) {
  const start = meta.count === 0 ? 0 : (meta.page - 1) * meta.page_size + 1;
  const end = Math.min(meta.page * meta.page_size, meta.count);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Bookings
        </h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Every trip on the platform, across every customer and driver.
        </p>
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
                  Pickup
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Dropoff
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Fare
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Driver
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
                  Created
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
              {bookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-sm text-muted-foreground"
                  >
                    No bookings match this filter.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-muted/40">
                    <td className="max-w-48 truncate px-6 py-4 text-sm text-foreground">
                      {booking.pickup_address}
                    </td>
                    <td className="max-w-48 truncate px-6 py-4 text-sm text-foreground">
                      {booking.dropoff_address}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {formatXaf(booking.estimated_fare)}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-muted-foreground">
                      {driverLabel(booking)}
                    </td>
                    <td className="px-6 py-4">{statusBadge(booking.status)}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(booking.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold text-primary hover:bg-muted"
                      >
                        <Eye className="size-4" aria-hidden="true" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
            Showing {start}-{end} of {meta.count} bookings
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
