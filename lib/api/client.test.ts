import { apiRequest, ApiError } from './client';

const okResponse = (data: unknown) =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ status: 'success', data, message: 'ok' }),
  } as Response);

describe('apiRequest', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = 'http://api.test/api/v1';
    global.fetch = jest.fn();
  });

  it('unwraps the envelope and returns data', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okResponse({ id: '1' }));
    await expect(apiRequest('/auth/profile')).resolves.toEqual({ id: '1' });
  });

  it('prefixes the configured base URL', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okResponse({}));
    await apiRequest('/auth/profile');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/v1/auth/profile',
      expect.anything(),
    );
  });

  it('sends a JSON body for writes', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okResponse({}));
    await apiRequest('/auth/otp/request', {
      method: 'POST',
      body: { phone_number: '+237691234567' },
    });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ phone_number: '+237691234567' }),
      }),
    );
  });

  it('attaches the bearer token when given one', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okResponse({}));
    await apiRequest('/auth/profile', { token: 'jwt-abc' });
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.headers.Authorization).toBe('Bearer jwt-abc');
  });

  it('omits the Authorization header without a token', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okResponse({}));
    await apiRequest('/vehicles/categories');
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.headers.Authorization).toBeUndefined();
  });

  it('throws ApiError carrying the backend message on an HTTP error', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 429,
      json: () =>
        Promise.resolve({
          status: 'error',
          data: {},
          message: 'Too many OTP requests.',
        }),
    } as Response);

    await expect(apiRequest('/auth/otp/request')).rejects.toThrow(
      new ApiError('Too many OTP requests.', 429),
    );
  });

  it('throws ApiError when the envelope reports an error on a 200', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({ status: 'error', data: {}, message: 'Invalid OTP.' }),
    } as Response);

    await expect(apiRequest('/auth/otp/verify')).rejects.toThrow(
      'Invalid OTP.',
    );
  });

  it('falls back to a generic message when the body is not JSON', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('not json')),
    } as unknown as Response);

    await expect(apiRequest('/auth/profile')).rejects.toThrow(
      'Request failed with status 500',
    );
  });
});
