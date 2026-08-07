// FIXTURE-BACKED. apps/admin_api has no routes at all — urls.py is a 9-line
// stub with an empty urlpatterns list (verified 2026-08-04). When
// /admin/overview and friends ship, replace these bodies with apiRequest
// calls. Signatures must not change — screens depend on them.

import { ApiError } from './client';
import {
  OVERVIEW_FIXTURE,
  FLEET_APPLICATIONS_FIXTURE,
  DRIVER_APPLICATION_FIXTURE,
  DOCUMENT_FIXTURE,
  TEAM_FIXTURE,
} from './fixtures/admin';

export type AdminOverview = {
  active_trips: number;
  online_drivers: number;
  bookings_last_24h: number;
  revenue_last_24h_fcfa: number;
  open_disputes: number;
  pending_approvals: number;
  as_of: string;
};

export type FleetApplicationStatus =
  'pending_review' | 'under_verification' | 'flagged' | 'approved';

export type FleetApplication = {
  id: string;
  organization: string;
  reference: string;
  fleet_size: number;
  region: string;
  applied_date: string;
  status: FleetApplicationStatus;
};

export type DriverApplicationStatus =
  'pending_review' | 'approved' | 'rejected';

export type DriverApplication = {
  id: string;
  full_name: string;
  phone_number: string;
  location: string;
  status: DriverApplicationStatus;
  applied_date: string;
  license_class: string;
  license_document_url: string;
  selfie_url: string;
  selfie_match_percent: number;
  admin_notes: string | null;
};

export type DocumentRecord = {
  id: string;
  document_type: string;
  file_url: string;
  file_size_mb: number;
  format: string;
  uploaded_at: string;
  /** null when the source image carries no camera EXIF data. */
  camera_metadata: string | null;
};

export type TeamMemberRole = 'admin' | 'super_admin';
export type TeamMemberStatus = 'active' | 'inactive';

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  last_active: string;
  status: TeamMemberStatus;
};

export function getOverview(token: string): Promise<AdminOverview> {
  void token;
  return Promise.resolve(OVERVIEW_FIXTURE);
}

export function getFleetApplications(
  token: string,
): Promise<FleetApplication[]> {
  void token;
  return Promise.resolve(FLEET_APPLICATIONS_FIXTURE);
}

export function getFleetApplication(
  token: string,
  id: string,
): Promise<FleetApplication> {
  void token;
  const application = FLEET_APPLICATIONS_FIXTURE.find((app) => app.id === id);
  if (!application) {
    return Promise.reject(
      new ApiError(`Fleet application ${id} not found`, 404),
    );
  }
  return Promise.resolve(application);
}

export function getDriverApplication(
  token: string,
  id: string,
): Promise<DriverApplication> {
  void token;
  if (id !== DRIVER_APPLICATION_FIXTURE.id) {
    return Promise.reject(
      new ApiError(`Driver application ${id} not found`, 404),
    );
  }
  return Promise.resolve(DRIVER_APPLICATION_FIXTURE);
}

export function getDocument(
  token: string,
  id: string,
): Promise<DocumentRecord> {
  void token;
  if (id !== DOCUMENT_FIXTURE.id) {
    return Promise.reject(new ApiError(`Document ${id} not found`, 404));
  }
  return Promise.resolve(DOCUMENT_FIXTURE);
}

export function getTeam(token: string): Promise<TeamMember[]> {
  void token;
  return Promise.resolve(TEAM_FIXTURE);
}
