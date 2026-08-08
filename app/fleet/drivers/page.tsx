import { redirect } from 'next/navigation';
import { getAccessToken } from '@/lib/session';
import { getDriverRoster, getVehicleRoster } from '@/lib/api/fleet';
import { DriverVehicleManager } from '@/components/fleet/driver-vehicle-manager';

export default async function FleetDriversPage() {
  // app/fleet/layout.tsx already gates this whole tree on a signed-in
  // fleet_owner; this is defence in depth, same as app/admin's pages, and
  // makes a missing token structurally impossible rather than papered
  // over with `?? ''` (which turned a 401 into a fixture fallback).
  const token = await getAccessToken();
  if (!token) redirect('/signin');

  const [drivers, vehicles] = await Promise.all([
    getDriverRoster(token),
    getVehicleRoster(token),
  ]);

  return (
    <main className="p-4 md:p-8 pb-24 md:pb-8">
      <DriverVehicleManager
        drivers={drivers.data}
        vehicles={vehicles.data}
        isDriversSample={drivers.isSample}
        isVehiclesSample={vehicles.isSample}
      />
    </main>
  );
}
