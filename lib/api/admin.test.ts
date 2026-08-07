import {
  getOverview,
  getFleetApplications,
  getFleetApplication,
  getDriverApplication,
  listDriverApplications,
  approveDriver,
  rejectDriver,
  listPlatformConfigs,
  updatePlatformConfig,
  listAuditLogs,
  getDocument,
  getTeam,
} from './admin';
import { apiRequest, ApiError } from './client';
import type { DriverApplication, PlatformConfig, AuditLogEntry } from './admin';
import {
  OVERVIEW_FIXTURE,
  FLEET_APPLICATIONS_FIXTURE,
  DOCUMENT_FIXTURE,
  TEAM_FIXTURE,
} from './fixtures/admin';

// admin.ts constructs ApiError itself (404 for the remaining fixture-backed
// id lookups) rather than only propagating errors from apiRequest — so
// ApiError must stay the real class here, not an automock that discards the
// constructor body. apiRequest is still swapped for a jest.fn() so the
// tripwire assertions and the live call-shape assertions have something to
// inspect.
jest.mock('./client', () => ({
  __esModule: true,
  ...jest.requireActual('./client'),
  apiRequest: jest.fn(),
}));
const mockedRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

beforeEach(() => mockedRequest.mockReset());

describe('getOverview', () => {
  it('requests /admin-api/overview and returns live data with isSample: false', async () => {
    const live = { ...OVERVIEW_FIXTURE, active_trips: 999 };
    mockedRequest.mockResolvedValue(live);

    await expect(getOverview('jwt-abc')).resolves.toEqual({
      data: live,
      isSample: false,
    });
    expect(mockedRequest).toHaveBeenCalledWith('/admin-api/overview', {
      token: 'jwt-abc',
    });
  });

  it('falls back to the overview fixture with isSample: true when the endpoint 404s', async () => {
    mockedRequest.mockRejectedValue(new ApiError('Not found.', 404));

    await expect(getOverview('jwt-abc')).resolves.toEqual({
      data: OVERVIEW_FIXTURE,
      isSample: true,
    });
  });
});

describe('getFleetApplications', () => {
  it('requests /admin-api/fleet-applications and returns live data with isSample: false', async () => {
    const live = [FLEET_APPLICATIONS_FIXTURE[0]];
    mockedRequest.mockResolvedValue(live);

    await expect(getFleetApplications('jwt-abc')).resolves.toEqual({
      data: live,
      isSample: false,
    });
    expect(mockedRequest).toHaveBeenCalledWith(
      '/admin-api/fleet-applications',
      { token: 'jwt-abc' },
    );
  });

  it('falls back to the fleet applications fixture with isSample: true when the endpoint 404s', async () => {
    mockedRequest.mockRejectedValue(new ApiError('Not found.', 404));

    await expect(getFleetApplications('jwt-abc')).resolves.toEqual({
      data: FLEET_APPLICATIONS_FIXTURE,
      isSample: true,
    });
  });

  it('falls back to the fixture with isSample: true when the endpoint returns an empty array', async () => {
    mockedRequest.mockResolvedValue([]);

    await expect(getFleetApplications('jwt-abc')).resolves.toEqual({
      data: FLEET_APPLICATIONS_FIXTURE,
      isSample: true,
    });
  });
});

