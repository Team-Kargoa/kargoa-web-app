import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import FleetRegistrationPage from './page';
import { sendOtp } from '../../actions';

jest.mock('../../actions', () => ({ sendOtp: jest.fn() }));
jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));

const mockedSendOtp = sendOtp as jest.Mock;
const mockPush = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  mockedSendOtp.mockResolvedValue({ error: null });
});

describe('FleetRegistrationPage', () => {
  it('renders the fleet logistics header', () => {
    render(<FleetRegistrationPage />);
    expect(
      screen.getByRole('heading', { name: /fleet logistics/i }),
    ).toBeInTheDocument();
  });

  it('renders the registration headline and copy', () => {
    render(<FleetRegistrationPage />);
    expect(
      screen.getByRole('heading', { name: 'Partner with KmerCargo' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Enter your phone number to start managing your fleet across Cameroon.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Security: We will send a 6-digit verification code to this number.',
      ),
    ).toBeInTheDocument();
  });

  it('renders the marketing headline and stats', () => {
    render(<FleetRegistrationPage />);
    expect(
      screen.getByText('Optimizing heavy-haulage across the CEMAC region.'),
    ).toBeInTheDocument();
    expect(screen.getByText('500+')).toBeInTheDocument();
    expect(screen.getByText('Active Fleets')).toBeInTheDocument();
  });

  it('renders the phone field under the design label', () => {
    render(<FleetRegistrationPage />);
    expect(screen.getByLabelText('Business Phone Number')).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    render(<FleetRegistrationPage />);
    expect(
      screen.getByRole('button', { name: /continue to registration/i }),
    ).toBeInTheDocument();
  });

  it('renders the login link for existing accounts with a real destination', () => {
    render(<FleetRegistrationPage />);
    expect(
      screen.getByRole('link', {
        name: 'Login if you already have an account',
      }),
    ).toHaveAttribute('href', '/signin');
  });

  it('renders its own footer with real link destinations', () => {
    render(<FleetRegistrationPage />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Terms of Service' }),
    ).toHaveAttribute('href', '/terms');
  });

  it('submits the phone number through sendOtp with purpose=registration', async () => {
    render(<FleetRegistrationPage />);
    const input = screen.getByLabelText('Business Phone Number');
    fireEvent.change(input, { target: { value: '+237691234567' } });
    fireEvent.click(
      screen.getByRole('button', { name: /continue to registration/i }),
    );

    await waitFor(() => expect(mockedSendOtp).toHaveBeenCalledTimes(1));
    const [, formData] = mockedSendOtp.mock.calls[0];
    expect(formData.get('phone_number')).toBe('+237691234567');
    expect(formData.get('purpose')).toBe('registration');
  });

  it('redirects to /verify with the phone, purpose and fleet_owner role on success', async () => {
    render(<FleetRegistrationPage />);
    const input = screen.getByLabelText('Business Phone Number');
    fireEvent.change(input, { target: { value: '+237691234567' } });
    fireEvent.click(
      screen.getByRole('button', { name: /continue to registration/i }),
    );

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith(
        '/verify?phone=%2B237691234567&purpose=registration&role=fleet_owner',
      ),
    );
  });

  it('displays an error returned by the action and does not redirect', async () => {
    mockedSendOtp.mockResolvedValue({
      error: 'Enter a valid Cameroon phone number.',
    });
    render(<FleetRegistrationPage />);
    fireEvent.click(
      screen.getByRole('button', { name: /continue to registration/i }),
    );

    expect(
      await screen.findByText('Enter a valid Cameroon phone number.'),
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
