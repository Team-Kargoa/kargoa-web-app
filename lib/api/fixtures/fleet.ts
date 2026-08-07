// Fixture data for lib/api/fleet.ts. This dashboard's live telemetry (active
// truck counts, driver positions, weekly revenue) has no backend endpoint —
// apps/tracking and apps/admin_api are stubs (verified 2026-08-06). This
// file stands in for those responses. Delete alongside fleet.ts once the
// backend ships real fleet-telemetry routes.
import type {
  FleetSummary,
  FleetPerformanceDay,
  FleetDriver,
  FleetDriverProfile,
  FleetVehicle,
} from '../fleet';

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

// /fleet/drivers roster — matches fleet_owner_driver_vehicle_management's
// sample cards/rows exactly (design shows tab badges of 24/18 disconnected
// from the two/three rows it actually renders; this fixture's badge counts
// come from these arrays' real lengths instead).
export const DRIVER_ROSTER_FIXTURE: FleetDriverProfile[] = [
  {
    id: 'drv-101',
    name: 'Jean-Paul Ndi',
    phone: '+237670123456',
    dutyStatus: 'on-duty',
    assignedPlate: 'LT-942-KM',
    weeklyTrips: 18,
  },
  {
    id: 'drv-102',
    name: "Marie Eto'o",
    phone: '+237691987654',
    dutyStatus: 'off-duty',
    assignedPlate: 'CE-102-AQ',
    weeklyTrips: 22,
  },
];

export const VEHICLE_ROSTER_FIXTURE: FleetVehicle[] = [
  {
    id: 'veh-201',
    plate: 'LT-942-KM',
    model: 'Isuzu FSR',
    category: 'Large Cargo',
    assignedDriverName: 'Jean-Paul Ndi',
    status: 'active',
  },
  {
    id: 'veh-202',
    plate: 'CE-551-ZZ',
    model: 'Toyota Dyna',
    category: 'Mini Truck',
    assignedDriverName: null,
    status: 'maintenance',
  },
  {
    id: 'veh-203',
    plate: 'SW-220-RX',
    model: 'Hino 500',
    category: 'Heavy Duty',
    assignedDriverName: 'Samuel M.',
    status: 'needs-paperwork',
  },
];
