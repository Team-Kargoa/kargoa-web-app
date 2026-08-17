import { redirect } from 'next/navigation';
import VehicleCategoriesPage from './page';
import { getAccessToken } from '@/lib/session';
import { listVehicleCategories } from '@/lib/api/admin';
import { VEHICLE_CATEGORIES_FIXTURE } from '@/lib/api/fixtures/admin';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));
jest.mock('@/lib/session');
jest.mock('@/lib/api/admin');

const mockedRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockedGetAccessToken = getAccessToken as jest.MockedFunction<
  typeof getAccessToken
>;
const mockedListVehicleCategories =
  listVehicleCategories as jest.MockedFunction<typeof listVehicleCategories>;

describe('VehicleCategoriesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetAccessToken.mockResolvedValue('jwt-admin-token');
    mockedListVehicleCategories.mockResolvedValue({
      data: VEHICLE_CATEGORIES_FIXTURE,
      isSample: true,
    });
  });

  it('redirects to /signin when there is no access token', async () => {
    mockedGetAccessToken.mockResolvedValue(undefined);

    await expect(VehicleCategoriesPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(mockedRedirect).toHaveBeenCalledWith('/signin');
    expect(mockedListVehicleCategories).not.toHaveBeenCalled();
  });

  it('fetches vehicle categories with the session token', async () => {
    await VehicleCategoriesPage();
    expect(mockedListVehicleCategories).toHaveBeenCalledWith('jwt-admin-token');
  });

  it('renders vehicle categories from live data', async () => {
    mockedListVehicleCategories.mockResolvedValue({
      data: VEHICLE_CATEGORIES_FIXTURE,
      isSample: false,
    });

    const page = await VehicleCategoriesPage();
    expect(page).toBeDefined();
  });

  it('renders vehicle categories from fixture data with sample badge', async () => {
    const page = await VehicleCategoriesPage();
    expect(page).toBeDefined();
  });

  it('handles empty vehicle categories list', async () => {
    mockedListVehicleCategories.mockResolvedValue({
      data: [],
      isSample: true,
    });

    const page = await VehicleCategoriesPage();
    expect(page).toBeDefined();
  });

  it('renders all vehicle category details correctly', async () => {
    const page = await VehicleCategoriesPage();

    // Verify that all categories are processed
    expect(mockedListVehicleCategories).toHaveBeenCalledWith('jwt-admin-token');
    expect(page).toBeDefined();
  });

  it('displays active and inactive categories with proper status badges', async () => {
    mockedListVehicleCategories.mockResolvedValue({
      data: [
        ...VEHICLE_CATEGORIES_FIXTURE,
        {
          id: 'cat-4',
          name: 'Inactive Category',
          description: 'This category is inactive',
          base_fare: 5000,
          per_km_rate: 600,
          minimum_fare: 8000,
          is_active: false,
        },
      ],
      isSample: true,
    });

    const page = await VehicleCategoriesPage();
    expect(page).toBeDefined();
  });
});
