import { render, screen } from '@testing-library/react';
import { notFound, redirect } from 'next/navigation';
import AdminBookingDetailPage from './page';
import { getAccessToken } from '@/lib/session';
import {
  getBooking,
  getBookingLocation,
  getBookingRoute,
  getBookingRatings,
} from '@/lib/api/bookings';
import { ApiError } from '@/lib/api/client';
import type { AdminBookingSummary } from '@/lib/api/bookings';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));
jest.mock('@/lib/session');
jest.mock('@/lib/api/bookings');

const mockedRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockedNotFound = notFound as jest.MockedFunction<typeof notFound>;
const mockedGetAccessToken = getAccessToken as jest.MockedFunction<
  typeof getAccessToken
>;
const mockedGetBooking = getBooking as jest.MockedFunction<typeof getBooking>;
const mockedGetBookingLocation = getBookingLocation as jest.MockedFunction<
  typeof getBookingLocation
>;
const mockedGetBookingRoute = getBookingRoute as jest.MockedFunction<
  typeof getBookingRoute
>;
const mockedGetBookingRatings = getBookingRatings as jest.MockedFunction<
  typeof getBookingRatings
>;

const BOOKING: AdminBookingSummary = {
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
      id: 'driver-u1',
      full_name: 'Jean Mbarga',
      phone_number: '+237691234567',
    },
    vehicle: { plate_number: 'LT 123 AB' },
  },
  created_at: '2026-08-01T10:00:00Z',
  accepted_at: '2026-08-01T10:05:00Z',
  completed_at: null,
};

function paramsWith(id: string) {
  return Promise.resolve({ id });
}

describe('AdminBookingDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetAccessToken.mockResolvedValue('jwt-abc');
    mockedGetBooking.mockResolvedValue(BOOKING);
    mockedGetBookingLocation.mockResolvedValue(null);
    mockedGetBookingRoute.mockResolvedValue({
      booking_id: 'b1',
      point_count: 0,
      truncated: false,
      points: [],
    });
    mockedGetBookingRatings.mockResolvedValue([]);
  });

  it('redirects to /signin without calling the API when there is no session token', async () => {
    mockedGetAccessToken.mockResolvedValue(undefined);

    await expect(
      AdminBookingDetailPage({ params: paramsWith('b1') }),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(mockedRedirect).toHaveBeenCalledWith('/signin');
    expect(mockedGetBooking).not.toHaveBeenCalled();
  });

  it('fetches the booking, location, route and ratings with the session token and id', async () => {
    render(await AdminBookingDetailPage({ params: paramsWith('b1') }));

    expect(mockedGetBooking).toHaveBeenCalledWith('jwt-abc', 'b1');
    expect(mockedGetBookingLocation).toHaveBeenCalledWith('jwt-abc', 'b1');
    expect(mockedGetBookingRoute).toHaveBeenCalledWith('jwt-abc', 'b1');
    expect(mockedGetBookingRatings).toHaveBeenCalledWith('jwt-abc', 'b1');
  });

  it('calls notFound for a 404 from getBooking', async () => {
    mockedGetBooking.mockRejectedValue(new ApiError('Not found.', 404));

    await expect(
      AdminBookingDetailPage({ params: paramsWith('does-not-exist') }),
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(mockedNotFound).toHaveBeenCalledTimes(1);
  });

  it('re-throws a non-404 error from getBooking instead of masking it', async () => {
    mockedGetBooking.mockRejectedValue(new ApiError('Server error.', 500));

    await expect(
      AdminBookingDetailPage({ params: paramsWith('b1') }),
    ).rejects.toMatchObject({ status: 500 });

    expect(mockedNotFound).not.toHaveBeenCalled();
  });

  it('renders the booking category, addresses, fare and driver', async () => {
    render(await AdminBookingDetailPage({ params: paramsWith('b1') }));

    expect(
      screen.getByRole('heading', { name: 'Mini Truck' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Carrefour Nlongkak, Yaoundé')).toBeInTheDocument();
    expect(screen.getByText('Marché Mokolo, Yaoundé')).toBeInTheDocument();
    expect(screen.getByText('Jean Mbarga')).toBeInTheDocument();
  });

  it('shows the no-live-position message when location is null', async () => {
    render(await AdminBookingDetailPage({ params: paramsWith('b1') }));
    expect(screen.getByText(/no live position available/i)).toBeInTheDocument();
  });

  it('shows the fuzzed position and admin-oversight note when a location is available', async () => {
    mockedGetBookingLocation.mockResolvedValue({
      latitude: 3.876,
      longitude: 11.5175,
      heading: 90,
      speed: 12,
      ts: '2026-08-07T10:12:00Z',
      precise: false,
    });

    render(await AdminBookingDetailPage({ params: paramsWith('b1') }));

    expect(screen.getByText('3.8760, 11.5175')).toBeInTheDocument();
    expect(
      screen.getByText(/approximate position \(~200m\)/i),
    ).toBeInTheDocument();
  });

  it('shows the route point count and truncated warning when applicable', async () => {
    mockedGetBookingRoute.mockResolvedValue({
      booking_id: 'b1',
      point_count: 2,
      truncated: true,
      points: [
        {
          lat: 3.87,
          lng: 11.52,
          heading: 90,
          speed: 12,
          ts: '2026-08-07T10:06:00Z',
        },
        {
          lat: 3.871,
          lng: 11.518,
          heading: 91,
          speed: 10,
          ts: '2026-08-07T10:06:05Z',
        },
      ],
    });

    render(await AdminBookingDetailPage({ params: paramsWith('b1') }));

    expect(screen.getByText('2 points recorded')).toBeInTheDocument();
    expect(screen.getByText(/this route was truncated/i)).toBeInTheDocument();
  });

  it('shows the no-ratings-yet message when the ratings array is empty', async () => {
    render(await AdminBookingDetailPage({ params: paramsWith('b1') }));
    expect(screen.getByText(/no ratings yet/i)).toBeInTheDocument();
  });

  it("labels a rating whose ratee is the driver's user id as Customer → Driver", async () => {
    mockedGetBookingRatings.mockResolvedValue([
      {
        id: 'r1',
        booking_id: 'b1',
        rater_id: 'customer-u2',
        ratee_id: 'driver-u1',
        score: 5,
        comment: 'Great driver!',
        created_at: '2026-08-07T10:00:00Z',
      },
    ]);

    render(await AdminBookingDetailPage({ params: paramsWith('b1') }));

    expect(screen.getByText('Customer → Driver')).toBeInTheDocument();
    expect(screen.getByText('Great driver!')).toBeInTheDocument();
  });

  it("labels a rating whose rater is the driver's user id as Driver → Customer", async () => {
    mockedGetBookingRatings.mockResolvedValue([
      {
        id: 'r2',
        booking_id: 'b1',
        rater_id: 'driver-u1',
        ratee_id: 'customer-u2',
        score: 4,
        comment: '',
        created_at: '2026-08-07T10:00:00Z',
      },
    ]);

    render(await AdminBookingDetailPage({ params: paramsWith('b1') }));

    expect(screen.getByText('Driver → Customer')).toBeInTheDocument();
  });

  it('renders a link back to the bookings list', async () => {
    render(await AdminBookingDetailPage({ params: paramsWith('b1') }));
    expect(
      screen.getByRole('link', { name: /back to bookings/i }),
    ).toHaveAttribute('href', '/admin/bookings');
  });
});
