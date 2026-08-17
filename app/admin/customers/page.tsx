import { redirect } from 'next/navigation';
import { getAccessToken } from '@/lib/session';
import { listCustomers } from '@/lib/api/admin';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SampleDataBadge } from '@/components/sample-data-badge';

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const token = await getAccessToken();
  if (!token) redirect('/signin');

  const { page, search } = await searchParams;
  const { data, isSample } = await listCustomers(token, {
    page: page ? Number(page) : 1,
    search,
  });

  return (
    <main className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Customer Management
          </h1>
          <p className="text-muted-foreground">
            View and manage customer accounts
          </p>
        </div>
        {isSample && <SampleDataBadge />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
          <CardDescription>{data.meta.count} total customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.users.length > 0 ? (
              data.users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between border rounded-lg p-4"
                >
                  <div className="flex-1">
                    <div className="font-medium">{user.full_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.phone_number}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Joined {new Date(user.date_joined).toLocaleDateString()}
                    </div>
                  </div>

                  <Badge variant={user.is_active ? 'default' : 'secondary'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No customers found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
