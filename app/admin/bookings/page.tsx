import { redirect } from 'next/navigation';

import { getAccessToken } from '@/lib/session';
import { listBookings } from '@/lib/api/bookings';
import { BookingList } from '@/components/admin/booking-list';

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const token = await getAccessToken();
  if (!token) redirect('/signin');

  const { status, page } = await searchParams;
  const { bookings, meta } = await listBookings(token, {
    status,
    page: page ? Number(page) : undefined,
  });

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <BookingList bookings={bookings} meta={meta} status={status} />
    </main>
  );
}
