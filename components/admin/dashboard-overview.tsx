'use client';

import Link from 'next/link';
import {
  Activity,
  ArrowUpRight,
  CarFront,
  CircleAlert,
  CreditCard,
  Ellipsis,
  Radio,
  Truck,
  UserRoundCheck,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Separator } from '@/components/ui/separator';
import { SampleDataBadge } from '@/components/sample-data-badge';

// Vehicles, trips, payments and disputes have no backend endpoint yet (the
// admin_api app only exposes drivers, platform configs and audit logs —
// apps/payments and apps/disputes are still empty stubs), so those four
// stat cards omit `href` and render as non-interactive, aria-disabled cards
// with the shared Sample data badge rather than link to a route that
// doesn't exist on disk — the same precedent already used for the sidebar's
// Fleet Approvals/Financial Oversight items (components/admin/app-sidebar.tsx).
const stats = [
  {
    label: 'Pending Driver Approvals',
    value: '24',
    detail: '8 added today',
    icon: UserRoundCheck,
    href: '/admin/drivers',
    tone: 'text-amber-700 bg-amber-500/10',
  },
  {
    label: 'Pending Vehicle Approvals',
    value: '12',
    detail: '3 awaiting insurance',
    icon: CarFront,
    tone: 'text-blue-700 bg-blue-500/10',
  },
  {
    label: 'Online Drivers',
    value: '328',
    detail: '+12.5% from yesterday',
    icon: Radio,
    href: '/admin/drivers',
    tone: 'text-emerald-700 bg-emerald-500/10',
  },
  {
    label: 'Active Trips',
    value: '186',
    detail: '24 near completion',
    icon: Truck,
    tone: 'text-violet-700 bg-violet-500/10',
  },
  {
    label: 'Today’s Revenue',
    value: 'XAF 2.48M',
    detail: '+18.2% from yesterday',
    icon: CreditCard,
    tone: 'text-primary bg-primary/10',
  },
  {
    label: 'Open Disputes',
    value: '4',
    detail: '2 require attention',
    icon: CircleAlert,
    tone: 'text-rose-700 bg-rose-500/10',
  },
];
const revenue = [
  { day: 'Mon', value: 1.2 },
  { day: 'Tue', value: 1.45 },
  { day: 'Wed', value: 1.35 },
  { day: 'Thu', value: 1.82 },
  { day: 'Fri', value: 1.68 },
  { day: 'Sat', value: 2.08 },
  { day: 'Sun', value: 2.48 },
];
const trips = [
  { day: 'Mon', completed: 142 },
  { day: 'Tue', completed: 168 },
  { day: 'Wed', completed: 153 },
  { day: 'Thu', completed: 198 },
  { day: 'Fri', completed: 187 },
  { day: 'Sat', completed: 221 },
  { day: 'Sun', completed: 246 },
];
const revenueConfig = {
  value: { label: 'Revenue (XAF M)', color: '#895100' },
} satisfies ChartConfig;
const tripsConfig = {
  completed: { label: 'Completed trips', color: '#4059aa' },
} satisfies ChartConfig;

