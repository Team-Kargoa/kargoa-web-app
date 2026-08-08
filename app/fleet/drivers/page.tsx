import { getAccessToken } from '@/lib/session';
import { getDriverRoster, getVehicleRoster } from '@/lib/api/fleet';
import { DriverVehicleManager } from '@/components/fleet/driver-vehicle-manager';

export default async function FleetDriversPage() {
  const token = (await getAccessToken()) ?? '';

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
