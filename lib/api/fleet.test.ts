import {
  getFleetSummary,
  getWeeklyPerformance,
  getActiveDrivers,
  getDriverRoster,
  getVehicleRoster,
} from './fleet';
import { apiRequest, ApiError } from './client';
import {
  FLEET_SUMMARY_FIXTURE,
  WEEKLY_PERFORMANCE_FIXTURE,
  ACTIVE_DRIVERS_FIXTURE,
  DRIVER_ROSTER_FIXTURE,
  VEHICLE_ROSTER_FIXTURE,
} from './fixtures/fleet';

jest.mock('./client', () => ({
  __esModule: true,
  ...jest.requireActual('./client'),
  apiRequest: jest.fn(),
}));
const mockedRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

beforeEach(() => mockedRequest.mockReset());

describe('getFleetSummary', () => {
  it('requests /tracking/fleet-summary and returns live data with isSample: false', async () => {
    const live = { ...FLEET_SUMMARY_FIXTURE, activeTrucks: 99 };
    mockedRequest.mockResolvedValue(live);

    await expect(getFleetSummary('jwt-abc')).resolves.toEqual({
      data: live,
      isSample: false,
    });
    expect(mockedRequest).toHaveBeenCalledWith('/tracking/fleet-summary', {
      token: 'jwt-abc',
    });
  });

  it('falls back to the fleet summary fixture with isSample: true when the endpoint 404s', async () => {
    mockedRequest.mockRejectedValue(new ApiError('Not found.', 404));

    await expect(getFleetSummary('jwt-abc')).resolves.toEqual({
      data: FLEET_SUMMARY_FIXTURE,
      isSample: true,
    });
  });
});

describe('getWeeklyPerformance', () => {
  it('requests /tracking/weekly-performance and returns live data with isSample: false', async () => {
    const live = [WEEKLY_PERFORMANCE_FIXTURE[0]];
    mockedRequest.mockResolvedValue(live);

    await expect(getWeeklyPerformance('jwt-abc')).resolves.toEqual({
      data: live,
      isSample: false,
    });
    expect(mockedRequest).toHaveBeenCalledWith(
      '/tracking/weekly-performance',
      { token: 'jwt-abc' },
    );
  });

  it('falls back to the weekly performance fixture with isSample: true when the endpoint 404s', async () => {
    mockedRequest.mockRejectedValue(new ApiError('Not found.', 404));

    await expect(getWeeklyPerformance('jwt-abc')).resolves.toEqual({
      data: WEEKLY_PERFORMANCE_FIXTURE,
      isSample: true,
    });
  });

  it('falls back to the fixture with isSample: true when the endpoint returns an empty array', async () => {
    mockedRequest.mockResolvedValue([]);

    await expect(getWeeklyPerformance('jwt-abc')).resolves.toEqual({
      data: WEEKLY_PERFORMANCE_FIXTURE,
      isSample: true,
    });
  });
});

describe('getActiveDrivers', () => {
  it('requests /tracking/active-drivers and returns live data with isSample: false', async () => {
    const live = [ACTIVE_DRIVERS_FIXTURE[0]];
    mockedRequest.mockResolvedValue(live);

    await expect(getActiveDrivers('jwt-abc')).resolves.toEqual({
      data: live,
      isSample: false,
    });
    expect(mockedRequest).toHaveBeenCalledWith('/tracking/active-drivers', {
      token: 'jwt-abc',
    });
  });

  it('falls back to the active drivers fixture with isSample: true when the endpoint 404s', async () => {
    mockedRequest.mockRejectedValue(new ApiError('Not found.', 404));

    await expect(getActiveDrivers('jwt-abc')).resolves.toEqual({
      data: ACTIVE_DRIVERS_FIXTURE,
      isSample: true,
    });
  });

  it('falls back to the fixture with isSample: true when the endpoint returns an empty array', async () => {
    mockedRequest.mockResolvedValue([]);

    await expect(getActiveDrivers('jwt-abc')).resolves.toEqual({
      data: ACTIVE_DRIVERS_FIXTURE,
      isSample: true,
    });
  });
});

describe('getDriverRoster', () => {
  it('requests /fleet/drivers and returns live data with isSample: false', async () => {
    const live = [DRIVER_ROSTER_FIXTURE[0]];
    mockedRequest.mockResolvedValue(live);

    await expect(getDriverRoster('jwt-abc')).resolves.toEqual({
      data: live,
      isSample: false,
    });
    expect(mockedRequest).toHaveBeenCalledWith('/fleet/drivers', {
      token: 'jwt-abc',
    });
  });

  it('falls back to the driver roster fixture with isSample: true when the endpoint 404s', async () => {
    mockedRequest.mockRejectedValue(new ApiError('Not found.', 404));

    await expect(getDriverRoster('jwt-abc')).resolves.toEqual({
      data: DRIVER_ROSTER_FIXTURE,
      isSample: true,
    });
  });

  it('falls back to the fixture with isSample: true when the endpoint returns an empty array', async () => {
    mockedRequest.mockResolvedValue([]);

    await expect(getDriverRoster('jwt-abc')).resolves.toEqual({
      data: DRIVER_ROSTER_FIXTURE,
      isSample: true,
    });
  });
});

describe('getVehicleRoster', () => {
  it('requests /fleet/vehicles and returns live data with isSample: false', async () => {
    const live = [VEHICLE_ROSTER_FIXTURE[0]];
    mockedRequest.mockResolvedValue(live);

    await expect(getVehicleRoster('jwt-abc')).resolves.toEqual({
      data: live,
      isSample: false,
    });
    expect(mockedRequest).toHaveBeenCalledWith('/fleet/vehicles', {
      token: 'jwt-abc',
    });
  });

  it('falls back to the vehicle roster fixture with isSample: true when the endpoint 404s', async () => {
    mockedRequest.mockRejectedValue(new ApiError('Not found.', 404));

    await expect(getVehicleRoster('jwt-abc')).resolves.toEqual({
      data: VEHICLE_ROSTER_FIXTURE,
      isSample: true,
    });
  });

  it('falls back to the fixture with isSample: true when the endpoint returns an empty array', async () => {
    mockedRequest.mockResolvedValue([]);

    await expect(getVehicleRoster('jwt-abc')).resolves.toEqual({
      data: VEHICLE_ROSTER_FIXTURE,
      isSample: true,
    });
  });
});
