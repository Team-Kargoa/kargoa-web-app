// LIVE-WITH-FALLBACK. apps/tracking and apps/admin_api have no live routes
// for fleet telemetry (active truck counts, driver positions, weekly
// revenue) yet — verified 2026-08-06. Every function below attempts its
// guessed /tracking/* or /fleet/* path via withFallback and only falls
// back to its fixture when that call errors or returns something empty.
// The fixture disappears on its own, with no code change needed here, the
// moment the backend actually serves the route. Signatures now return
// Sourced<T> (`{ data, isSample }`) instead of T — callers must read
// `.data` and may read `.isSample` to show that a section is showing
// sample data.

import { apiRequest } from './client';
import { withFallback, type Sourced } from './with-fallback';
import {
  FLEET_SUMMARY_FIXTURE,
  WEEKLY_PERFORMANCE_FIXTURE,
  ACTIVE_DRIVERS_FIXTURE,
  DRIVER_ROSTER_FIXTURE,
  VEHICLE_ROSTER_FIXTURE,
} from './fixtures/fleet';

export type FleetSummary = {
  activeTrucks: number;
  totalTrucks: number;
  offlineForMaintenance: number;
  earningsTrend: string;
  pendingVerifications: number;
  pendingVerificationInitials: string[];
};

export type FleetPerformanceDay = {
  day: string;
  amount: number;
};

export type FleetDriverStatus = 'on-trip' | 'online' | 'offline';

export type FleetDriver = {
  id: string;
  name: string;
  verificationStatus: string;
  location: string;
  vehicleId: string;
  route: string;
  status: FleetDriverStatus;
};

export function getFleetSummary(
  token: string,
): Promise<Sourced<FleetSummary>> {
  return withFallback(
    () => apiRequest<FleetSummary>('/tracking/fleet-summary', { token }),
    FLEET_SUMMARY_FIXTURE,
  );
}

export function getWeeklyPerformance(
  token: string,
): Promise<Sourced<FleetPerformanceDay[]>> {
  return withFallback(
    () =>
      apiRequest<FleetPerformanceDay[]>('/tracking/weekly-performance', {
        token,
      }),
    WEEKLY_PERFORMANCE_FIXTURE,
  );
}

export function getActiveDrivers(
  token: string,
): Promise<Sourced<FleetDriver[]>> {
  return withFallback(
    () => apiRequest<FleetDriver[]>('/tracking/active-drivers', { token }),
    ACTIVE_DRIVERS_FIXTURE,
  );
}

// --- /fleet/drivers (Driver & Vehicle Management) ---

export type DriverDutyStatus = 'on-duty' | 'off-duty';

export type FleetDriverProfile = {
  id: string;
  name: string;
  /** E.164, rendered through formatPhone. */
  phone: string;
  dutyStatus: DriverDutyStatus;
  assignedPlate: string;
  weeklyTrips: number;
};

export type VehicleOperationalStatus =
  'active' | 'maintenance' | 'needs-paperwork';

export type FleetVehicle = {
  id: string;
  plate: string;
  model: string;
  category: string;
  /** null when no driver is currently assigned to this vehicle. */
  assignedDriverName: string | null;
  status: VehicleOperationalStatus;
};

export function getDriverRoster(
  token: string,
): Promise<Sourced<FleetDriverProfile[]>> {
  return withFallback(
    () => apiRequest<FleetDriverProfile[]>('/fleet/drivers', { token }),
    DRIVER_ROSTER_FIXTURE,
  );
}

export function getVehicleRoster(
  token: string,
): Promise<Sourced<FleetVehicle[]>> {
  return withFallback(
    () => apiRequest<FleetVehicle[]>('/fleet/vehicles', { token }),
    VEHICLE_ROSTER_FIXTURE,
  );
}
