import {
  render,
  screen,
  within,
  fireEvent,
  waitFor,
} from '@testing-library/react';
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
  it('renders the KmerCargo brand in the header as a link back to the landing page', () => {
    render(<FleetRegistrationPage />);
    expect(
      screen.getByRole('heading', { name: 'KmerCargo' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'KmerCargo' })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('renders the brand at its original, larger-icon/compact-wordmark size (the "lg" variant), not the Navbar default', () => {
    render(<FleetRegistrationPage />);
    const link = screen.getByRole('link', { name: 'KmerCargo' });
    expect(link.querySelector('svg')).toHaveClass('h-7', 'w-7');
    expect(within(link).getByText('KmerCargo')).toHaveClass('text-lg');
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

  it('renders a back-to-home link pointing at the landing page', () => {
    render(<FleetRegistrationPage />);
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('renders the back-to-home link as the first interactive element in the header', () => {
    render(<FleetRegistrationPage />);
    const header = screen.getByRole('banner');
    const links = within(header).getAllByRole('link');
    expect(links[0]).toHaveAccessibleName(/back to home/i);
  });

  it('renders a Sign in toggle control instead of a link to the Admin Portal', () => {
    // Regression guard: a Link to /signin here sent fleet owners to the
    // Admin Portal screen — different branding, different copy, the
    // wrong door. The toggle must be a real control that swaps the form
    // in place, not navigation away from this screen.
    render(<FleetRegistrationPage />);
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /sign in/i }),
    ).not.toBeInTheDocument();
  });

  it('never links anywhere to /signin', () => {
    render(<FleetRegistrationPage />);
    const hrefs = screen
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'));
    expect(hrefs).not.toContain('/signin');
  });

  it('renders a visible text label beside each trust icon', () => {
    render(<FleetRegistrationPage />);
    expect(screen.getByText('Secure Payment')).toBeVisible();
    expect(screen.getByText('Real-time Tracking')).toBeVisible();
    expect(screen.getByText('Compliance Verified')).toBeVisible();
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

  describe('sign-in mode', () => {
    it('swaps the form to sign-in copy without navigating away, and back again', () => {
      render(<FleetRegistrationPage />);

      expect(
        screen.getByRole('heading', { name: 'Partner with KmerCargo' }),
      ).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

      expect(
        screen.queryByRole('heading', { name: 'Partner with KmerCargo' }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /continue to sign in/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Register' }),
      ).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Register' }));

      expect(
        screen.getByRole('heading', { name: 'Partner with KmerCargo' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /continue to registration/i }),
      ).toBeInTheDocument();
    });

    it('submits sendOtp with purpose=login after toggling to sign in', async () => {
      render(<FleetRegistrationPage />);
      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

      const input = screen.getByLabelText('Business Phone Number');
      fireEvent.change(input, { target: { value: '+237691234567' } });
      fireEvent.click(
        screen.getByRole('button', { name: /continue to sign in/i }),
      );

      await waitFor(() => expect(mockedSendOtp).toHaveBeenCalledTimes(1));
      const [, formData] = mockedSendOtp.mock.calls[0];
      expect(formData.get('phone_number')).toBe('+237691234567');
      expect(formData.get('purpose')).toBe('login');
    });

    it('redirects to /verify with phone and purpose=login, omitting role entirely — not just as an undefined value', async () => {
      render(<FleetRegistrationPage />);
      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

      const input = screen.getByLabelText('Business Phone Number');
      fireEvent.change(input, { target: { value: '+237691234567' } });
      fireEvent.click(
        screen.getByRole('button', { name: /continue to sign in/i }),
      );

      await waitFor(() => expect(mockPush).toHaveBeenCalledTimes(1));
      const pushedUrl = mockPush.mock.calls[0][0] as string;
      // toHaveBeenCalledWith uses toEqual semantics, where a missing key
      // and an undefined-valued key compare equal — assert on the raw
      // pushed string instead, and on URLSearchParams.has(), so a
      // role=undefined regression would actually fail this.
      expect(pushedUrl).toBe('/verify?phone=%2B237691234567&purpose=login');
      const params = new URL(pushedUrl, 'http://localhost').searchParams;
      expect(params.has('role')).toBe(false);
      expect(Object.fromEntries(params.entries())).toEqual({
        phone: '+237691234567',
        purpose: 'login',
      });
    });

    it('still redirects with role=fleet_owner when staying in register mode', async () => {
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
      const pushedUrl = mockPush.mock.calls[0][0] as string;
      const params = new URL(pushedUrl, 'http://localhost').searchParams;
      expect(params.has('role')).toBe(true);
    });
  });
});
