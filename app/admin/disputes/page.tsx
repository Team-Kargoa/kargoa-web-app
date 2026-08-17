import { redirect } from 'next/navigation';
import { getAccessToken } from '@/lib/session';
import { listDisputes } from '@/lib/api/admin';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SampleDataBadge } from '@/components/sample-data-badge';
import Link from 'next/link';

export default async function DisputesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string; page?: string }>;
}) {
  const token = await getAccessToken();
  if (!token) redirect('/signin');

  const { status, category, page } = await searchParams;
  const { data, isSample } = await listDisputes(token, {
    status: status as any,
    category: category as any,
    page: page ? Number(page) : 1,
  });

  const statusColors: Record<string, string> = {
    open: 'destructive',
    in_review: 'secondary',
    resolved: 'default',
    closed: 'outline',
  };

  return (
    <main className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dispute Center</h1>
          <p className="text-muted-foreground">
            Review and resolve customer and driver disputes
          </p>
        </div>
        {isSample && <SampleDataBadge />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Disputes</CardTitle>
          <CardDescription>{data.meta.count} total disputes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.disputes.length > 0 ? (
              data.disputes.map((dispute) => (
                <Link
                  key={dispute.id}
                  href={`/admin/disputes/${dispute.id}`}
                  className="flex items-center justify-between border rounded-lg p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium">
                      {dispute.booking.customer.full_name}
                    </div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {dispute.category.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(dispute.created_at).toLocaleString()}
                    </div>
                  </div>

                  <Badge variant={statusColors[dispute.status] as any}>
                    {dispute.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No disputes found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
