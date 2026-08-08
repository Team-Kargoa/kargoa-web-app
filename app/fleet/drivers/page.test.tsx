import { render, screen, fireEvent } from '@testing-library/react';
import { redirect } from 'next/navigation';
import FleetDriversPage from './page';
import { getAccessToken } from '@/lib/session';
import { getDriverRoster, getVehicleRoster } from '@/lib/api/fleet';
import {
  DRIVER_ROSTER_FIXTURE,
  VEHICLE_ROSTER_FIXTURE,
} from '@/lib/api/fixtures/fleet';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));
jest.mock('@/lib/session');
jest.mock('@/lib/api/fleet');

const mockedRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockedGetAccessToken = getAccessToken as jest.MockedFunction<
  typeof getAccessToken
>;
const mockedGetDriverRoster = getDriverRoster as jest.MockedFunction<
  typeof getDriverRoster
>;
const mockedGetVehicleRoster = getVehicleRoster as jest.MockedFunction<
  typeof getVehicleRoster
>;

beforeEach(() => {
  jest.clearAllMocks();
  mockedGetAccessToken.mockResolvedValue('jwt-abc');
  mockedGetDriverRoster.mockResolvedValue({
    data: DRIVER_ROSTER_FIXTURE,
    isSample: true,
  });
  mockedGetVehicleRoster.mockResolvedValue({
    data: VEHICLE_ROSTER_FIXTURE,
    isSample: true,
  });
});

