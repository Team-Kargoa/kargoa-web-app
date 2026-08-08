import { notFound, redirect } from 'next/navigation';

import { getAccessToken } from '@/lib/session';
import { getDriverApplication } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { DriverApplicationReview } from '@/components/admin/driver-application-review';
import { ApproveDriverForm } from './approve-driver-form';
import { RejectDriverForm } from './reject-driver-form';

export default async function AdminDriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const token = await getAccessToken();
  if (!token) redirect('/signin');

  const { id } = await params;

  let application;
  try {
    application = await getDriverApplication(token, id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <main className="p-4 md:p-8">
      <DriverApplicationReview
        application={application}
        approveControl={<ApproveDriverForm id={id} />}
        rejectControl={<RejectDriverForm id={id} />}
      />
    </main>
  );
}
