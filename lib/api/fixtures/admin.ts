// Fixture data for the FIXTURE-BACKED half of lib/api/admin.ts — the admin
// overview/dashboard summary, fleet applications, document inspection and
// team management, none of which apps/admin_api implements yet (verified
// live 2026-08-07, alongside the drivers/configs/audit-logs endpoints that
// did go live and are no longer fixture-backed — see lib/api/admin.ts).
//
// OVERVIEW_FIXTURE's shape mirrors /admin/overview in api_spec.yaml exactly
// (active_trips, online_drivers, bookings_last_24h, revenue_last_24h_fcfa,
// open_disputes, pending_approvals, as_of) — that endpoint is spec'd even
// though unbuilt. FLEET_APPLICATIONS_FIXTURE is transcribed verbatim from
// admin_fleet_approval_queue/screen.png. DOCUMENT_FIXTURE and TEAM_FIXTURE
// are drawn from their respective design screens (admin_document_inspector,
// admin_team_management) — neither has a matching path in api_spec.yaml at
// all, so their shapes are scaffolding, not contract.
// Delete alongside admin.ts's fixture-backed group once the backend ships
// these remaining routes.
import type {
  AdminOverview,
  FleetApplication,
  DocumentRecord,
  TeamMember,
  UserSummary,
  BookingSummary,
  BookingDetail,
  FinancialOverview,
  WalletEntry,
  DisputeSummary,
  DisputeDetail,
  VehicleCategory,
  PaginationMeta,
  DriverApplication,
} from '../admin';

export const OVERVIEW_FIXTURE: AdminOverview = {
  active_trips: 47,
  online_drivers: 132,
  bookings_last_24h: 286,
  revenue_last_24h_fcfa: 5297250,
  open_disputes: 3,
  pending_approvals: 28,
  as_of: '2026-08-07T09:00:00Z',
};

// admin_fleet_approval_queue/screen.png, rows verbatim (accents preserved).
export const FLEET_APPLICATIONS_FIXTURE: FleetApplication[] = [
  {
    id: 'app-1',
    organization: 'Société de Transport Littoral',
    reference: 'KMER-88219',
    fleet_size: 24,
    region: 'Douala',
    applied_date: '12/05/2024',
    status: 'pending_review',
  },
  {
    id: 'app-2',
    organization: 'Mfoundi Express Logistics',
    reference: 'KMER-10992',
    fleet_size: 8,
    region: 'Yaoundé',
    applied_date: '11/05/2024',
    status: 'under_verification',
  },
  {
    id: 'app-3',
    organization: 'Rapid Cargo North',
    reference: 'KMER-55410',
    fleet_size: 42,
    region: 'Garoua',
    applied_date: '10/05/2024',
    status: 'flagged',
  },
  {
    id: 'app-4',
    organization: 'West Region Transporters Co-op',
    reference: 'KMER-99032',
    fleet_size: 115,
    region: 'Bafoussam',
    applied_date: '09/05/2024',
    status: 'pending_review',
  },
];

// admin_document_inspector/screen.png — the Vehicle Registration document
// opened from that same driver application.
export const DOCUMENT_FIXTURE: DocumentRecord = {
  id: 'doc-1',
  document_type: 'Vehicle Registration (Carte Grise)',
  file_url:
    'https://fixtures.kargoa.local/documents/vehicle-registration-1.jpg',
  file_size_mb: 2.4,
  format: 'JPEG (High Res)',
  uploaded_at: '2023-10-24T14:32:05Z',
  camera_metadata: 'TECNO Camon 19 · ISO 200',
};

// admin_team_management/screen.png, rows verbatim.
export const TEAM_FIXTURE: TeamMember[] = [
  {
    id: 'team-1',
    name: 'Jean Ngassam',
    email: 'j.ngassam@kmercargo.cm',
    role: 'super_admin',
    last_active: '2 mins ago',
    status: 'active',
  },
  {
    id: 'team-2',
    name: "Marie Eto'o",
    email: 'm.etoo@kmercargo.cm',
    role: 'admin',
    last_active: '1 hour ago',
    status: 'active',
  },
  {
    id: 'team-3',
    name: 'Pierre Kamdem',
    email: 'p.kamdem@kmercargo.cm',
    role: 'admin',
    last_active: 'Yesterday',
    status: 'inactive',
  },
  {
    id: 'team-4',
    name: 'Samuel Tagne',
    email: 's.tagne@kmercargo.cm',
    role: 'super_admin',
    last_active: '3 days ago',
    status: 'active',
  },
];

// --- Additional fixtures for new features ---

export const CUSTOMERS_FIXTURE: UserSummary[] = [
  {
    id: 'cust-1',
    phone_number: '+237612345678',
    full_name: 'Alice Onana',
    is_active: true,
    date_joined: '2026-01-15T10:30:00Z',
  },
  {
    id: 'cust-2',
    phone_number: '+237623456789',
    full_name: 'Bruno Aka',
    is_active: true,
    date_joined: '2026-02-20T14:45:00Z',
  },
  {
    id: 'cust-3',
    phone_number: '+237634567890',
    full_name: 'Chantal Bebe',
    is_active: false,
    date_joined: '2025-12-01T08:15:00Z',
  },
];

