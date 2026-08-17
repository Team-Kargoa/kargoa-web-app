import { redirect } from 'next/navigation';
import { getAccessToken } from '@/lib/session';
import { listPlatformConfigs } from '@/lib/api/admin';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function ConfigPage() {
  const token = await getAccessToken();
  if (!token) redirect('/signin');

  const configs = await listPlatformConfigs(token);

  return (
    <main className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Platform Configuration
        </h1>
        <p className="text-muted-foreground">
          Manage platform-wide settings and parameters
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Parameters</CardTitle>
          <CardDescription>
            {configs.length} configuration items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {configs.length > 0 ? (
              configs.map((config) => (
                <div
                  key={config.key}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="font-medium text-sm">{config.key}</div>
                  <div className="text-sm text-muted-foreground">
                    {config.description}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-xs">
                      <span className="text-muted-foreground">Value: </span>
                      <span className="font-mono font-semibold">
                        {config.value}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Type: {config.value_type}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground pt-1">
                    Last updated:{' '}
                    {config.updated_at
                      ? new Date(config.updated_at).toLocaleString()
                      : 'Never'}
                    {config.updated_by && ` by ${config.updated_by}`}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No configuration items found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
