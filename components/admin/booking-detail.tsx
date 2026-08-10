import Link from 'next/link';
import { ArrowLeft, MapPin, Route as RouteIcon, Star } from 'lucide-react';

import type {
  AdminBookingSummary,
  BookingLiveLocation,
  BookingRoute,
  Rating,
} from '@/lib/api/bookings';
import { formatDate, formatPhone, formatXaf } from '@/lib/format';

export type BookingDetailProps = {
  booking: AdminBookingSummary;
  /** null when there's no assigned driver yet, or nothing cached in the
   * last 60s — both normal states, not errors (see getBookingLocation). */
  location: BookingLiveLocation | null;
  route: BookingRoute;
  ratings: Rating[];
};

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

/**
 * Ratings carry rater_id/ratee_id, not a role — this is the only place
 * that knows both a booking's driver identity (via the nested
 * driver.user.id) and its ratings, so it's the only place that can label
 * "Customer → Driver" vs "Driver → Customer" correctly.
 */
function ratingDirection(rating: Rating, booking: AdminBookingSummary): string {
  const driverUserId = booking.driver?.user.id;
  if (driverUserId && rating.ratee_id === driverUserId) {
    return 'Customer → Driver';
  }
  if (driverUserId && rating.rater_id === driverUserId) {
    return 'Driver → Customer';
  }
  return 'Trip rating';
}

function Stars({ score }: { score: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${score} of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`size-4 ${i < score ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export function BookingDetail({
  booking,
  location,
  route,
  ratings,
}: BookingDetailProps) {
  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/admin/bookings"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        <span>Back to bookings</span>
      </Link>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {booking.vehicle_category.name}
            </h1>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {booking.id}
            </p>
          </div>
          {statusBadge(booking.status)}
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Pickup
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {booking.pickup_address}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Dropoff
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {booking.dropoff_address}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Fare
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {formatXaf(booking.final_fare ?? booking.estimated_fare)}
              {!booking.final_fare && (
                <span className="ml-1 text-xs text-muted-foreground">
                  (estimated)
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Distance
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {booking.distance_km ? `${booking.distance_km} km` : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Payment
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {booking.payment_method} · {booking.payment_status}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Driver
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {booking.driver ? (
                <>
                  {booking.driver.user.full_name ||
                    formatPhone(booking.driver.user.phone_number)}
                  {booking.driver.vehicle && (
                    <span className="ml-1 font-mono text-xs text-muted-foreground">
                      ({booking.driver.vehicle.plate_number})
                    </span>
                  )}
                </>
              ) : (
                'Unassigned'
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Created
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {formatDate(booking.created_at)}
            </dd>
          </div>
          {booking.accepted_at && (
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Accepted
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {formatDate(booking.accepted_at)}
              </dd>
            </div>
          )}
          {booking.completed_at && (
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Completed
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {formatDate(booking.completed_at)}
              </dd>
            </div>
          )}
        </dl>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <MapPin className="size-4 text-primary" aria-hidden="true" />
            Live Position
          </h2>
          {location ? (
            <div className="mt-3 space-y-1 text-sm text-foreground">
              <p className="font-mono">
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </p>
              <p className="text-xs text-muted-foreground">
                As of {formatDate(location.ts)}
                {location.heading != null && ` · heading ${location.heading}°`}
                {location.speed != null && ` · ${location.speed} km/h`}
              </p>
              <p className="text-xs text-muted-foreground">
                Approximate position (~200m) for admin oversight — the customer
                sees the exact point.
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              No live position available — either no driver is assigned yet, or
              nothing has been reported in the last 60 seconds.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <RouteIcon className="size-4 text-primary" aria-hidden="true" />
            Recorded Route
          </h2>
          {route.point_count > 0 ? (
            <div className="mt-3 space-y-1 text-sm text-foreground">
              <p>{route.point_count} points recorded</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(route.points[0].ts)} –{' '}
                {formatDate(route.points[route.points.length - 1].ts)}
              </p>
              {route.truncated && (
                <p className="text-xs font-semibold text-amber-700">
                  This route was truncated — not every recorded point is
                  included.
                </p>
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              No route has been recorded for this trip yet.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-sm font-bold text-foreground">Ratings</h2>
        {ratings.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No ratings yet — the 48-hour rating window may still be open.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-4">
            {ratings.map((rating) => (
              <li
                key={rating.id}
                className="flex flex-col gap-1 border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {ratingDirection(rating, booking)}
                  </span>
                  <Stars score={rating.score} />
                </div>
                {rating.comment && (
                  <p className="text-sm text-foreground">{rating.comment}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formatDate(rating.created_at)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