describe('getFleetApplication', () => {
  it('requests /admin-api/fleet-applications/{id} and returns live data with isSample: false', async () => {
    const [first] = FLEET_APPLICATIONS_FIXTURE;
    const live = { ...first, organization: 'Live Org' };
    mockedRequest.mockResolvedValue(live);

    await expect(getFleetApplication('jwt-abc', first.id)).resolves.toEqual({
      data: live,
      isSample: false,
    });
    expect(mockedRequest).toHaveBeenCalledWith(
      `/admin-api/fleet-applications/${first.id}`,
      { token: 'jwt-abc' },
    );
  });

  it('falls back to the matching fixture with isSample: true when the endpoint 404s', async () => {
    const [first] = FLEET_APPLICATIONS_FIXTURE;
    mockedRequest.mockRejectedValue(new ApiError('Not found.', 404));

    await expect(getFleetApplication('jwt-abc', first.id)).resolves.toEqual({
      data: first,
      isSample: true,
    });
  });

  it('throws a 404 ApiError for an id with no live data and no matching fixture', async () => {
    // Jest's toThrow only compares .message, never .status — use
    // rejects.toMatchObject to pin both, plus an explicit instanceof check.
    mockedRequest.mockRejectedValue(new ApiError('Not found.', 404));

    await expect(
      getFleetApplication('jwt-abc', 'does-not-exist'),
    ).rejects.toMatchObject({ status: 404 });

    let caught: unknown;
    try {
      await getFleetApplication('jwt-abc', 'does-not-exist');
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(ApiError);
  });
});

describe('getDriverApplication (LIVE)', () => {
  // Verified live against the running backend (2026-08-07):
  // GET /admin-api/drivers/{id} resolves envelope.data as the
  // DriverApplication directly — no extra nesting, unlike listDriverApplications.
  const application: DriverApplication = {
    id: 'cebfe6e2-e769-4d87-a7fb-41972db8f78c',
    phone_number: '+237600000000',
    full_name: '',
    verification_status: 'pending',
    rejection_reason: '',
    submitted_at: '2026-08-01T10:00:00Z',
    license_document: 'https://cdn.kargoa.cm/license.jpg',
    national_id_document: 'https://cdn.kargoa.cm/national-id.jpg',
    live_selfie: 'https://cdn.kargoa.cm/selfie.jpg',
    plate_number: 'LT 123 AB',
    vehicle_category: 'Pickup',
    registration_doc: 'https://cdn.kargoa.cm/registration.jpg',
    vehicle_status: 'pending',
  };

  it('requests /admin-api/drivers/{id} with the bearer token and resolves the application', async () => {
    mockedRequest.mockResolvedValue(application);

    await expect(getDriverApplication('jwt-abc', application.id)).resolves.toBe(
      application,
    );

    expect(mockedRequest).toHaveBeenCalledWith(
      `/admin-api/drivers/${application.id}`,
      { token: 'jwt-abc' },
    );
  });

  it('propagates a 404 ApiError from apiRequest for an unknown id — mount path is /admin-api, not /admin', async () => {
    mockedRequest.mockRejectedValue(new ApiError('Not found.', 404));

    await expect(
      getDriverApplication('jwt-abc', 'does-not-exist'),
    ).rejects.toMatchObject({ status: 404 });

    let caught: unknown;
    try {
      await getDriverApplication('jwt-abc', 'does-not-exist');
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(ApiError);
  });
});

describe('listDriverApplications (LIVE)', () => {
  // Verified live against the running backend (2026-08-07):
  // GET /admin-api/drivers resolves envelope.data as
  // { meta: {...}, applications: [...] } — apiRequest only unwraps the
  // outer {status,data,message} envelope, so listDriverApplications must
  // unwrap this one extra level itself, same trap as getCategories'
  // data.categories.
  const applications: DriverApplication[] = [
    {
      id: 'cebfe6e2-e769-4d87-a7fb-41972db8f78c',
      phone_number: '+237600000000',
      full_name: '',
      verification_status: 'pending',
      rejection_reason: '',
      submitted_at: '2026-08-01T10:00:00Z',
      license_document: 'https://cdn.kargoa.cm/license.jpg',
      national_id_document: 'https://cdn.kargoa.cm/national-id.jpg',
      live_selfie: 'https://cdn.kargoa.cm/selfie.jpg',
      plate_number: 'LT 123 AB',
      vehicle_category: 'Pickup',
      registration_doc: 'https://cdn.kargoa.cm/registration.jpg',
      vehicle_status: 'pending',
    },
  ];
  const meta = { count: 4, page: 1, page_size: 20, total_pages: 1 };

  it('requests /admin-api/drivers with no query string when no options are given', async () => {
    mockedRequest.mockResolvedValue({ meta, applications });

    await listDriverApplications('jwt-abc');

    expect(mockedRequest).toHaveBeenCalledWith('/admin-api/drivers', {
      token: 'jwt-abc',
    });
  });

  it('unwraps data.applications and data.meta explicitly, not the whole envelope passed through', async () => {
    // A test that only checked the resolved value against { applications,
    // meta } could pass even if the implementation returned the mocked
    // object unchanged (same field names). Asserting reference identity on
    // the array forces real unwrapping to have happened.
    mockedRequest.mockResolvedValue({ meta, applications });

    const result = await listDriverApplications('jwt-abc');

    expect(result.applications).toBe(applications);
    expect(result.meta).toEqual(meta);
  });

  it('adds a status query param when provided', async () => {
    mockedRequest.mockResolvedValue({ meta, applications });

    await listDriverApplications('jwt-abc', { status: 'pending' });

    expect(mockedRequest).toHaveBeenCalledWith(
      '/admin-api/drivers?status=pending',
      { token: 'jwt-abc' },
    );
  });

  it('adds a page query param when provided', async () => {
    mockedRequest.mockResolvedValue({ meta, applications });

    await listDriverApplications('jwt-abc', { page: 2 });

    expect(mockedRequest).toHaveBeenCalledWith('/admin-api/drivers?page=2', {
      token: 'jwt-abc',
    });
  });

  it('combines status and page into one query string', async () => {
    mockedRequest.mockResolvedValue({ meta, applications });

    await listDriverApplications('jwt-abc', { status: 'pending', page: 2 });

    expect(mockedRequest).toHaveBeenCalledWith(
      '/admin-api/drivers?status=pending&page=2',
      { token: 'jwt-abc' },
    );
  });
});

describe('approveDriver (LIVE)', () => {
  it('posts to /admin-api/drivers/{id}/approve with no body', async () => {
    mockedRequest.mockResolvedValue(undefined);

    await approveDriver('jwt-abc', 'drv-1');

    expect(mockedRequest).toHaveBeenCalledWith(
      '/admin-api/drivers/drv-1/approve',
      { method: 'POST', token: 'jwt-abc' },
    );
    // toHaveBeenCalledWith uses toEqual semantics, which treats a missing
    // key and an explicit `body: undefined` as equal — Object.keys pins
    // that no body key was passed at all, matching "no request body".
    const [, options] = mockedRequest.mock.calls[0];
    expect(Object.keys(options as object)).not.toContain('body');
  });
});

describe('rejectDriver (LIVE)', () => {
  it('posts { reason } to /admin-api/drivers/{id}/reject with the bearer token', async () => {
    mockedRequest.mockResolvedValue(undefined);

    await rejectDriver('jwt-abc', 'drv-1', 'Blurry documents');

    expect(mockedRequest).toHaveBeenCalledWith(
      '/admin-api/drivers/drv-1/reject',
      {
        method: 'POST',
        body: { reason: 'Blurry documents' },
        token: 'jwt-abc',
      },
    );
  });

  it('propagates the 422 validation ApiError from apiRequest', async () => {
    // Observed 2026-08-07: a live curl against the running backend with
    // `reason` omitted returned HTTP_STATUS:422, and the project owner's
    // Docker log independently shows "Unprocessable Entity:
    // /api/v1/admin-api/drivers/<id>/reject" for the same request.
    // apiRequest already turns this into an ApiError; this pins that
    // rejectDriver does not swallow or reshape it.
    mockedRequest.mockRejectedValue(new ApiError('Validation failed.', 422));

    await expect(
      rejectDriver('jwt-abc', 'drv-1', 'Blurry documents'),
    ).rejects.toMatchObject({ status: 422, message: 'Validation failed.' });
  });
});

describe('listPlatformConfigs (LIVE)', () => {
  it('unwraps data.configs from /admin-api/configs', async () => {
    const configs: PlatformConfig[] = [
      {
        key: 'max_active_trips',
        value: '5',
        value_type: 'integer',
        description: 'Max concurrent active trips per driver',
        updated_at: '2026-08-01T10:00:00Z',
        updated_by: null,
      },
    ];
    mockedRequest.mockResolvedValue({ configs });

    const result = await listPlatformConfigs('jwt-abc');

    expect(result).toBe(configs);
    expect(mockedRequest).toHaveBeenCalledWith('/admin-api/configs', {
      token: 'jwt-abc',
    });
  });
});

describe('updatePlatformConfig (LIVE)', () => {
  it('PATCHes { value } to /admin-api/configs/{key}, always as a string', async () => {
    mockedRequest.mockResolvedValue(undefined);

    await updatePlatformConfig('jwt-abc', 'max_active_trips', '7');

    expect(mockedRequest).toHaveBeenCalledWith(
      '/admin-api/configs/max_active_trips',
      { method: 'PATCH', body: { value: '7' }, token: 'jwt-abc' },
    );
  });
});

describe('listAuditLogs (LIVE)', () => {
  it('unwraps data.logs and data.meta from /admin-api/audit-logs', async () => {
    const logs: AuditLogEntry[] = [];
    const meta = { count: 0, page: 1, page_size: 20, total_pages: 0 };
    mockedRequest.mockResolvedValue({ meta, logs });

    const result = await listAuditLogs('jwt-abc');

    expect(result.logs).toBe(logs);
    expect(result.meta).toEqual(meta);
    expect(mockedRequest).toHaveBeenCalledWith('/admin-api/audit-logs', {
      token: 'jwt-abc',
    });
  });

  it('adds a page query param when provided', async () => {
    mockedRequest.mockResolvedValue({
      meta: { count: 0, page: 2, page_size: 20, total_pages: 0 },
      logs: [],
    });

    await listAuditLogs('jwt-abc', { page: 2 });

    expect(mockedRequest).toHaveBeenCalledWith('/admin-api/audit-logs?page=2', {
      token: 'jwt-abc',
    });
  });
});

describe('getDocument', () => {
  it('requests /admin-api/documents/{id} and returns live data with isSample: false', async () => {
    const live = { ...DOCUMENT_FIXTURE, file_size_mb: 42 };
    mockedRequest.mockResolvedValue(live);

    await expect(getDocument('jwt-abc', DOCUMENT_FIXTURE.id)).resolves.toEqual({
      data: live,
      isSample: false,
    });
    expect(mockedRequest).toHaveBeenCalledWith(
      `/admin-api/documents/${DOCUMENT_FIXTURE.id}`,
      { token: 'jwt-abc' },
    );
  });

  it('falls back to the document fixture with isSample: true when the endpoint 404s', async () => {
    mockedRequest.mockRejectedValue(new ApiError('Not found.', 404));

    await expect(getDocument('jwt-abc', DOCUMENT_FIXTURE.id)).resolves.toEqual({
      data: DOCUMENT_FIXTURE,
      isSample: true,
    });
  });

  it('throws a 404 ApiError for an unknown id — matching what the real endpoint will do', async () => {
    mockedRequest.mockRejectedValue(new ApiError('Not found.', 404));

    await expect(
      getDocument('jwt-abc', 'does-not-exist'),
    ).rejects.toMatchObject({ status: 404 });

    let caught: unknown;
    try {
      await getDocument('jwt-abc', 'does-not-exist');
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(ApiError);
  });
});

describe('getTeam', () => {
  it('requests /admin-api/team and returns live data with isSample: false', async () => {
    const live = [TEAM_FIXTURE[0]];
    mockedRequest.mockResolvedValue(live);

    await expect(getTeam('jwt-abc')).resolves.toEqual({
      data: live,
      isSample: false,
    });
    expect(mockedRequest).toHaveBeenCalledWith('/admin-api/team', {
      token: 'jwt-abc',
    });
  });

  it('falls back to the team fixture with isSample: true when the endpoint 404s', async () => {
    mockedRequest.mockRejectedValue(new ApiError('Not found.', 404));

    await expect(getTeam('jwt-abc')).resolves.toEqual({
      data: TEAM_FIXTURE,
      isSample: true,
    });
  });

  it('falls back to the fixture with isSample: true when the endpoint returns an empty array', async () => {
    mockedRequest.mockResolvedValue([]);

    await expect(getTeam('jwt-abc')).resolves.toEqual({
      data: TEAM_FIXTURE,
      isSample: true,
    });
  });
});
