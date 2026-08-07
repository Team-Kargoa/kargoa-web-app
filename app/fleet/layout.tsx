import { FleetNav } from '@/components/fleet/fleet-nav';

export default function FleetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <FleetNav />
      <div className="md:pl-64">{children}</div>
    </div>
  );
}
