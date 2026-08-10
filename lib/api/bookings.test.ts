import {
  listBookings,
  getBooking,
  getBookingLocation,
  getBookingRoute,
  getBookingRatings,
} from './bookings';
import { apiRequest, ApiError } from './client';

jest.mock('./client', () => ({
  __esModule: true,
  ...jest.requireActual('./client'),
  apiRequest: jest.fn(),
}));
const mockedRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

beforeEach(() => mockedRequest.mockReset());

const BOOKING = {
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
  created_at: '2026-08-07T10:00:00Z',
  accepted_at: '2026-08-07T10:05:00Z',
  completed_at: null,
};

describe('listBookings', () => {
  it('requests /bookings with the bearer token and returns bookings + meta', async () => {
    const meta = { count: 1, page: 1, page_size: 20, total_pages: 1 };
    mockedRequest.mockResolvedValue({ bookings: [BOOKING], meta });

    await expect(listBookings('jwt-abc')).resolves.toEqual({
      bookings: [BOOKING],
      meta,
    });
    expect(mockedRequest).toHaveBeenCalledWith('/bookings', {
      token: 'jwt-abc',
    });
  });

  it('passes status and page as query params when provided', async () => {
    mockedRequest.mockResolvedValue({
      bookings: [],
      meta: { count: 0, page: 2, page_size: 20, total_pages: 0 },
    });

    await listBookings('jwt-abc', { status: 'in_progress', page: 2 });

    expect(mockedRequest).toHaveBeenCalledWith(
      '/bookings?status=in_progress&page=2',
      { token: 'jwt-abc' },
    );
  });
});

describe('getBooking', () => {
  it('requests /bookings/{id} and returns the booking', async () => {
    mockedRequest.mockResolvedValue(BOOKING);

    await expect(getBooking('jwt-abc', 'b1')).resolves.toEqual(BOOKING);
    expect(mockedRequest).toHaveBeenCalledWith('/bookings/b1', {
      token: 'jwt-abc',
    });
  });
});

describe('getBookingLocation', () => {
  it('requests the location endpoint and returns it, fuzzed for an admin', async () => {
    const location = {
      latitude: 3.876,
      longitude: 11.518,
      heading: 90,
      speed: 12,
      ts: '2026-08-07T10:12:00Z',
      precise: false,
    };
    mockedRequest.mockResolvedValue(location);

    await expect(getBookingLocation('jwt-abc', 'b1')).resolves.toEqual(
      location,
    );
    expect(mockedRequest).toHaveBeenCalledWith(
      '/tracking/bookings/b1/location',
      { token: 'jwt-abc' },
    );
  });

  it('returns null on a 404 (no driver assigned yet, or nothing cached) instead of throwing', async () => {
    mockedRequest.mockRejectedValue(
      new ApiError('Driver location is not available.', 404),
    );

    await expect(getBookingLocation('jwt-abc', 'b1')).resolves.toBeNull();
  });

  it('propagates a non-404 error', async () => {
    mockedRequest.mockRejectedValue(new ApiError('Server error.', 500));

    await expect(getBookingLocation('jwt-abc', 'b1')).rejects.toMatchObject({
      status: 500,
    });
  });
});

describe('getBookingRoute', () => {
  it('requests the route endpoint and returns it', async () => {
    const route = {
      booking_id: 'b1',
      point_count: 2,
      truncated: false,
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
    };
    mockedRequest.mockResolvedValue(route);

    await expect(getBookingRoute('jwt-abc', 'b1')).resolves.toEqual(route);
    expect(mockedRequest).toHaveBeenCalledWith('/tracking/bookings/b1/route', {
      token: 'jwt-abc',
    });
  });
});

describe('getBookingRatings', () => {
  it('requests the ratings endpoint and unwraps the ratings array', async () => {
    const ratings = [
      {
        id: 'r1',
        booking_id: 'b1',
        rater_id: 'customer-u2',
        ratee_id: 'driver-u1',
        score: 5,
        comment: 'Great driver!',
        created_at: '2026-08-07T10:00:00Z',
      },
    ];
    mockedRequest.mockResolvedValue({ ratings });

    await expect(getBookingRatings('jwt-abc', 'b1')).resolves.toEqual(ratings);
    expect(mockedRequest).toHaveBeenCalledWith('/ratings/bookings/b1', {
      token: 'jwt-abc',
    });
  });

  it('returns an empty array when nobody has rated yet', async () => {
    mockedRequest.mockResolvedValue({ ratings: [] });

    await expect(getBookingRatings('jwt-abc', 'b1')).resolves.toEqual([]);
  });
});
