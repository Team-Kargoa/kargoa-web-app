import { redirect } from 'next/navigation';
import { requestOtp, verifyOtp } from '../../lib/api/auth';
import { ApiError } from '../../lib/api/client';
import { createSession } from '../../lib/session';
import { sendOtp, confirmOtp } from './actions';
import type { AuthState } from './actions';
import type { UserSummary } from '../../lib/api/types';

jest.mock('../../lib/api/auth');
jest.mock('../../lib/session');
jest.mock('next/navigation', () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

const mockedRequestOtp = requestOtp as jest.MockedFunction<typeof requestOtp>;
const mockedVerifyOtp = verifyOtp as jest.MockedFunction<typeof verifyOtp>;
const mockedCreateSession = createSession as jest.MockedFunction<
  typeof createSession
>;
const mockedRedirect = redirect as unknown as jest.Mock;

const initialState: AuthState = { error: null };

function makeUser(role: UserSummary['role']): UserSummary {
  return {
    id: 'u1',
    phone_number: '+237691234567',
    role,
    full_name: 'Test User',
    profile_photo: null,
    is_active: true,
    date_joined: '2026-01-01',
  };
}

beforeEach(() => jest.clearAllMocks());

describe('sendOtp', () => {
  it('rejects an invalid phone number without calling the API', async () => {
    const formData = new FormData();
    formData.set('phone_number', '123');
    formData.set('purpose', 'login');

    await expect(sendOtp(initialState, formData)).resolves.toEqual({
      error: 'Enter a valid Cameroon phone number.',
    });
    expect(mockedRequestOtp).not.toHaveBeenCalled();
  });

  it('calls requestOtp on a valid number and returns no error', async () => {
    mockedRequestOtp.mockResolvedValue({});
    const formData = new FormData();
    formData.set('phone_number', '+237691234567');
    formData.set('purpose', 'login');

    await expect(sendOtp(initialState, formData)).resolves.toEqual({
      error: null,
    });
    expect(mockedRequestOtp).toHaveBeenCalledWith('+237691234567', 'login');
  });

  it('maps a thrown ApiError to its message', async () => {
    mockedRequestOtp.mockRejectedValue(new ApiError('Too many requests.', 429));
    const formData = new FormData();
    formData.set('phone_number', '+237691234567');
    formData.set('purpose', 'login');

    await expect(sendOtp(initialState, formData)).resolves.toEqual({
      error: 'Too many requests.',
    });
  });

  it('maps an unexpected error to a generic message', async () => {
    mockedRequestOtp.mockRejectedValue(new Error('ECONNRESET'));
    const formData = new FormData();
    formData.set('phone_number', '+237691234567');
    formData.set('purpose', 'login');

    await expect(sendOtp(initialState, formData)).resolves.toEqual({
      error: 'Something went wrong. Please try again.',
    });
  });
});

describe('confirmOtp', () => {
  function makeFormData(overrides: Partial<Record<string, string>> = {}) {
    const formData = new FormData();
    formData.set('phone_number', overrides.phone_number ?? '+237691234567');
    formData.set('code', overrides.code ?? '482931');
    formData.set('purpose', overrides.purpose ?? 'login');
    if (overrides.role) formData.set('role', overrides.role);
    return formData;
  }

  it('rejects an invalid phone number without calling the API', async () => {
    const formData = makeFormData({ phone_number: '123' });

    await expect(confirmOtp(initialState, formData)).resolves.toEqual({
      error: 'Enter a valid Cameroon phone number.',
    });
    expect(mockedVerifyOtp).not.toHaveBeenCalled();
  });

  it('rejects a code that is not six digits without calling the API', async () => {
    const formData = makeFormData({ code: '123' });

    const result = await confirmOtp(initialState, formData);

    expect(result.error).toBeTruthy();
    expect(mockedVerifyOtp).not.toHaveBeenCalled();
  });

  it('verifies, creates a session, and redirects fleet owners to /fleet', async () => {
    const tokens = {
      access_token: 'a',
      refresh_token: 'r',
      user: makeUser('fleet_owner'),
    };
    mockedVerifyOtp.mockResolvedValue(tokens);
    const formData = makeFormData({
      purpose: 'registration',
      role: 'fleet_owner',
    });

    await expect(confirmOtp(initialState, formData)).rejects.toThrow(
      'REDIRECT:/fleet',
    );

    expect(mockedVerifyOtp).toHaveBeenCalledWith({
      phoneNumber: '+237691234567',
      code: '482931',
      purpose: 'registration',
      role: 'fleet_owner',
    });
    expect(mockedCreateSession).toHaveBeenCalledWith(tokens);
    expect(mockedRedirect).toHaveBeenCalledWith('/fleet');
  });

  it('redirects admins to /admin', async () => {
    const tokens = {
      access_token: 'a',
      refresh_token: 'r',
      user: makeUser('admin'),
    };
    mockedVerifyOtp.mockResolvedValue(tokens);
    const formData = makeFormData();

    await expect(confirmOtp(initialState, formData)).rejects.toThrow(
      'REDIRECT:/admin',
    );

    expect(mockedRedirect).toHaveBeenCalledWith('/admin');
  });

  it('does not create a session and returns a plain-language error for a customer account', async () => {
    const tokens = {
      access_token: 'a',
      refresh_token: 'r',
      user: makeUser('customer'),
    };
    mockedVerifyOtp.mockResolvedValue(tokens);
    const formData = makeFormData();

    await expect(confirmOtp(initialState, formData)).resolves.toEqual({
      error:
        'This number is registered as a customer account. The web portal is for fleet owners and administrators — please use the KmerCargo mobile app.',
    });
    expect(mockedCreateSession).not.toHaveBeenCalled();
    expect(mockedRedirect).not.toHaveBeenCalled();
  });

  it('does not create a session and names the driver role for a driver account', async () => {
    const tokens = {
      access_token: 'a',
      refresh_token: 'r',
      user: makeUser('driver'),
    };
    mockedVerifyOtp.mockResolvedValue(tokens);
    const formData = makeFormData();

    await expect(confirmOtp(initialState, formData)).resolves.toEqual({
      error:
        'This number is registered as a driver account. The web portal is for fleet owners and administrators — please use the KmerCargo mobile app.',
    });
    expect(mockedCreateSession).not.toHaveBeenCalled();
    expect(mockedRedirect).not.toHaveBeenCalled();
  });

  it('returns the ApiError message on failure without creating a session', async () => {
    mockedVerifyOtp.mockRejectedValue(new ApiError('Invalid code.', 400));
    const formData = makeFormData();

    await expect(confirmOtp(initialState, formData)).resolves.toEqual({
      error: 'Invalid code.',
    });
    expect(mockedCreateSession).not.toHaveBeenCalled();
    expect(mockedRedirect).not.toHaveBeenCalled();
  });

  it('maps an unexpected error to a generic message', async () => {
    mockedVerifyOtp.mockRejectedValue(new Error('ECONNRESET'));
    const formData = makeFormData();

    await expect(confirmOtp(initialState, formData)).resolves.toEqual({
      error: 'Something went wrong. Please try again.',
    });
    expect(mockedCreateSession).not.toHaveBeenCalled();
  });
});
