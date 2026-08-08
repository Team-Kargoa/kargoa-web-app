import { render, screen } from '@testing-library/react';
import { DriverTable } from './driver-table';
import type { FleetDriver } from '@/lib/api/fleet';

const DRIVERS: FleetDriver[] = [
  {
    id: 'drv-1',
    name: 'Jean-Paul N.',
    verificationStatus: 'Verified',
    location: 'Yaoundé',
    vehicleId: 'CE-982-LU',
    route: 'Yaoundé → Douala',
    status: 'on-trip',
  },
  {
    id: 'drv-2',
    name: "Samuel Eto'o",
    verificationStatus: 'Verified',
    location: 'Edéa',
    vehicleId: 'LT-110-AA',
    route: 'Idle (Rest Stop)',
    status: 'online',
  },
  {
    id: 'drv-3',
    name: 'Moussa Traoré',
    verificationStatus: 'Maintenance',
    location: 'Bafoussam',
    vehicleId: 'OU-445-BB',
    route: 'Not Assigned',
    status: 'offline',
  },
];

describe('DriverTable', () => {
  it('renders the section heading', () => {
    render(<DriverTable drivers={DRIVERS} />);
    expect(
      screen.getByRole('heading', { name: 'Active Drivers' }),
    ).toBeInTheDocument();
  });

  it('renders a row per driver with name, vehicle ID and current route', () => {
    render(<DriverTable drivers={DRIVERS} />);
    expect(screen.getByText('Jean-Paul N.')).toBeInTheDocument();
    expect(screen.getByText('CE-982-LU')).toBeInTheDocument();
    expect(screen.getByText('Yaoundé → Douala')).toBeInTheDocument();

    expect(screen.getByText("Samuel Eto'o")).toBeInTheDocument();
    expect(screen.getByText('LT-110-AA')).toBeInTheDocument();
    expect(screen.getByText('Idle (Rest Stop)')).toBeInTheDocument();

    expect(screen.getByText('Moussa Traoré')).toBeInTheDocument();
    expect(screen.getByText('OU-445-BB')).toBeInTheDocument();
    expect(screen.getByText('Not Assigned')).toBeInTheDocument();
  });

  it('renders vehicle IDs in font-mono', () => {
    render(<DriverTable drivers={DRIVERS} />);
    expect(screen.getByText('CE-982-LU')).toHaveClass('font-mono');
    expect(screen.getByText('LT-110-AA')).toHaveClass('font-mono');
    expect(screen.getByText('OU-445-BB')).toHaveClass('font-mono');
  });

  it('renders a two-letter avatar initial per driver, consistent with the pending-verifications avatars', () => {
    render(<DriverTable drivers={DRIVERS} />);
    expect(screen.getByText('JN')).toBeInTheDocument();
    expect(screen.getByText('SE')).toBeInTheDocument();
    expect(screen.getByText('MT')).toBeInTheDocument();
  });

  it('renders the on-trip status label', () => {
    render(<DriverTable drivers={DRIVERS} />);
    expect(screen.getByText('On-Trip')).toBeInTheDocument();
  });

  it('renders the online status label', () => {
    render(<DriverTable drivers={DRIVERS} />);
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('renders the offline status label', () => {
    render(<DriverTable drivers={DRIVERS} />);
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('renders verification status and location for each driver', () => {
    render(<DriverTable drivers={DRIVERS} />);
    expect(screen.getByText('Verified • Yaoundé')).toBeInTheDocument();
    expect(screen.getByText('Maintenance • Bafoussam')).toBeInTheDocument();
  });

  it('renders a labelled actions button per driver', () => {
    render(<DriverTable drivers={DRIVERS} />);
    expect(
      screen.getByRole('button', { name: 'More actions for Jean-Paul N.' }),
    ).toBeInTheDocument();
  });

  it('renders the View All Drivers control', () => {
    render(<DriverTable drivers={DRIVERS} />);
    expect(
      screen.getByRole('button', { name: 'View All Drivers' }),
    ).toBeInTheDocument();
  });

  it('renders one row per driver and no more', () => {
    render(<DriverTable drivers={DRIVERS} />);
    expect(screen.getAllByRole('row')).toHaveLength(DRIVERS.length + 1); // + header row
  });

  it('renders the sample data badge when isSample is true', () => {
    render(<DriverTable drivers={DRIVERS} isSample />);
    expect(screen.getByText('Sample data')).toBeInTheDocument();
  });

  it('omits the sample data badge when isSample is false or omitted', () => {
    render(<DriverTable drivers={DRIVERS} />);
    expect(screen.queryByText('Sample data')).not.toBeInTheDocument();
  });
});
