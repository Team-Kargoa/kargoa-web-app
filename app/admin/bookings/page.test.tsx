import { render, screen, within } from '@testing-library/react';
import { redirect } from 'next/navigation';
import AdminBookingsPage from './page';
import { getAccessToken } from '@/lib/session';
import { listBookings } from '@/lib/api/bookings';
import type { AdminBookingSummary } from '@/lib/api/bookings';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));
jest.mock('@/lib/session');
jest.mock('@/lib/api/bookings');

const mockedRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockedGetAccessToken = getAccessToken as jest.MockedFunction<
  typeof getAccessToken
>;
const mockedListBookings = listBookings as jest.MockedFunction<
  typeof listBookings
>;

const BOOKINGS: AdminBookingSummary[] = [
  {
    id: 'b1',
    status: 'in_progress',
    pickup_location: { latitude: 3.87, longitude: 11.52 },
    pickup_address: 'Carrefour Nlongkak, Yaoundé',
    dropoff_location: { latitude: 3.86, longitude: 11.49 },
    dropoff_address: 'Marché Mokolo, Yaoundé',
    vehicle_category: { id: 'c1', name: 'Mini Truck' },
    estimated_fare: '3225.00',
    final_fare: null,
    distance_km: '5.61',
    payment_method: 'cash',
    payment_status: 'pending',
    driver: {
      id: 'd1',
      user: {
        id: 'du1',
        full_name: 'Jean Mbarga',
        phone_number: '+237691234567',
      },
      vehicle: { plate_number: 'LT 123 AB' },
    },
    created_at: '2026-08-01T10:00:00Z',
    accepted_at: '2026-08-01T10:05:00Z',
    completed_at: null,
  },
  {
    id: 'b2',
    status: 'pending_dispatch',
    pickup_location: { latitude: 3.88, longitude: 11.5 },
    pickup_address: 'Bastos, Rue 1.032',
    dropoff_location: { latitude: 3.85, longitude: 11.5 },
    dropoff_address: 'Etoudi',
    vehicle_category: { id: 'c2', name: 'Pickup' },
    estimated_fare: '1800.00',
    final_fare: null,
    distance_km: null,
    payment_method: 'cash',
    payment_status: 'pending',
    driver: null,
    created_at: '2026-08-02T09:00:00Z',
    accepted_at: null,
    completed_at: null,
  },
];
const META = { count: 2, page: 1, page_size: 20, total_pages: 1 };

function searchParams(params: Record<string, string> = {}) {
  return Promise.resolve(params);
}

describe('AdminBookingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetAccessToken.mockResolvedValue('jwt-abc');
    mockedListBookings.mockResolvedValue({ bookings: BOOKINGS, meta: META });
  });

  it('redirects to /signin when there is no access token, without calling the API', async () => {
    mockedGetAccessToken.mockResolvedValue(undefined);

    await expect(
      AdminBookingsPage({ searchParams: searchParams() }),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(mockedRedirect).toHaveBeenCalledWith('/signin');
    expect(mockedListBookings).not.toHaveBeenCalled();
  });

  it('fetches bookings with the session token and no filters by default', async () => {
    render(await AdminBookingsPage({ searchParams: searchParams() }));
    expect(mockedListBookings).toHaveBeenCalledWith('jwt-abc', {
      status: undefined,
      page: undefined,
    });
  });

  it('passes the status and page query params through', async () => {
    render(
      await AdminBookingsPage({
        searchParams: searchParams({ status: 'in_progress', page: '2' }),
      }),
    );
    expect(mockedListBookings).toHaveBeenCalledWith('jwt-abc', {
      status: 'in_progress',
      page: 2,
    });
  });

  it('renders the heading and a row per booking with pickup, dropoff, fare, driver and status', async () => {
    render(await AdminBookingsPage({ searchParams: searchParams() }));

    expect(
      screen.getByRole('heading', { name: 'Bookings' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Carrefour Nlongkak, Yaoundé')).toBeInTheDocument();
    expect(screen.getByText('Marché Mokolo, Yaoundé')).toBeInTheDocument();
    expect(screen.getByText('3,225 XAF')).toBeInTheDocument();
    expect(screen.getByText('LT 123 AB')).toBeInTheDocument();
    const table = screen.getByRole('table');
    expect(within(table).getByText('In Progress')).toBeInTheDocument();
  });

  it('shows "Unassigned" for a booking with no driver yet', async () => {
    render(await AdminBookingsPage({ searchParams: searchParams() }));
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
  });

  it('links each row to its detail screen at /admin/bookings/{id}', async () => {
    render(await AdminBookingsPage({ searchParams: searchParams() }));
    const links = screen.getAllByRole('link', { name: /view/i });
    expect(links[0]).toHaveAttribute('href', '/admin/bookings/b1');
    expect(links[1]).toHaveAttribute('href', '/admin/bookings/b2');
  });

  it('renders the status filters as links, marking the active one with aria-current', async () => {
    render(
      await AdminBookingsPage({
        searchParams: searchParams({ status: 'completed' }),
      }),
    );
    const all = screen.getByRole('link', { name: 'All' });
    const completed = screen.getByRole('link', { name: 'Completed' });

    expect(all).toHaveAttribute('href', '/admin/bookings');
    expect(completed).toHaveAttribute(
      'href',
      '/admin/bookings?status=completed',
    );
    expect(completed).toHaveAttribute('aria-current', 'page');
    expect(all).not.toHaveAttribute('aria-current');
  });

  it('renders an empty-state row when no bookings match the filter', async () => {
    mockedListBookings.mockResolvedValue({
      bookings: [],
      meta: { count: 0, page: 1, page_size: 20, total_pages: 0 },
    });
    render(
      await AdminBookingsPage({
        searchParams: searchParams({ status: 'cancelled' }),
      }),
    );
    expect(
      screen.getByText(/no bookings match this filter/i),
    ).toBeInTheDocument();
  });

  it('shows the booking count from meta.count in the SHOWING line', async () => {
    render(await AdminBookingsPage({ searchParams: searchParams() }));
    expect(screen.getByText(/Showing 1-2 of 2 bookings/i)).toBeInTheDocument();
  });
});
