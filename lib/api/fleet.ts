// FIXTURE-BACKED. apps/tracking and apps/admin_api have no live routes for
// fleet telemetry (active truck counts, driver positions, weekly revenue)
// yet — verified 2026-08-06. When those endpoints ship, replace these
// bodies with apiRequest calls. Signatures must not change — screens depend
// on them.

import {
  FLEET_SUMMARY_FIXTURE,
  WEEKLY_PERFORMANCE_FIXTURE,
  ACTIVE_DRIVERS_FIXTURE,
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

export function getFleetSummary(token: string): Promise<FleetSummary> {
  void token;
  return Promise.resolve(FLEET_SUMMARY_FIXTURE);
}

export function getWeeklyPerformance(
  token: string,
): Promise<FleetPerformanceDay[]> {
  void token;
  return Promise.resolve(WEEKLY_PERFORMANCE_FIXTURE);
}

export function getActiveDrivers(token: string): Promise<FleetDriver[]> {
  void token;
  return Promise.resolve(ACTIVE_DRIVERS_FIXTURE);
}
