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
