// This module is split between LIVE (strict, no fallback) and
// LIVE-WITH-FALLBACK functions — apps/admin_api went live at the
// /admin-api/ mount path (verified 2026-08-07 with a real admin token;
// api_spec.yaml still documents /admin/... and is wrong, the third time
// that spec has diverged from reality on this project). Each group is
// headed with its own comment below — do not assume the whole file is one
// or the other.

import { apiRequest } from './client';
import { withFallback, type Sourced } from './with-fallback';
import {
  OVERVIEW_FIXTURE,
  FLEET_APPLICATIONS_FIXTURE,
  DOCUMENT_FIXTURE,
  TEAM_FIXTURE,
} from './fixtures/admin';

// --- Shared types -----------------------------------------------------

export type PaginationMeta = {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
};

function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

// --- LIVE: /admin-api/drivers, /admin-api/configs, /admin-api/audit-logs --
//
// Verified live against the running backend (2026-08-07) with a real admin
// token. Mount path is /admin-api/, NOT /admin/.

export type DriverApplication = {
  id: string;
  phone_number: string;
  /** Often empty. */
  full_name: string;
  /** e.g. "pending" | "approved" — the backend does not enumerate the full set. */
  verification_status: string;
  /** Empty unless the application was rejected. */
  rejection_reason: string;
  submitted_at: string;
  license_document: string;
  national_id_document: string;
  live_selfie: string;
  plate_number: string;
  /** A vehicle category name (e.g. "Pickup"), not an id. */
  vehicle_category: string;
  registration_doc: string;
  vehicle_status: string;
};

export type PlatformConfig = {
  key: string;
  /** Always a string on the wire — value_type says how to interpret it. */
  value: string;
  value_type: string;
  description: string;
  updated_at: string;
  /**
   * A phone number, or null if never updated. Unverified: every observed
   * config had `updated_by: null`; no non-null example has been seen to
   * confirm the format.
   */
  updated_by: string | null;
};

// GET /admin-api/audit-logs returns { meta, logs }, but the live logs array
// is currently empty (verified 2026-08-07) — no real entry has been
// observed to confirm field names. This shape is a placeholder inferred
// from common audit-log conventions; re-verify once a populated response
// can be checked, same caveat that applied to DriverApplication before it
// was confirmed live.
export type AuditLogEntry = {
  id: string;
  actor: string | null;
  action: string;
  target: string | null;
  created_at: string;
};

export function getDriverApplication(
  token: string,
  id: string,
): Promise<DriverApplication> {
  return apiRequest<DriverApplication>(`/admin-api/drivers/${id}`, { token });
}

export function listDriverApplications(
  token: string,
  options: { status?: string; page?: number } = {},
): Promise<{ applications: DriverApplication[]; meta: PaginationMeta }> {
  // The live envelope's data is { meta, applications }, not a bare array —
  // same trap that already bit getCategories, where the array sat at
  // data.categories. apiRequest only unwraps the outer
  // {status,data,message} envelope, so this unwraps the one level beneath it.
  const query = buildQuery({ status: options.status, page: options.page });
  return apiRequest<{
    meta: PaginationMeta;
    applications: DriverApplication[];
  }>(`/admin-api/drivers${query}`, { token }).then((result) => ({
    applications: result.applications,
    meta: result.meta,
  }));
}

export function approveDriver(token: string, id: string): Promise<void> {
  return apiRequest<void>(`/admin-api/drivers/${id}/approve`, {
    method: 'POST',
    token,
  });
}

export function rejectDriver(
  token: string,
  id: string,
  reason: string,
): Promise<void> {
  return apiRequest<void>(`/admin-api/drivers/${id}/reject`, {
    method: 'POST',
    body: { reason },
    token,
  });
}

export function listPlatformConfigs(token: string): Promise<PlatformConfig[]> {
  return apiRequest<{ configs: PlatformConfig[] }>('/admin-api/configs', {
    token,
  }).then((result) => result.configs);
}

export function updatePlatformConfig(
  token: string,
  key: string,
  value: string,
): Promise<void> {
  return apiRequest<void>(`/admin-api/configs/${key}`, {
    method: 'PATCH',
    body: { value },
    token,
  });
}

export function listAuditLogs(
  token: string,
  options: { page?: number } = {},
): Promise<{ logs: AuditLogEntry[]; meta: PaginationMeta }> {
  const query = buildQuery({ page: options.page });
  return apiRequest<{ meta: PaginationMeta; logs: AuditLogEntry[] }>(
    `/admin-api/audit-logs${query}`,
    { token },
  ).then((result) => ({ logs: result.logs, meta: result.meta }));
}

// --- LIVE-WITH-FALLBACK: still missing from apps/admin_api -----------------
//
// Verified live 2026-08-07 against the running backend, alongside the group
// above: there is still no endpoint for the admin overview/dashboard
// summary, fleet applications or the fleet approvals queue, the financial
// dashboard, team management, or document inspection. Each function below
// attempts its guessed /admin-api/* path via withFallback and only falls
// back to its fixture when that call errors (404 today) or returns
// something empty — the fixture disappears on its own, with no code change
// needed here, the moment apps/admin_api actually serves the route.
// Signatures now return Sourced<T> (`{ data, isSample }`) instead of T —
// callers must read `.data` and may read `.isSample` to show that a
// section is showing sample data.

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

export function getOverview(token: string): Promise<Sourced<AdminOverview>> {
  return withFallback(
    () => apiRequest<AdminOverview>('/admin-api/overview', { token }),
    OVERVIEW_FIXTURE,
  );
}

export function getFleetApplications(
  token: string,
): Promise<Sourced<FleetApplication[]>> {
  return withFallback(
    () =>
      apiRequest<FleetApplication[]>('/admin-api/fleet-applications', {
        token,
      }),
    FLEET_APPLICATIONS_FIXTURE,
  );
}

export async function getFleetApplication(
  token: string,
  id: string,
): Promise<Sourced<FleetApplication>> {
  const live = () =>
    apiRequest<FleetApplication>(`/admin-api/fleet-applications/${id}`, {
      token,
    });
  const fixtureMatch = FLEET_APPLICATIONS_FIXTURE.find((app) => app.id === id);
  if (!fixtureMatch) {
    // No fixture to fall back to for this id — let live()'s outcome (real
    // data, or the 404 the real endpoint will throw for an unknown id)
    // propagate as-is rather than inventing a fallback that doesn't exist.
    return { data: await live(), isSample: false };
  }
  return withFallback(live, fixtureMatch);
}

export async function getDocument(
  token: string,
  id: string,
): Promise<Sourced<DocumentRecord>> {
  const live = () =>
    apiRequest<DocumentRecord>(`/admin-api/documents/${id}`, { token });
  if (id !== DOCUMENT_FIXTURE.id) {
    // Same reasoning as getFleetApplication: no fixture matches this id, so
    // there is nothing sensible to fall back to.
    return { data: await live(), isSample: false };
  }
  return withFallback(live, DOCUMENT_FIXTURE);
}

export function getTeam(token: string): Promise<Sourced<TeamMember[]>> {
  return withFallback(
    () => apiRequest<TeamMember[]>('/admin-api/team', { token }),
    TEAM_FIXTURE,
  );
}
