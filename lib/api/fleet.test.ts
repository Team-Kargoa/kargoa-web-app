import {
  getFleetSummary,
  getWeeklyPerformance,
  getActiveDrivers,
  getDriverRoster,
  getVehicleRoster,
} from './fleet';
import { apiRequest } from './client';
import {
  FLEET_SUMMARY_FIXTURE,
  WEEKLY_PERFORMANCE_FIXTURE,
  ACTIVE_DRIVERS_FIXTURE,
  DRIVER_ROSTER_FIXTURE,
  VEHICLE_ROSTER_FIXTURE,
} from './fixtures/fleet';

jest.mock('./client');
const mockedRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

beforeEach(() => mockedRequest.mockReset());

describe('getFleetSummary', () => {
  it('resolves the fleet summary fixture', async () => {
    await expect(getFleetSummary('jwt-abc')).resolves.toEqual(
      FLEET_SUMMARY_FIXTURE,
    );
  });

  it('never calls apiRequest — tripwire for when a live telemetry endpoint ships', async () => {
    // apps/tracking and apps/admin_api are stubs (no live routes) — verified
    // 2026-08-06. If this ever fails, the fixture must be deleted and
    // getFleetSummary rewired to call apiRequest.
    await getFleetSummary('jwt-abc');
    expect(apiRequest).not.toHaveBeenCalled();
  });
});

describe('getWeeklyPerformance', () => {
  it('resolves the weekly performance fixture', async () => {
    await expect(getWeeklyPerformance('jwt-abc')).resolves.toEqual(
      WEEKLY_PERFORMANCE_FIXTURE,
    );
  });

  it('never calls apiRequest — tripwire for when a live telemetry endpoint ships', async () => {
    await getWeeklyPerformance('jwt-abc');
    expect(apiRequest).not.toHaveBeenCalled();
  });
});

describe('getActiveDrivers', () => {
  it('resolves the active drivers fixture', async () => {
    await expect(getActiveDrivers('jwt-abc')).resolves.toEqual(
      ACTIVE_DRIVERS_FIXTURE,
    );
  });

  it('never calls apiRequest — tripwire for when a live telemetry endpoint ships', async () => {
    await getActiveDrivers('jwt-abc');
    expect(apiRequest).not.toHaveBeenCalled();
  });
});

describe('getDriverRoster', () => {
  it('resolves the driver roster fixture', async () => {
    await expect(getDriverRoster('jwt-abc')).resolves.toEqual(
      DRIVER_ROSTER_FIXTURE,
    );
  });

  it('never calls apiRequest — tripwire for when a live telemetry endpoint ships', async () => {
    await getDriverRoster('jwt-abc');
    expect(apiRequest).not.toHaveBeenCalled();
  });
});

describe('getVehicleRoster', () => {
  it('resolves the vehicle roster fixture', async () => {
    await expect(getVehicleRoster('jwt-abc')).resolves.toEqual(
      VEHICLE_ROSTER_FIXTURE,
    );
  });

  it('never calls apiRequest — tripwire for when a live telemetry endpoint ships', async () => {
    await getVehicleRoster('jwt-abc');
    expect(apiRequest).not.toHaveBeenCalled();
  });
});
