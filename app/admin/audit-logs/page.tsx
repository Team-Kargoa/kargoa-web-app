import { redirect } from 'next/navigation';

import { getAccessToken } from '@/lib/session';
import { listAuditLogs } from '@/lib/api/admin';
import { AuditLogList } from '@/components/admin/audit-log-list';

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const token = await getAccessToken();
  if (!token) redirect('/signin');

  const { page } = await searchParams;
  const { logs, meta } = await listAuditLogs(token, {
    page: page ? Number(page) : undefined,
  });

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <AuditLogList logs={logs} meta={meta} />
    </main>
  );
}
