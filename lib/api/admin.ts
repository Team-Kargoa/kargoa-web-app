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

function buildQuery(
  params: Record<string, string | number | boolean | undefined>,
) {
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

// GET /admin-api/audit-logs returns { meta, logs }. Field names below are
// verified directly against apps/admin_api/api/serializers.py's
// AuditLogOutSerializer (not inferred/guessed like the rest of this file's
// LIVE-WITH-FALLBACK section) — the live logs array was still empty as of
// 2026-08-07, but the serializer itself is real and unambiguous.
export type AuditLogEntry = {
  id: string;
  /** The acting admin's phone number, or null if that user was deleted. */
  admin: string | null;
  /** e.g. "driver.approve", "config.update". */
  action: string;
  /** The model name the action touched, e.g. "DriverProfile". */
  entity_type: string;
  entity_id: string;
  /** Field snapshots before/after the change — shape varies by action. */
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
};

// --- Additional types for extended admin features ---

export type UserSummary = {
  id: string;
  phone_number: string;
  full_name: string;
  is_active: boolean;
  date_joined: string;
};

export type BookingSummary = {
  id: string;
  customer: UserSummary;
  driver: DriverApplication;
  status: string;
  pickup_location: string;
  dropoff_location: string;
  fare_fcfa: number;
  payment_method: 'cash' | 'mtn_momo' | 'orange_money';
  created_at: string;
};

export type BookingDetail = BookingSummary & {
  distance_km: number;
  duration_minutes: number;
  base_fare_fcfa: number;
  per_km_charge_fcfa: number;
  commission_fcfa: number;
  driver_earnings_fcfa: number;
  cancellation_reason?: string;
  completed_at?: string;
};

export type FinancialOverview = {
  total_revenue_fcfa: number;
  total_commission_fcfa: number;
  total_cash_trips: number;
  total_digital_trips: number;
  outstanding_driver_debts_fcfa: number;
  pending_withdrawals_fcfa: number;
  period_from: string;
  period_to: string;
};

export type WalletEntry = {
  driver: DriverApplication;
  balance_fcfa: number;
  pending_withdrawal_fcfa: number;
  last_transaction_at: string;
};

export type DisputeCategory =
  'wrong_fare' | 'driver_behavior' | 'damaged_goods' | 'no_show' | 'other';

export type DisputeStatus = 'open' | 'in_review' | 'resolved' | 'closed';

export type DisputeSummary = {
  id: string;
  booking: BookingSummary;
  category: DisputeCategory;
  status: DisputeStatus;
  created_at: string;
  resolved_at?: string;
};

export type DisputeDetail = DisputeSummary & {
  customer_description: string;
  driver_response?: string;
  resolution_note?: string;
  resolved_by_admin?: UserSummary;
};

export type VehicleCategory = {
  id: string;
  name: string;
  description: string;
  base_fare: number;
  per_km_rate: number;
  minimum_fare: number;
  is_active: boolean;
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

export function suspendDriver(
  token: string,
  id: string,
  isActive: boolean,
  reason: string,
): Promise<void> {
  return apiRequest<void>(`/admin-api/drivers/${id}/suspend`, {
    method: 'POST',
    body: { is_active: isActive, reason },
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
  options: {
    page?: number;
    adminId?: string;
    action?: string;
    entityType?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {},
): Promise<{ logs: AuditLogEntry[]; meta: PaginationMeta }> {
  const query = buildQuery({
    page: options.page,
    admin_id: options.adminId,
    action: options.action,
    entity_type: options.entityType,
    date_from: options.dateFrom,
    date_to: options.dateTo,
  });
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

// --- Additional LIVE-WITH-FALLBACK functions: Users, Bookings, Finances, etc. ---

export function listCustomers(
  token: string,
  options: { isActive?: boolean; search?: string; page?: number } = {},
): Promise<Sourced<{ users: UserSummary[]; meta: PaginationMeta }>> {
  return withFallback(
    () => {
      const query = buildQuery({
        is_active: options.isActive,
        search: options.search,
        page: options.page,
      });
      return apiRequest<{ users: UserSummary[]; meta: PaginationMeta }>(
        `/admin-api/users${query}`,
        { token },
      );
    },
    { users: [], meta: { count: 0, page: 1, page_size: 20, total_pages: 0 } },
  );
}

export function getUserDetail(
  token: string,
  id: string,
): Promise<Sourced<UserSummary>> {
  return withFallback(
    () => apiRequest<UserSummary>(`/admin-api/users/${id}`, { token }),
    { id, phone_number: '', full_name: '', is_active: true, date_joined: '' },
  );
}

export function toggleUserStatus(
  token: string,
  id: string,
  isActive: boolean,
  reason: string,
): Promise<void> {
  return apiRequest<void>(`/admin-api/users/${id}/status`, {
    method: 'PATCH',
    body: { is_active: isActive, reason },
    token,
  });
}

export function listBookings(
  token: string,
  options: {
    status?: string;
    driverId?: string;
    customerId?: string;
    paymentMethod?: 'cash' | 'mtn_momo' | 'orange_money';
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
  } = {},
): Promise<Sourced<{ bookings: BookingSummary[]; meta: PaginationMeta }>> {
  return withFallback(
    () => {
      const query = buildQuery({
        status: options.status,
        driver_id: options.driverId,
        customer_id: options.customerId,
        payment_method: options.paymentMethod,
        date_from: options.dateFrom,
        date_to: options.dateTo,
        page: options.page,
        page_size: options.pageSize,
      });
      return apiRequest<{ bookings: BookingSummary[]; meta: PaginationMeta }>(
        `/admin-api/bookings${query}`,
        { token },
      );
    },
    {
      bookings: [],
      meta: { count: 0, page: 1, page_size: 20, total_pages: 0 },
    },
  );
}

export function getBookingDetail(
  token: string,
  id: string,
): Promise<Sourced<BookingDetail>> {
  return withFallback(
    () => apiRequest<BookingDetail>(`/admin-api/bookings/${id}`, { token }),
    {
      id,
      customer: {
        id: '',
        phone_number: '',
        full_name: '',
        is_active: true,
        date_joined: '',
      },
      driver: {
        id: '',
        phone_number: '',
        full_name: '',
        verification_status: 'pending',
        rejection_reason: '',
        submitted_at: '',
        license_document: '',
        national_id_document: '',
        live_selfie: '',
        plate_number: '',
        vehicle_category: '',
        registration_doc: '',
        vehicle_status: '',
      },
      status: 'pending',
      pickup_location: '',
      dropoff_location: '',
      fare_fcfa: 0,
      payment_method: 'cash',
      created_at: '',
      distance_km: 0,
      duration_minutes: 0,
      base_fare_fcfa: 0,
      per_km_charge_fcfa: 0,
      commission_fcfa: 0,
      driver_earnings_fcfa: 0,
    },
  );
}

export function getFinancialOverview(
  token: string,
  options: { dateFrom?: string; dateTo?: string } = {},
): Promise<Sourced<FinancialOverview>> {
  return withFallback(
    () => {
      const query = buildQuery({
        date_from: options.dateFrom,
        date_to: options.dateTo,
      });
      return apiRequest<FinancialOverview>(
        `/admin-api/finances/overview${query}`,
        { token },
      );
    },
    {
      total_revenue_fcfa: 0,
      total_commission_fcfa: 0,
      total_cash_trips: 0,
      total_digital_trips: 0,
      outstanding_driver_debts_fcfa: 0,
      pending_withdrawals_fcfa: 0,
      period_from: new Date().toISOString().split('T')[0],
      period_to: new Date().toISOString().split('T')[0],
    },
  );
}

export function listDriverWallets(
  token: string,
  options: {
    balanceLt?: number;
    sort?: 'balance_asc' | 'balance_desc';
    page?: number;
  } = {},
): Promise<Sourced<{ wallets: WalletEntry[]; meta: PaginationMeta }>> {
  return withFallback(
    () => {
      const query = buildQuery({
        balance_lt: options.balanceLt,
        sort: options.sort,
        page: options.page,
      });
      return apiRequest<{ wallets: WalletEntry[]; meta: PaginationMeta }>(
        `/admin-api/finances/wallets${query}`,
        { token },
      );
    },
    { wallets: [], meta: { count: 0, page: 1, page_size: 20, total_pages: 0 } },
  );
}

export function listDisputes(
  token: string,
  options: {
    status?: DisputeStatus;
    category?: DisputeCategory;
    page?: number;
  } = {},
): Promise<Sourced<{ disputes: DisputeSummary[]; meta: PaginationMeta }>> {
  return withFallback(
    () => {
      const query = buildQuery({
        status: options.status,
        category: options.category,
        page: options.page,
      });
      return apiRequest<{ disputes: DisputeSummary[]; meta: PaginationMeta }>(
        `/admin-api/disputes${query}`,
        { token },
      );
    },
    {
      disputes: [],
      meta: { count: 0, page: 1, page_size: 20, total_pages: 0 },
    },
  );
}

export function getDisputeDetail(
  token: string,
  id: string,
): Promise<Sourced<DisputeDetail>> {
  return withFallback(
    () => apiRequest<DisputeDetail>(`/admin-api/disputes/${id}`, { token }),
    {
      id,
      booking: {
        id: '',
        customer: {
          id: '',
          phone_number: '',
          full_name: '',
          is_active: true,
          date_joined: '',
        },
        driver: {
          id: '',
          phone_number: '',
          full_name: '',
          verification_status: 'pending',
          rejection_reason: '',
          submitted_at: '',
          license_document: '',
          national_id_document: '',
          live_selfie: '',
          plate_number: '',
          vehicle_category: '',
          registration_doc: '',
          vehicle_status: '',
        },
        status: 'pending',
        pickup_location: '',
        dropoff_location: '',
        fare_fcfa: 0,
        payment_method: 'cash',
        created_at: '',
      },
      category: 'other',
      status: 'open',
      created_at: '',
      customer_description: '',
    },
  );
}

export function resolveDispute(
  token: string,
  id: string,
  resolutionNote: string,
): Promise<void> {
  return apiRequest<void>(`/admin-api/disputes/${id}/resolve`, {
    method: 'POST',
    body: { resolution_note: resolutionNote },
    token,
  });
}

export function listVehicleCategories(
  token: string,
): Promise<Sourced<VehicleCategory[]>> {
  return withFallback(
    () =>
      apiRequest<VehicleCategory[]>('/admin-api/vehicle-categories', {
        token,
      }),
    [],
  );
}

export function createVehicleCategory(
  token: string,
  data: {
    name: string;
    description?: string;
    base_fare: number;
    per_km_rate: number;
    minimum_fare: number;
  },
): Promise<VehicleCategory> {
  return apiRequest<VehicleCategory>('/admin-api/vehicle-categories', {
    method: 'POST',
    body: data,
    token,
  });
}

export function updateVehicleCategory(
  token: string,
  id: string,
  data: {
    description?: string;
    base_fare?: number;
    per_km_rate?: number;
    minimum_fare?: number;
    is_active?: boolean;
  },
): Promise<VehicleCategory> {
  return apiRequest<VehicleCategory>(`/admin-api/vehicle-categories/${id}`, {
    method: 'PATCH',
    body: data,
    token,
  });
}
