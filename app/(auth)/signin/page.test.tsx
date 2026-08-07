import {
  render,
  screen,
  within,
  fireEvent,
  waitFor,
} from '@testing-library/react';
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

    expect(
      screen.getByRole('heading', { name: 'KmerCargo' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Admin Portal' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Enter your credentials to manage the logistics fleet.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Admin accounts are provisioned by a platform administrator — contact one to request access. Strictly for authorized logistics personnel and fleet managers in Cameroon.',
      ),
    ).toBeInTheDocument();
  });

  it('renders the KmerCargo heading as a link back to the landing page', () => {
    render(<SignInPage />);
    expect(screen.getByRole('link', { name: 'KmerCargo' })).toHaveAttribute(
      'href',
      '/',
    );
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

  it('renders the support info bar below the card', () => {
    render(<SignInPage />);
    expect(screen.getByText('System Online')).toBeInTheDocument();
    expect(screen.getByText('v4.2.0')).toBeInTheDocument();
    expect(screen.getByText('Yaoundé HQ')).toBeInTheDocument();
  });

  it('renders a back-to-home link pointing at the landing page', () => {
    render(<SignInPage />);
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('renders the back-to-home link as the first interactive element in the header', () => {
    render(<SignInPage />);
    const header = screen.getByRole('banner');
    const links = within(header).getAllByRole('link');
    expect(links[0]).toHaveAccessibleName(/back to home/i);
  });

  it('renders Request Admin Access as non-interactive text with a provisioning instruction underneath', () => {
    render(<SignInPage />);
    expect(screen.getByText(/request admin access/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /request admin access/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        /admin accounts are provisioned by a platform administrator/i,
      ),
    ).toBeInTheDocument();
  });

  it('submits the phone number through sendOtp with purpose=login', async () => {
    render(<SignInPage />);
    const input = screen.getByLabelText('Enter Admin Code or Password');
    fireEvent.change(input, { target: { value: '+237691234567' } });
    fireEvent.click(
      screen.getByRole('button', { name: /sign in to dashboard/i }),
    );

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
    fireEvent.click(
      screen.getByRole('button', { name: /sign in to dashboard/i }),
    );

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
    fireEvent.click(
      screen.getByRole('button', { name: /sign in to dashboard/i }),
    );

    expect(
      await screen.findByText('Enter a valid Cameroon phone number.'),
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
