// LIVE — no fallback. apps.bookings, apps.tracking and apps.ratings are
// all real and tested (verified against the running Django code, not just
// api_spec.yaml, which has drifted from reality before on this project —
// see the note at the top of admin.ts). Grouped in one file rather than
// split per backend app because every function here backs a single admin
// feature (booking oversight: the trip, its live position/route, and its
// ratings), consumed together by app/admin/bookings/[id]/page.tsx.

import { apiRequest, ApiError } from './client';
import type { PaginationMeta } from './admin';

export type AdminBookingSummary = {
  id: string;
  status: string;
  pickup_location: { latitude: number; longitude: number };
  pickup_address: string;
  dropoff_location: { latitude: number; longitude: number };
  dropoff_address: string;
  vehicle_category: { id: string; name: string };
  /** Decimal fields are strings on the wire (DRF default) — never parsed
   * with `+` or arithmetic without going through Number() first. */
  estimated_fare: string;
  final_fare: string | null;
  distance_km: string | null;
  payment_method: string;
  payment_status: string;
  // DriverProfileSummarySerializer (apps/onboarding/serializers.py) — the
  // nested user.id is what a Rating's rater_id/ratee_id is checked
  // against to tell a customer's rating of the driver apart from the
  // driver's rating of the customer (Rating itself carries no role).
  driver: {
    id: string;
    user: { id: string; full_name: string; phone_number: string };
    vehicle: { plate_number: string } | null;
  } | null;
  created_at: string;
  accepted_at: string | null;
  completed_at: string | null;
};

export type BookingLiveLocation = {
  latitude: number;
  longitude: number;
  heading: number | null;
  speed: number | null;
  ts: string;
  /** Always false for an admin viewer — apps.tracking fuzzes admin
   * oversight positions by ~200m; only the assigned customer gets true. */
  precise: boolean;
};

export type RoutePoint = {
  lat: number;
  lng: number;
  heading: number | null;
  speed: number | null;
  ts: string;
};

export type BookingRoute = {
  booking_id: string;
  point_count: number;
  truncated: boolean;
  points: RoutePoint[];
};

export type Rating = {
  id: string;
  booking_id: string;
  rater_id: string;
  ratee_id: string;
  score: number;
  comment: string;
  created_at: string;
};

function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

/** GET /bookings — role-scoped server-side; an admin token sees every
 * booking on the platform, not just their own. */
export function listBookings(
  token: string,
  options: { status?: string; page?: number } = {},
): Promise<{ bookings: AdminBookingSummary[]; meta: PaginationMeta }> {
  const query = buildQuery({ status: options.status, page: options.page });
  return apiRequest<{ meta: PaginationMeta; bookings: AdminBookingSummary[] }>(
    `/bookings${query}`,
    { token },
  );
}

export function getBooking(
  token: string,
  id: string,
): Promise<AdminBookingSummary> {
  return apiRequest<AdminBookingSummary>(`/bookings/${id}`, { token });
}

/**
 * The driver's latest position for this trip, or `null` when there simply
 * isn't one to show yet — no driver assigned, or nothing cached in the
 * last 60s (apps.tracking.api.views.BookingLocationView). Both are normal,
 * frequent states for a booking, not failures the page should treat as an
 * error.
 */
export async function getBookingLocation(
  token: string,
  id: string,
): Promise<BookingLiveLocation | null> {
  try {
    return await apiRequest<BookingLiveLocation>(
      `/tracking/bookings/${id}/location`,
      { token },
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** The trip's recorded polyline. Admins can always see it (same rule as
 * the assigned customer/driver) — an empty `points` array just means
 * nothing was recorded yet, not an error. */
export function getBookingRoute(
  token: string,
  id: string,
): Promise<BookingRoute> {
  return apiRequest<BookingRoute>(`/tracking/bookings/${id}/route`, {
    token,
  });
}

/** Both directions of this trip's ratings (customer→driver and
 * driver→customer) — whichever ones exist; an empty array means nobody
 * has rated yet (the 48h window may still be open). */
export function getBookingRatings(
  token: string,
  id: string,
): Promise<Rating[]> {
  return apiRequest<{ ratings: Rating[] }>(`/ratings/bookings/${id}`, {
    token,
  }).then((result) => result.ratings);
}
