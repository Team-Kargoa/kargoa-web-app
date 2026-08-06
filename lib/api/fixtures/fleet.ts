// Fixture data for lib/api/fleet.ts. This dashboard's live telemetry (active
// truck counts, driver positions, weekly revenue) has no backend endpoint —
// apps/tracking and apps/admin_api are stubs (verified 2026-08-06). This
// file stands in for those responses. Delete alongside fleet.ts once the
// backend ships real fleet-telemetry routes.
import type { FleetSummary, FleetPerformanceDay, FleetDriver } from '../fleet';

export const FLEET_SUMMARY_FIXTURE: FleetSummary = {
  activeTrucks: 8,
  totalTrucks: 12,
  offlineForMaintenance: 4,
  earningsTrend: '+12.4% vs last week',
  pendingVerifications: 3,
  pendingVerificationInitials: ['JD', 'SM', 'AA'],
};

export const WEEKLY_PERFORMANCE_FIXTURE: FleetPerformanceDay[] = [
  { day: 'Mon', amount: 120000 },
  { day: 'Tue', amount: 185000 },
  { day: 'Wed', amount: 150000 },
  { day: 'Thu', amount: 240000 },
  { day: 'Fri', amount: 190000 },
  { day: 'Sat', amount: 130000 },
  { day: 'Sun', amount: 90000 },
];

export const ACTIVE_DRIVERS_FIXTURE: FleetDriver[] = [
  {
    id: 'drv-1',
    name: 'Jean-Paul N.',
    verificationStatus: 'Verified',
    location: 'Yaoundé',
    vehicleId: 'CE-982-LU',
    route: 'Yaoundé → Douala',
    status: 'on-trip',
  },
  {
    id: 'drv-2',
    name: "Samuel Eto'o",
    verificationStatus: 'Verified',
    location: 'Edéa',
    vehicleId: 'LT-110-AA',
    route: 'Idle (Rest Stop)',
    status: 'online',
  },
  {
    id: 'drv-3',
    name: 'Moussa Traoré',
    verificationStatus: 'Maintenance',
    location: 'Bafoussam',
    vehicleId: 'OU-445-BB',
    route: 'Not Assigned',
    status: 'offline',
  },
];
