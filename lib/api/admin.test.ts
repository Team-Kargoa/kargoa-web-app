import {
  getOverview,
  getFleetApplications,
  getFleetApplication,
  getDriverApplication,
  getDocument,
  getTeam,
} from './admin';
import { apiRequest, ApiError } from './client';
import {
  OVERVIEW_FIXTURE,
  FLEET_APPLICATIONS_FIXTURE,
  DRIVER_APPLICATION_FIXTURE,
  DOCUMENT_FIXTURE,
  TEAM_FIXTURE,
} from './fixtures/admin';

// admin.ts constructs ApiError itself (404 for unknown ids) rather than only
// propagating errors from apiRequest — so ApiError must stay the real class
// here, not an automock that discards the constructor body. apiRequest is
// still swapped for a jest.fn() so the tripwire assertions have something to
// inspect.
jest.mock('./client', () => ({
  __esModule: true,
  ...jest.requireActual('./client'),
  apiRequest: jest.fn(),
}));
const mockedRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

beforeEach(() => mockedRequest.mockReset());

describe('getOverview', () => {
  it('resolves the overview fixture', async () => {
    await expect(getOverview('jwt-abc')).resolves.toEqual(OVERVIEW_FIXTURE);
  });

  it('never calls apiRequest — tripwire for when /admin/overview ships', async () => {
    // apps/admin_api is a stub (no live routes) — verified 2026-08-04. If
    // this ever fails, the fixture must be deleted and getOverview rewired
    // to call apiRequest.
    await getOverview('jwt-abc');
    expect(apiRequest).not.toHaveBeenCalled();
  });
});

describe('getFleetApplications', () => {
  it('resolves the fleet applications fixture', async () => {
    await expect(getFleetApplications('jwt-abc')).resolves.toEqual(
      FLEET_APPLICATIONS_FIXTURE,
    );
  });

  it('never calls apiRequest — tripwire for when a live fleet-applications endpoint ships', async () => {
    await getFleetApplications('jwt-abc');
    expect(apiRequest).not.toHaveBeenCalled();
  });
});

describe('getFleetApplication', () => {
  it('resolves the matching fleet application fixture by id', async () => {
    const [first] = FLEET_APPLICATIONS_FIXTURE;
    await expect(getFleetApplication('jwt-abc', first.id)).resolves.toEqual(
      first,
    );
  });

  it('never calls apiRequest — tripwire for when a live fleet-application endpoint ships', async () => {
    const [first] = FLEET_APPLICATIONS_FIXTURE;
    await getFleetApplication('jwt-abc', first.id);
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it('throws a 404 ApiError for an unknown id — matching what the real endpoint will do', async () => {
    // Jest's toThrow only compares .message, never .status — use
    // rejects.toMatchObject to pin both, plus an explicit instanceof check.
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

describe('getDriverApplication', () => {
  it('resolves the driver application fixture by id', async () => {
    await expect(
      getDriverApplication('jwt-abc', DRIVER_APPLICATION_FIXTURE.id),
    ).resolves.toEqual(DRIVER_APPLICATION_FIXTURE);
  });

  it('never calls apiRequest — tripwire for when a live driver-application endpoint ships', async () => {
    await getDriverApplication('jwt-abc', DRIVER_APPLICATION_FIXTURE.id);
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it('throws a 404 ApiError for an unknown id — matching what the real endpoint will do', async () => {
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

describe('getDocument', () => {
  it('resolves the document fixture by id', async () => {
    await expect(getDocument('jwt-abc', DOCUMENT_FIXTURE.id)).resolves.toEqual(
      DOCUMENT_FIXTURE,
    );
  });

  it('never calls apiRequest — tripwire for when a live document endpoint ships', async () => {
    await getDocument('jwt-abc', DOCUMENT_FIXTURE.id);
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it('throws a 404 ApiError for an unknown id — matching what the real endpoint will do', async () => {
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
  it('resolves the team fixture', async () => {
    await expect(getTeam('jwt-abc')).resolves.toEqual(TEAM_FIXTURE);
  });

  it('never calls apiRequest — tripwire for when a live team endpoint ships', async () => {
    await getTeam('jwt-abc');
    expect(apiRequest).not.toHaveBeenCalled();
  });
});
