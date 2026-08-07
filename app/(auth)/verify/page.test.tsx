import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VerifyPage from './page';
import { confirmOtp, sendOtp } from '../actions';

jest.mock('../actions', () => ({
  confirmOtp: jest.fn(),
  sendOtp: jest.fn(),
}));

const mockedConfirmOtp = confirmOtp as jest.Mock;
const mockedSendOtp = sendOtp as jest.Mock;

function fillAllBoxes(value = '482915') {
  const boxes = screen.getAllByRole('textbox');
  value.split('').forEach((digit, index) => {
    fireEvent.change(boxes[index], { target: { value: digit } });
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedConfirmOtp.mockResolvedValue({ error: null });
  mockedSendOtp.mockResolvedValue({ error: null });
});

async function renderVerify(params: {
  phone?: string;
  purpose?: string;
  role?: string;
}) {
  const ui = await VerifyPage({ searchParams: Promise.resolve(params) });
  return render(ui);
}

describe('VerifyPage', () => {
  it('renders the identity verification headline', async () => {
    await renderVerify({ phone: '+237691234567', purpose: 'login' });
    expect(
      screen.getByRole('heading', { name: 'Verify Your Identity' }),
    ).toBeInTheDocument();
  });

  it('renders the masked phone number read from search params', async () => {
    await renderVerify({ phone: '+237691234567', purpose: 'login' });
    expect(screen.getByText('+237 6 XX XX XX 67')).toBeInTheDocument();
  });

  it('renders a back-to-home link pointing at the landing page', async () => {
    await renderVerify({ phone: '+237691234567', purpose: 'login' });
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('renders the KmerCargo brand in the header as a link back to the landing page', async () => {
    await renderVerify({ phone: '+237691234567', purpose: 'login' });
    expect(
      screen.getByRole('heading', { name: 'KmerCargo' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'KmerCargo' })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('renders the brand at its original, larger-icon/compact-wordmark size (the "lg" variant), not the Navbar default', async () => {
    await renderVerify({ phone: '+237691234567', purpose: 'login' });
    const link = screen.getByRole('link', { name: 'KmerCargo' });
    expect(link.querySelector('svg')).toHaveClass('h-7', 'w-7');
    expect(screen.getByText('KmerCargo')).toHaveClass('text-lg');
  });

  it('renders the verify submit button and the dash divider', async () => {
    const { container } = await renderVerify({
      phone: '+237691234567',
      purpose: 'login',
    });
    expect(
      screen.getByRole('button', { name: /verify & continue/i }),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-testid="otp-divider"]'),
    ).toBeInTheDocument();
  });

  it('submits phone_number, code and purpose through confirmOtp for a login', async () => {
    await renderVerify({ phone: '+237691234567', purpose: 'login' });
    fillAllBoxes('482915');
    fireEvent.click(screen.getByRole('button', { name: /verify & continue/i }));

    await waitFor(() => expect(mockedConfirmOtp).toHaveBeenCalledTimes(1));
    const [, formData] = mockedConfirmOtp.mock.calls[0];
    expect(formData.get('phone_number')).toBe('+237691234567');
    expect(formData.get('code')).toBe('482915');
    expect(formData.get('purpose')).toBe('login');
    expect(Object.keys(Object.fromEntries(formData))).not.toContain('role');
  });

  it('also passes role through confirmOtp for a registration purpose', async () => {
    await renderVerify({
      phone: '+237691234567',
      purpose: 'registration',
      role: 'fleet_owner',
    });
    fillAllBoxes('482915');
    fireEvent.click(screen.getByRole('button', { name: /verify & continue/i }));

    await waitFor(() => expect(mockedConfirmOtp).toHaveBeenCalledTimes(1));
    const [, formData] = mockedConfirmOtp.mock.calls[0];
    expect(formData.get('purpose')).toBe('registration');
    expect(formData.get('role')).toBe('fleet_owner');
  });

  it('displays an error returned by confirmOtp', async () => {
    mockedConfirmOtp.mockResolvedValue({ error: 'Invalid code.' });
    await renderVerify({ phone: '+237691234567', purpose: 'login' });
    fillAllBoxes('482915');
    fireEvent.click(screen.getByRole('button', { name: /verify & continue/i }));

    expect(await screen.findByText('Invalid code.')).toBeInTheDocument();
  });

  it('resends the code through sendOtp with the same phone and purpose', async () => {
    await renderVerify({ phone: '+237691234567', purpose: 'login' });
    fireEvent.click(
      screen.getByRole('button', { name: /resend verification code/i }),
    );

    await waitFor(() => expect(mockedSendOtp).toHaveBeenCalledTimes(1));
    const [, formData] = mockedSendOtp.mock.calls[0];
    expect(formData.get('phone_number')).toBe('+237691234567');
    expect(formData.get('purpose')).toBe('login');
    expect(
      await screen.findByText('A new code has been sent.'),
    ).toBeInTheDocument();
  });

  it('displays an error returned by a failed resend', async () => {
    mockedSendOtp.mockResolvedValue({ error: 'Too many requests.' });
    await renderVerify({ phone: '+237691234567', purpose: 'login' });
    fireEvent.click(
      screen.getByRole('button', { name: /resend verification code/i }),
    );

    expect(await screen.findByText('Too many requests.')).toBeInTheDocument();
  });

  it('falls back to an empty phone and login purpose when search params are missing', async () => {
    await renderVerify({});
    fillAllBoxes('482915');
    fireEvent.click(screen.getByRole('button', { name: /verify & continue/i }));

    await waitFor(() => expect(mockedConfirmOtp).toHaveBeenCalledTimes(1));
    const [, formData] = mockedConfirmOtp.mock.calls[0];
    expect(formData.get('phone_number')).toBe('');
    expect(formData.get('purpose')).toBe('login');
  });

  it('falls back to login purpose when the query string carries an unrecognised value', async () => {
    await renderVerify({
      phone: '+237691234567',
      purpose: 'not-a-real-purpose',
    });
    fillAllBoxes('482915');
    fireEvent.click(screen.getByRole('button', { name: /verify & continue/i }));

    await waitFor(() => expect(mockedConfirmOtp).toHaveBeenCalledTimes(1));
    const [, formData] = mockedConfirmOtp.mock.calls[0];
    expect(formData.get('purpose')).toBe('login');
  });
});
