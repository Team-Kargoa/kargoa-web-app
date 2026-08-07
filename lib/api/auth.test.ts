import {
  requestOtp,
  verifyOtp,
  getProfile,
  refreshTokens,
  logout,
} from './auth';
import { apiRequest } from './client';

jest.mock('./client');
const mockedRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

beforeEach(() => mockedRequest.mockReset());

describe('requestOtp', () => {
  it('posts the phone number and purpose', async () => {
    mockedRequest.mockResolvedValue({ dev_otp: '146012' });
    await expect(requestOtp('+237691234567', 'login')).resolves.toEqual({
      dev_otp: '146012',
    });
    expect(mockedRequest).toHaveBeenCalledWith('/auth/otp/request', {
      method: 'POST',
      body: { phone_number: '+237691234567', purpose: 'login' },
    });
  });
});

describe('verifyOtp', () => {
  it('posts the code and returns the token pair', async () => {
    const tokens = { access_token: 'a', refresh_token: 'r', user: {} };
    mockedRequest.mockResolvedValue(tokens);

    await expect(
      verifyOtp({
        phoneNumber: '+237691234567',
        code: '482931',
        purpose: 'login',
      }),
    ).resolves.toBe(tokens);

    expect(mockedRequest).toHaveBeenCalledWith('/auth/otp/verify', {
      method: 'POST',
      body: {
        phone_number: '+237691234567',
        code: '482931',
        purpose: 'login',
      },
    });
  });

  it('includes the role when registering', async () => {
    mockedRequest.mockResolvedValue({});
    await verifyOtp({
      phoneNumber: '+237691234567',
      code: '482931',
      purpose: 'registration',
      role: 'fleet_owner',
    });
    expect(mockedRequest).toHaveBeenCalledWith(
      '/auth/otp/verify',
      expect.objectContaining({
        body: expect.objectContaining({ role: 'fleet_owner' }),
      }),
    );
  });

  it('omits the role key entirely when not registering', async () => {
    // toHaveBeenCalledWith uses toEqual semantics, which treat a missing key
    // and an explicit `role: undefined` as equal — so this asserts the key
    // set directly to actually bind to the "omit, don't send undefined" rule.
    mockedRequest.mockResolvedValue({});
    await verifyOtp({
      phoneNumber: '+237691234567',
      code: '482931',
      purpose: 'login',
    });
    const [, options] = mockedRequest.mock.calls[0];
    const body = (options as { body: Record<string, unknown> }).body;
    expect(Object.keys(body)).not.toContain('role');
    expect(Object.prototype.hasOwnProperty.call(body, 'role')).toBe(false);
  });
});

describe('getProfile', () => {
  it('sends the bearer token', async () => {
    mockedRequest.mockResolvedValue({ id: '1' });
    await getProfile('jwt-abc');
    expect(mockedRequest).toHaveBeenCalledWith('/auth/profile', {
      token: 'jwt-abc',
    });
  });
});

describe('refreshTokens', () => {
  it('posts the refresh token and returns only a new access token', async () => {
    // The real POST /auth/token/refresh response is { access_token } —
    // no refresh_token, no user. A mock shaped like the otp/verify
    // TokenPair here is exactly how the middleware's undefined-cookie
    // bug shipped, so this mock must match the server byte-for-byte.
    const refreshed = { access_token: 'a2' };
    mockedRequest.mockResolvedValue(refreshed);

    await expect(refreshTokens('r')).resolves.toEqual({ access_token: 'a2' });

    expect(mockedRequest).toHaveBeenCalledWith('/auth/token/refresh', {
      method: 'POST',
      body: { refresh_token: 'r' },
    });
  });
});

describe('logout', () => {
  it('posts the refresh token with the bearer access token', async () => {
    mockedRequest.mockResolvedValue(undefined);

    await expect(logout('jwt-abc', 'r')).resolves.toBeUndefined();

    expect(mockedRequest).toHaveBeenCalledWith('/auth/logout', {
      method: 'POST',
      body: { refresh_token: 'r' },
      token: 'jwt-abc',
    });
  });
});
