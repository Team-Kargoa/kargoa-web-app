import { getCategories } from './vehicles';
import { apiRequest } from './client';
import type { VehicleCategory } from './types';

jest.mock('./client');
const mockedRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

beforeEach(() => mockedRequest.mockReset());

describe('getCategories', () => {
  it('unwraps the categories array from the live response envelope', async () => {
    // Verified live against the running backend (2026-08-06):
    // GET /vehicles/categories resolves envelope.data as
    // { categories: VehicleCategory[] }, NOT a bare array — apiRequest only
    // unwraps the outer {status, data, message} envelope, so getCategories
    // must unwrap this one extra level itself.
    const categories: VehicleCategory[] = [
      {
        id: '1',
        name: 'Pickup',
        description: 'Small loads',
        base_fare: '1000.00',
        per_km_rate: '150.00',
        minimum_fare: '2000.00',
        is_active: true,
      },
    ];
    mockedRequest.mockResolvedValue({ categories });

    await expect(getCategories()).resolves.toBe(categories);

    expect(mockedRequest).toHaveBeenCalledWith('/vehicles/categories');
  });

  it('calls apiRequest with no options object (no token, no body)', async () => {
    // /vehicles/categories is public — this pins that getCategories never
    // attaches a token or a body, unlike every other module in lib/api.
    mockedRequest.mockResolvedValue({ categories: [] });
    await getCategories();
    expect(mockedRequest.mock.calls[0]).toHaveLength(1);
  });
});