export function DashboardOverview() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-muted-foreground">Monday, July 27, 2026</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Good morning, Admin
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here is what’s happening across KmerCargo today.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/drivers">Review approvals</Link>
        </Button>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {stats.map((stat) => {
          const cardBody = (
            <Card
              size="sm"
              className={
                stat.href
                  ? 'h-full transition-shadow group-hover:shadow-md'
                  : 'h-full'
              }
            >
              <CardHeader>
                <CardDescription className="flex flex-wrap items-center gap-1.5">
                  {stat.label}
                  {!stat.href && <SampleDataBadge />}
                </CardDescription>
                <CardAction>
                  <span
                    className={`grid size-8 place-items-center rounded-lg ${stat.tone}`}
                  >
                    <stat.icon className="size-4" aria-hidden="true" />
                  </span>
                </CardAction>
                <CardTitle className="mt-2 text-xl tabular-nums">
                  {stat.value}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowUpRight
                  className="size-3 text-emerald-600"
                  aria-hidden="true"
                />
                {stat.detail}
              </CardContent>
            </Card>
          );

          if (!stat.href) {
            return (
              <div key={stat.label} aria-disabled="true" className="rounded-xl">
                {cardBody}
              </div>
            );
          }

          return (
            <Link
              href={stat.href}
              key={stat.label}
              className="group outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
            >
              {cardBody}
            </Link>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Revenue overview</CardTitle>
            <CardDescription>
              Gross platform revenue over the last 7 days
            </CardDescription>
            <CardAction>
              <Button variant="outline" size="sm">
                Last 7 days
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueConfig} className="h-72 w-full">
              <AreaChart data={revenue} margin={{ left: -18, right: 8 }}>
                <defs>
                  <linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-value)"
                      stopOpacity={0.28}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-value)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v) => `${v}M`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  dataKey="value"
                  type="natural"
                  stroke="var(--color-value)"
                  strokeWidth={2.5}
                  fill="url(#revenue-fill)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Platform health</CardTitle>
            <CardDescription>Live service indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              ['Dispatch success', '99.2%', 'bg-emerald-500'],
              ['Payment success', '98.7%', 'bg-emerald-500'],
              ['Average response time', '1m 42s', 'bg-primary'],
              ['Driver availability', '84.1%', 'bg-blue-500'],
            ].map(([label, value, tone]) => (
              <div key={label}>
                <div className="mb-2 flex justify-between text-sm">
                  <span>{label}</span>
                  <span className="font-medium tabular-nums">{value}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${tone}`}
                    style={{
                      width: label === 'Average response time' ? '68%' : value,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Trip volume</CardTitle>
            <CardDescription>Completed trips this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={tripsConfig} className="h-60 w-full">
              <BarChart data={trips} margin={{ left: -18 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar
                  dataKey="completed"
                  fill="var(--color-completed)"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Pending approvals</CardTitle>
            <CardDescription>
              Items that need a decision from your team
            </CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/drivers">View all</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-1">
            {[
              {
                name: 'Jean Mbarga',
                type: 'Driver verification',
                time: '12 min ago',
                badge: 'Driver',
              },
              {
                name: 'Toyota Hiace · LT-841-KE',
                type: 'Vehicle insurance review',
                time: '28 min ago',
                badge: 'Vehicle',
              },
              {
                name: 'Nadia Ewane',
                type: 'Driver verification',
                time: '1 hr ago',
                badge: 'Driver',
              },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/60"
              >
                <span className="grid size-9 place-items-center rounded-full bg-muted text-sm font-medium">
                  {item.name.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.type} · {item.time}
                  </p>
                </div>
                <Badge variant="outline">{item.badge}</Badge>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`More actions for ${item.name}`}
                >
                  <Ellipsis />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              Latest actions across the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              [
                'New driver application',
                'Brenda Nkafu submitted verification documents',
                '8 min ago',
                UserRoundCheck,
              ],
              [
                'Dispute opened',
                'Customer reported an issue on trip #TRP-7821',
                '34 min ago',
                CircleAlert,
              ],
              [
                'Payout completed',
                'XAF 89,500 sent to Alain Ndom',
                '1 hr ago',
                CreditCard,
              ],
              [
                'Trip completed',
                'Douala → Buea delivery completed',
                '1 hr ago',
                Activity,
              ],
            ].map(([title, detail, time, Icon]) => (
              <div className="flex gap-3" key={String(title)}>
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted">
                  <Icon className="size-3.5 text-muted-foreground" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{String(title)}</p>
                  <p className="text-xs text-muted-foreground">
                    {String(detail)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {String(time)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent transactions</CardTitle>
            <CardDescription>
              Latest completed payments and payouts
            </CardDescription>
            <CardAction>
              {/* /admin/payments does not exist yet (apps/payments is still
                  an empty stub) — see the stats grid above for the same
                  precedent: no link to a route that isn't on disk. */}
              <Button variant="ghost" size="sm" disabled aria-disabled="true">
                View all
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              [
                'Trip payment',
                'TRP-7842 · Customer payment',
                '+ XAF 18,400',
                'Completed',
              ],
              [
                'Driver payout',
                'Alain Ndom · Withdrawal',
                '− XAF 89,500',
                'Completed',
              ],
              [
                'Platform commission',
                'TRP-7839 · 12% commission',
                '+ XAF 2,160',
                'Completed',
              ],
              [
                'Refund',
                'TRP-7781 · Dispute settlement',
                '− XAF 12,000',
                'Refunded',
              ],
            ].map(([title, detail, value, status]) => (
              <div key={String(detail)}>
                <div className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-full bg-muted">
                    <CreditCard className="size-3.5 text-muted-foreground" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{String(title)}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {String(detail)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-medium ${String(value).startsWith('+') ? 'text-emerald-700' : ''}`}
                    >
                      {String(value)}
                    </p>
                    <Badge
                      variant={status === 'Refunded' ? 'outline' : 'secondary'}
                    >
                      {String(status)}
                    </Badge>
                  </div>
                </div>
                <Separator className="mt-3 last:hidden" />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