export const BOOKINGS_FIXTURE: BookingSummary[] = [
  {
    id: 'booking-1',
    customer: CUSTOMERS_FIXTURE[0],
    driver: FLEET_APPLICATIONS_FIXTURE[0] as unknown as DriverApplication,
    status: 'completed',
    pickup_location: 'Douala, Cameroon',
    dropoff_location: 'Limbe, Cameroon',
    fare_fcfa: 45000,
    payment_method: 'mtn_momo',
    created_at: '2026-08-16T09:30:00Z',
  },
  {
    id: 'booking-2',
    customer: CUSTOMERS_FIXTURE[1],
    driver: FLEET_APPLICATIONS_FIXTURE[1] as unknown as DriverApplication,
    status: 'in_progress',
    pickup_location: 'Yaoundé, Cameroon',
    dropoff_location: 'Kribi, Cameroon',
    fare_fcfa: 78000,
    payment_method: 'cash',
    created_at: '2026-08-17T10:15:00Z',
  },
];

export const BOOKING_DETAIL_FIXTURE: BookingDetail = {
  id: 'booking-1',
  customer: CUSTOMERS_FIXTURE[0],
  driver: FLEET_APPLICATIONS_FIXTURE[0] as unknown as DriverApplication,
  status: 'completed',
  pickup_location: 'Douala, Cameroon',
  dropoff_location: 'Limbe, Cameroon',
  fare_fcfa: 45000,
  payment_method: 'mtn_momo',
  created_at: '2026-08-16T09:30:00Z',
  distance_km: 65,
  duration_minutes: 75,
  base_fare_fcfa: 5000,
  per_km_charge_fcfa: 600,
  commission_fcfa: 4500,
  driver_earnings_fcfa: 40500,
  completed_at: '2026-08-16T10:45:00Z',
};

export const FINANCIAL_OVERVIEW_FIXTURE: FinancialOverview = {
  total_revenue_fcfa: 5297250,
  total_commission_fcfa: 529725,
  total_cash_trips: 156,
  total_digital_trips: 130,
  outstanding_driver_debts_fcfa: -245000,
  pending_withdrawals_fcfa: 2150000,
  period_from: '2026-08-01',
  period_to: '2026-08-17',
};

export const WALLETS_FIXTURE: WalletEntry[] = [
  {
    driver: FLEET_APPLICATIONS_FIXTURE[0] as unknown as DriverApplication,
    balance_fcfa: 125450,
    pending_withdrawal_fcfa: 0,
    last_transaction_at: '2026-08-17T08:30:00Z',
  },
  {
    driver: FLEET_APPLICATIONS_FIXTURE[1] as unknown as DriverApplication,
    balance_fcfa: -50000,
    pending_withdrawal_fcfa: 75000,
    last_transaction_at: '2026-08-16T15:20:00Z',
  },
  {
    driver: FLEET_APPLICATIONS_FIXTURE[2] as unknown as DriverApplication,
    balance_fcfa: 89250,
    pending_withdrawal_fcfa: 0,
    last_transaction_at: '2026-08-17T02:10:00Z',
  },
];

export const DISPUTES_FIXTURE: DisputeSummary[] = [
  {
    id: 'dispute-1',
    booking: BOOKINGS_FIXTURE[0],
    category: 'wrong_fare',
    status: 'open',
    created_at: '2026-08-16T11:00:00Z',
  },
  {
    id: 'dispute-2',
    booking: BOOKINGS_FIXTURE[1],
    category: 'driver_behavior',
    status: 'in_review',
    created_at: '2026-08-17T09:00:00Z',
  },
];

export const DISPUTE_DETAIL_FIXTURE: DisputeDetail = {
  id: 'dispute-1',
  booking: BOOKINGS_FIXTURE[0],
  category: 'wrong_fare',
  status: 'resolved',
  created_at: '2026-08-16T11:00:00Z',
  resolved_at: '2026-08-17T10:00:00Z',
  customer_description: 'Driver took a longer route and overcharged.',
  driver_response: 'Traffic was heavy due to accident on main road.',
  resolution_note:
    'Fare adjustment approved. Customer refunded 5000 FCFA for route deviation.',
  resolved_by_admin: TEAM_FIXTURE[0],
};

export const VEHICLE_CATEGORIES_FIXTURE: VehicleCategory[] = [
  {
    id: 'cat-1',
    name: 'Pickup',
    description: 'Standard pickup truck',
    base_fare: 5000,
    per_km_rate: 600,
    minimum_fare: 8000,
    is_active: true,
  },
  {
    id: 'cat-2',
    name: 'Van',
    description: 'Large van for multiple parcels',
    base_fare: 7500,
    per_km_rate: 800,
    minimum_fare: 12000,
    is_active: true,
  },
  {
    id: 'cat-3',
    name: 'Truck',
    description: 'Heavy truck for bulk cargo',
    base_fare: 15000,
    per_km_rate: 1200,
    minimum_fare: 25000,
    is_active: true,
  },
];

export const PAGINATION_META_FIXTURE: PaginationMeta = {
  count: 286,
  page: 1,
  page_size: 20,
  total_pages: 15,
};
