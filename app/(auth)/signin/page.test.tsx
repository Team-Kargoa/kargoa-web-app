import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import SignInPage from './page';
import { sendOtp } from '../actions';

jest.mock('../actions', () => ({ sendOtp: jest.fn() }));
jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));

const mockedSendOtp = sendOtp as jest.Mock;
const mockPush = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  mockedSendOtp.mockResolvedValue({ error: null });
});

describe('SignInPage', () => {
  it('renders the admin portal branding and copy', () => {
    render(<SignInPage />);

    expect(screen.getByRole('heading', { name: 'KmerCargo' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Admin Portal' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Enter your credentials to manage the logistics fleet.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Strictly for authorized logistics personnel and fleet managers in Cameroon.',
      ),
    ).toBeInTheDocument();
  });

  it('renders the phone field under the design label', () => {
    render(<SignInPage />);
    expect(
      screen.getByLabelText('Enter Admin Code or Password'),
    ).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    render(<SignInPage />);
    expect(
      screen.getByRole('button', { name: /sign in to dashboard/i }),
    ).toBeInTheDocument();
  });

  it('renders the Request Admin Access link with a real destination', () => {
    render(<SignInPage />);
    expect(
      screen.getByRole('link', { name: /request admin access/i }),
    ).toHaveAttribute('href', '/contact');
  });

  it('submits the phone number through sendOtp with purpose=login', async () => {
    render(<SignInPage />);
    const input = screen.getByLabelText('Enter Admin Code or Password');
    fireEvent.change(input, { target: { value: '+237691234567' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in to dashboard/i }));

    await waitFor(() => expect(mockedSendOtp).toHaveBeenCalledTimes(1));
    const [, formData] = mockedSendOtp.mock.calls[0];
    expect(formData.get('phone_number')).toBe('+237691234567');
    expect(formData.get('purpose')).toBe('login');
    expect(Object.keys(Object.fromEntries(formData))).not.toContain('role');
  });

  it('redirects to /verify with the phone and purpose on success', async () => {
    render(<SignInPage />);
    const input = screen.getByLabelText('Enter Admin Code or Password');
    fireEvent.change(input, { target: { value: '+237691234567' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in to dashboard/i }));

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith(
        '/verify?phone=%2B237691234567&purpose=login',
      ),
    );
  });

  it('displays an error returned by the action and does not redirect', async () => {
    mockedSendOtp.mockResolvedValue({
      error: 'Enter a valid Cameroon phone number.',
    });
    render(<SignInPage />);
    fireEvent.click(screen.getByRole('button', { name: /sign in to dashboard/i }));

    expect(
      await screen.findByText('Enter a valid Cameroon phone number.'),
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
