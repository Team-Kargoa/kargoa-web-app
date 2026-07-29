import { ArrowUpRight, Construction, Plus } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const modules: Record<
  string,
  { title: string; description: string; action: string }
> = {
  operations: {
    title: 'Operations',
    description: 'Monitor live fulfilment and dispatch performance.',
    action: 'View live trips',
  },
  drivers: {
    title: 'Drivers',
    description: 'Review onboarding, driver performance, and compliance.',
    action: 'Add driver',
  },
  vehicles: {
    title: 'Vehicles',
    description: 'Verify fleet documents and manage vehicle records.',
    action: 'Add vehicle',
  },
  customers: {
    title: 'Customers',
    description: 'Manage customer profiles, bookings, and account history.',
    action: 'Add customer',
  },
  trips: {
    title: 'Trips',
    description: 'Track and resolve every shipment and delivery.',
    action: 'View live trips',
  },
  payments: {
    title: 'Payments',
    description: 'Monitor revenue, commissions, payouts, and transactions.',
    action: 'Export transactions',
  },
  wallets: {
    title: 'Wallets',
    description: 'Manage driver balances, debt, and balance adjustments.',
    action: 'Adjust balance',
  },
  disputes: {
    title: 'Disputes',
    description: 'Review evidence and resolve customer and driver disputes.',
    action: 'Review disputes',
  },
  reviews: {
    title: 'Reviews',
    description: 'Track customer and driver feedback across the marketplace.',
    action: 'View ratings',
  },
  analytics: {
    title: 'Analytics',
    description: 'Analyze revenue, trip volume, growth, and platform health.',
    action: 'Create report',
  },
  settings: {
    title: 'Platform Settings',
    description:
      'Configure pricing, commission, areas, policies, and notifications.',
    action: 'Edit settings',
  },
  audit: {
    title: 'Audit Logs',
    description: 'Review administrator actions and configuration changes.',
    action: 'Export logs',
  },
  administrators: {
    title: 'Administrators',
    description: 'Manage administrator access, roles, and permissions.',
    action: 'Invite administrator',
  },
};

export function ModuleShell({ section }: { section: string }) {
  const currentModule = modules[section];

  if (!currentModule) return null;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {currentModule.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {currentModule.description}
          </p>
        </div>
        <Button>
          <Plus />
          {currentModule.action}
        </Button>
      </div>

      <Card className="min-h-80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="size-4 text-primary" />
            {currentModule.title} workspace
          </CardTitle>
          <CardDescription>
            This route is connected to the admin shell. Its complete management
            workflow is the next implementation step.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button variant="outline" asChild>
            <Link href="/admin">
              <ArrowUpRight />
              Return to dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
