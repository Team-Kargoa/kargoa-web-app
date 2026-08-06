import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import OnboardingVehiclePage from './page';
import { getCategories } from '@/lib/api/vehicles';
import { VEHICLE_CATEGORIES_FIXTURE } from '@/lib/api/fixtures/vehicles';

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));
jest.mock('@/lib/api/vehicles');

const mockedGetCategories = getCategories as jest.MockedFunction<
  typeof getCategories
>;
const mockBack = jest.fn();
const mockPush = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ back: mockBack, push: mockPush });
  mockedGetCategories.mockResolvedValue(VEHICLE_CATEGORIES_FIXTURE);
});

describe('OnboardingVehiclePage', () => {
  it('fetches the live vehicle categories', async () => {
    render(await OnboardingVehiclePage());
    expect(mockedGetCategories).toHaveBeenCalledTimes(1);
  });

  it('renders the KmerCargo header with the FLEET_ONBOARDING tracking label', async () => {
    render(await OnboardingVehiclePage());
    expect(screen.getByText('KmerCargo')).toBeInTheDocument();
    expect(screen.getByText('FLEET_ONBOARDING')).toBeInTheDocument();
  });

  it('navigates back when the header back control is clicked', async () => {
    render(await OnboardingVehiclePage());
    fireEvent.click(screen.getAllByRole('button', { name: /go back/i })[0]);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('renders the step indicator and heading', async () => {
    render(await OnboardingVehiclePage());
    expect(screen.getByText('Step 3 of 3')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Vehicle Registration' }),
    ).toBeInTheDocument();
    expect(screen.getByText('100% Ready')).toBeInTheDocument();
  });

  it('renders the first vehicle entry card with a plate field in font-mono', async () => {
    render(await OnboardingVehiclePage());
    expect(screen.getByText('VEHICLE_01')).toBeInTheDocument();
    const plate = screen.getByLabelText('License Plate Number');
    expect(plate).toBeInTheDocument();
    expect(plate).toHaveClass('font-mono');
    expect(
      screen.getByText(
        'Format: Region Code - Numbers - Letters (e.g., LT-123-AA)',
      ),
    ).toBeInTheDocument();
  });

  it('renders one category option per live vehicle category, none of the design’s hardcoded MINI/STD/LARGE trio', async () => {
    render(await OnboardingVehiclePage());
    expect(screen.getByRole('radio', { name: /pickup/i })).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: /mini truck/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: /standard truck/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: /large truck/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText('MINI')).not.toBeInTheDocument();
  });

  it('renders the insurance document upload control and reflects a selected file', async () => {
    render(await OnboardingVehiclePage());
    expect(
      screen.getByText('Insurance Document (PDF/JPG)'),
    ).toBeInTheDocument();

    const input = screen.getByLabelText(
      'Upload insurance document for vehicle 1',
    );
    expect(input).toBeInTheDocument();
    const file = new File(['x'], 'insurance.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(screen.getByText('insurance.pdf')).toBeInTheDocument();
  });

  it('switches the selected vehicle category when another option is chosen', async () => {
    render(await OnboardingVehiclePage());
    const pickup = screen.getByRole('radio', { name: /pickup/i });
    const largeTruck = screen.getByRole('radio', { name: /large truck/i });
    expect(pickup).toBeChecked();
    expect(largeTruck).not.toBeChecked();

    fireEvent.click(largeTruck);

    expect(largeTruck).toBeChecked();
    expect(pickup).not.toBeChecked();
  });

  it('adds another vehicle entry card when Add Another Vehicle is clicked', async () => {
    render(await OnboardingVehiclePage());
    expect(screen.queryByText('VEHICLE_02')).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /add another vehicle/i }),
    );

    expect(screen.getByText('VEHICLE_02')).toBeInTheDocument();
    expect(screen.getAllByLabelText('License Plate Number')).toHaveLength(2);
  });

  it('renders the Yaoundé compliance helper note', async () => {
    render(await OnboardingVehiclePage());
    expect(
      screen.getByText(
        'Vehicle details must match the physical registration document for Yaoundé regulatory compliance.',
      ),
    ).toBeInTheDocument();
  });

  it('renders the Finish Setup action and the Fleet Terms of Service link', async () => {
    render(await OnboardingVehiclePage());
    expect(
      screen.getByRole('button', { name: /finish setup/i }),
    ).toBeInTheDocument();
    const link = screen.getByRole('link', {
      name: 'Fleet Terms of Service',
    });
    expect(link).toHaveAttribute('href', '/terms');
  });

  it('navigates to the fleet dashboard on Finish Setup', async () => {
    render(await OnboardingVehiclePage());
    fireEvent.change(screen.getByLabelText('License Plate Number'), {
      target: { value: 'LT-123-AA' },
    });
    fireEvent.click(screen.getByRole('button', { name: /finish setup/i }));
    expect(mockPush).toHaveBeenCalledWith('/fleet');
  });

  it('renders the contextual footer nav with Registration active, none of them real links', async () => {
    render(await OnboardingVehiclePage());
    expect(screen.getByText('Registration')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
    expect(
      screen.queryAllByRole('link', { name: /support|help/i }),
    ).toHaveLength(0);
  });
});