describe('FleetDriversPage', () => {
  it('renders the Manage Fleet heading and subtitle', async () => {
    render(await FleetDriversPage());
    expect(
      screen.getByRole('heading', { name: 'Manage Fleet' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Real-time oversight of your assets and workforce across the hub.',
      ),
    ).toBeInTheDocument();
  });

  it('renders the Drivers and Vehicles tabs with counts from the roster lengths', async () => {
    render(await FleetDriversPage());
    expect(screen.getByRole('tab', { name: /drivers/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /vehicles/i })).toBeInTheDocument();
    // Two drivers, three vehicles in the fixture.
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders driver cards by default, with formatted phone and font-mono plate', async () => {
    render(await FleetDriversPage());
    expect(screen.getByText('Jean-Paul Ndi')).toBeInTheDocument();
    expect(screen.getByText('+237 6 70 12 34 56')).toBeInTheDocument();
    expect(screen.getByText('ON DUTY')).toBeInTheDocument();
    expect(screen.getByText("Marie Eto'o")).toBeInTheDocument();
    expect(screen.getByText('OFF DUTY')).toBeInTheDocument();

    const plate = screen.getByText('LT-942-KM');
    expect(plate).toHaveClass('font-mono');

    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('22')).toBeInTheDocument();
  });

  it('renders a "View Earnings" and message action for each driver card', async () => {
    render(await FleetDriversPage());
    expect(
      screen.getAllByRole('button', { name: /view earnings/i }),
    ).toHaveLength(2);
    expect(
      screen.getByRole('button', { name: /message jean-paul ndi/i }),
    ).toBeInTheDocument();
  });

  it('does not render the vehicles table until the Vehicles tab is selected', async () => {
    render(await FleetDriversPage());
    expect(screen.queryByText('Isuzu FSR')).not.toBeInTheDocument();
  });

  it('switches to the vehicle table when the Vehicles tab is clicked, hiding driver cards', async () => {
    render(await FleetDriversPage());
    fireEvent.click(screen.getByRole('tab', { name: /vehicles/i }));

    expect(screen.getByText('LT-942-KM')).toBeInTheDocument();
    expect(screen.getByText('Isuzu FSR')).toBeInTheDocument();
    expect(screen.getByText('Large Cargo')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();

    expect(screen.getByText('CE-551-ZZ')).toBeInTheDocument();
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
    expect(screen.getByText('Maintenance')).toBeInTheDocument();

    expect(screen.getByText('SW-220-RX')).toBeInTheDocument();
    expect(screen.getByText('Samuel M.')).toBeInTheDocument();
    expect(screen.getByText('Needs Paperwork')).toBeInTheDocument();

    // Jean-Paul Ndi's name also appears as the assigned driver on this
    // vehicle row, so assert on something unique to the driver card instead.
    expect(screen.queryByText('+237 6 70 12 34 56')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /view earnings/i }),
    ).not.toBeInTheDocument();
  });

  it('renders the vehicle table column headers in the design’s uppercase, matching CATEGORY/ASSIGNED DRIVER/STATUS/ACTION', async () => {
    render(await FleetDriversPage());
    fireEvent.click(screen.getByRole('tab', { name: /vehicles/i }));

    expect(
      screen.getByRole('columnheader', { name: 'VEHICLE INFO' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'CATEGORY' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'ASSIGNED DRIVER' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'STATUS' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'ACTION' }),
    ).toBeInTheDocument();
  });

  it('wraps the vehicle table in a horizontal-scroll container on narrow viewports', async () => {
    const { container } = render(await FleetDriversPage());
    fireEvent.click(screen.getByRole('tab', { name: /vehicles/i }));

    const table = container.querySelector('table');
    expect(table?.parentElement).toHaveClass('overflow-x-auto');
  });

  it('switches back to driver cards when the Drivers tab is re-selected', async () => {
    render(await FleetDriversPage());
    fireEvent.click(screen.getByRole('tab', { name: /vehicles/i }));
    fireEvent.click(screen.getByRole('tab', { name: /drivers/i }));
    expect(screen.getByText('Jean-Paul Ndi')).toBeInTheDocument();
    expect(screen.queryByText('Isuzu FSR')).not.toBeInTheDocument();
  });

  it('renders the vehicle plate in font-mono', async () => {
    render(await FleetDriversPage());
    fireEvent.click(screen.getByRole('tab', { name: /vehicles/i }));
    expect(screen.getByText('LT-942-KM')).toHaveClass('font-mono');
  });

  it('renders a more-actions control for each vehicle row', async () => {
    render(await FleetDriversPage());
    fireEvent.click(screen.getByRole('tab', { name: /vehicles/i }));
    expect(
      screen.getByRole('button', { name: /more actions for lt-942-km/i }),
    ).toBeInTheDocument();
  });

  it('renders the Add Vehicle/Driver control', async () => {
    render(await FleetDriversPage());
    expect(
      screen.getByRole('button', { name: /add vehicle\/driver/i }),
    ).toBeInTheDocument();
  });

  it('fetches the driver and vehicle rosters with the access token from the session', async () => {
    render(await FleetDriversPage());
    expect(mockedGetDriverRoster).toHaveBeenCalledWith('jwt-abc');
    expect(mockedGetVehicleRoster).toHaveBeenCalledWith('jwt-abc');
  });

  it('redirects to /signin when there is no access token, without calling the API', async () => {
    mockedGetAccessToken.mockResolvedValue(undefined);

    await expect(FleetDriversPage()).rejects.toThrow('NEXT_REDIRECT');

    expect(mockedRedirect).toHaveBeenCalledWith('/signin');
    expect(mockedGetDriverRoster).not.toHaveBeenCalled();
  });

  it('shows the Sample data badge on the drivers tab when the driver roster is sample data', async () => {
    render(await FleetDriversPage());
    expect(screen.getByText('Sample data')).toBeInTheDocument();
  });

  it('shows the Sample data badge on the vehicles tab when the vehicle roster is sample data', async () => {
    mockedGetDriverRoster.mockResolvedValue({
      data: DRIVER_ROSTER_FIXTURE,
      isSample: false,
    });
    render(await FleetDriversPage());
    expect(screen.queryByText('Sample data')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /vehicles/i }));
    expect(screen.getByText('Sample data')).toBeInTheDocument();
  });

  it('shows no Sample data badge when both rosters are real data', async () => {
    mockedGetDriverRoster.mockResolvedValue({
      data: DRIVER_ROSTER_FIXTURE,
      isSample: false,
    });
    mockedGetVehicleRoster.mockResolvedValue({
      data: VEHICLE_ROSTER_FIXTURE,
      isSample: false,
    });
    render(await FleetDriversPage());
    expect(screen.queryByText('Sample data')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /vehicles/i }));
    expect(screen.queryByText('Sample data')).not.toBeInTheDocument();
  });
});
