import { requestOtp, verifyOtp, getProfile, refreshTokens, logout } from './auth';
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
  it('posts the refresh token and returns a new token pair', async () => {
    const tokens = { access_token: 'a2', refresh_token: 'r2', user: {} };
    mockedRequest.mockResolvedValue(tokens);

    await expect(refreshTokens('r')).resolves.toBe(tokens);

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
