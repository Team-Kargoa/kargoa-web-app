import { notFound, redirect } from 'next/navigation';

import { getAccessToken } from '@/lib/session';
import {
  getBooking,
  getBookingLocation,
  getBookingRoute,
  getBookingRatings,
} from '@/lib/api/bookings';
import { ApiError } from '@/lib/api/client';
import { BookingDetail } from '@/components/admin/booking-detail';

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const token = await getAccessToken();
  if (!token) redirect('/signin');

  const { id } = await params;

  let booking;
  try {
    booking = await getBooking(token, id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const [location, route, ratings] = await Promise.all([
    getBookingLocation(token, id),
    getBookingRoute(token, id),
    getBookingRatings(token, id),
  ]);

  return (
    <main className="p-4 md:p-8">
      <BookingDetail
        booking={booking}
        location={location}
        route={route}
        ratings={ratings}
      />
    </main>
  );
}
