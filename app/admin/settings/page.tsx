import { redirect } from 'next/navigation';

import { getAccessToken } from '@/lib/session';
import { listPlatformConfigs } from '@/lib/api/admin';
import { PlatformConfigForm } from './platform-config-form';

export default async function AdminSettingsPage() {
  const token = await getAccessToken();
  if (!token) redirect('/signin');

  const configs = await listPlatformConfigs(token);

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Platform Settings
        </h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Configure operational limits and platform behaviour. Changes apply
          immediately.
        </p>
      </div>

      {configs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No platform configuration values are available.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {configs.map((config) => (
            <PlatformConfigForm key={config.key} config={config} />
          ))}
        </ul>
      )}
    </main>
  );
}
