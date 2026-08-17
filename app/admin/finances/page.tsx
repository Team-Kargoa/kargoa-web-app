import { redirect } from 'next/navigation';
import { getAccessToken } from '@/lib/session';
import { getFinancialOverview } from '@/lib/api/admin';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SampleDataBadge } from '@/components/sample-data-badge';
import { formatXaf } from '@/lib/format';
import { DollarSign, TrendingUp, Users } from 'lucide-react';

export default async function FinancesPage() {
  const token = await getAccessToken();
  if (!token) redirect('/signin');

  const { data, isSample } = await getFinancialOverview(token);

  const stats = [
    {
      label: 'Total Revenue',
      value: formatXaf(data.total_revenue_fcfa),
      icon: DollarSign,
      tone: 'primary',
    },
    {
      label: 'Commission Collected',
      value: formatXaf(data.total_commission_fcfa),
      icon: TrendingUp,
      tone: 'secondary',
    },
    {
      label: 'Outstanding Debts',
      value: formatXaf(Math.abs(data.outstanding_driver_debts_fcfa)),
      icon: Users,
      tone: 'danger',
    },
  ];

  return (
    <main className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Financial Overview
          </h1>
          <p className="text-muted-foreground">
            Platform revenue and commission tracking
          </p>
        </div>
        {isSample && <SampleDataBadge />}
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Trip Summary</CardTitle>
            <CardDescription>
              Split between cash and digital payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cash Trips</span>
              <span className="font-semibold">{data.total_cash_trips}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Digital Trips</span>
              <span className="font-semibold">{data.total_digital_trips}</span>
            </div>
            <div className="border-t pt-4 flex justify-between">
              <span className="font-medium">Total Trips</span>
              <span className="font-semibold">
                {data.total_cash_trips + data.total_digital_trips}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Operations</CardTitle>
            <CardDescription>Funds awaiting driver withdrawal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pending Withdrawals</span>
              <span className="font-semibold">
                {formatXaf(data.pending_withdrawals_fcfa)}
              </span>
            </div>
            <div className="border-t pt-4 text-sm text-muted-foreground">
              Period: {data.period_from} to {data.period_to}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
