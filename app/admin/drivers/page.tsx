import { redirect } from 'next/navigation';

import { getAccessToken } from '@/lib/session';
import { listDriverApplications } from '@/lib/api/admin';
import { DriverApplicationQueue } from '@/components/admin/driver-application-queue';

export default async function AdminDriversPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const token = await getAccessToken();
  if (!token) redirect('/signin');

  const { status, page } = await searchParams;
  const { applications, meta } = await listDriverApplications(token, {
    status,
    page: page ? Number(page) : undefined,
  });

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <DriverApplicationQueue
        applications={applications}
        meta={meta}
        status={status}
      />
    </main>
  );
}
