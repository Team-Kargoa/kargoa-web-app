import { redirect } from 'next/navigation';

import { getAccessToken } from '@/lib/session';
import { getOverview } from '@/lib/api/admin';
import { DashboardOverview } from '@/components/admin/dashboard-overview';

export default async function AdminPage() {
  // app/admin/layout.tsx already gates this whole tree on a signed-in
  // admin; this is defence in depth, same as every other /admin page.
  const token = await getAccessToken();
  if (!token) redirect('/signin');

  const { data, isSample } = await getOverview(token);

  return <DashboardOverview overview={data} isSample={isSample} />;
}
