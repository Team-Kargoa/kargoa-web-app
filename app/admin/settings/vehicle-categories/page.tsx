import { redirect } from 'next/navigation';
import { getAccessToken } from '@/lib/session';
import { listVehicleCategories } from '@/lib/api/admin';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SampleDataBadge } from '@/components/sample-data-badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { formatXaf } from '@/lib/format';

export default async function VehicleCategoriesPage() {
  const token = await getAccessToken();
  if (!token) redirect('/signin');

  const { data, isSample } = await listVehicleCategories(token);

  return (
    <main className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Vehicle Categories
          </h1>
          <p className="text-muted-foreground">
            Manage vehicle types and fare structures
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSample && <SampleDataBadge />}
          <Button gap-2>
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.length > 0 ? (
          data.map((category) => (
            <Card key={category.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <Badge variant={category.is_active ? 'default' : 'secondary'}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Fare</span>
                    <span className="font-semibold">
                      {formatXaf(category.base_fare)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Per KM Rate</span>
                    <span className="font-semibold">
                      {formatXaf(category.per_km_rate)} / km
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-muted-foreground">Minimum Fare</span>
                    <span className="font-semibold">
                      {formatXaf(category.minimum_fare)}
                    </span>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  Edit
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <p>No vehicle categories found</p>
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create First Category
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
