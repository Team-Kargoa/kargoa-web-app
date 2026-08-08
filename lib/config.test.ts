/**
 * lib/config.ts reads several values at module-load time, so exercising
 * "unset" vs "set" vs "non-numeric" requires a fresh module instance per
 * case. jest.resetModules() + a dynamic require() gives each test its own
 * copy; process.env is snapshotted and restored around every test so
 * mutations here can never leak into another suite.
 */

const ORIGINAL_ENV = { ...process.env };

function loadConfig(): typeof import('./config') {
  let config: typeof import('./config');
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    config = require('./config');
  });
  return config!;
}

beforeEach(() => {
  jest.resetModules();
  process.env = { ...ORIGINAL_ENV };
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

describe('getApiUrl', () => {
  it('falls back to the local backend when unset', () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    const { getApiUrl } = loadConfig();
    expect(getApiUrl()).toBe('http://localhost:8000/api/v1');
  });

  it('reads the configured URL when set', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.kargoa.example/api/v1';
    const { getApiUrl } = loadConfig();
    expect(getApiUrl()).toBe('https://api.kargoa.example/api/v1');
  });
});

describe('SUPPORT_EMAIL', () => {
  it('falls back to the engineering address when unset', () => {
    delete process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
    const { SUPPORT_EMAIL } = loadConfig();
    expect(SUPPORT_EMAIL).toBe('engineering@kmercargo.cm');
  });

  it('reads the configured address when set', () => {
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL = 'support@kargoa.example';
    const { SUPPORT_EMAIL } = loadConfig();
    expect(SUPPORT_EMAIL).toBe('support@kargoa.example');
  });
});

describe('SESSION_ACCESS_MAX_AGE', () => {
  it('defaults to 15 minutes in seconds when unset', () => {
    delete process.env.SESSION_ACCESS_MAX_AGE;
    const { SESSION_ACCESS_MAX_AGE } = loadConfig();
    expect(SESSION_ACCESS_MAX_AGE).toBe(60 * 15);
  });

  it('reads a configured value', () => {
    process.env.SESSION_ACCESS_MAX_AGE = '120';
    const { SESSION_ACCESS_MAX_AGE } = loadConfig();
    expect(SESSION_ACCESS_MAX_AGE).toBe(120);
  });

  it('falls back to the default instead of NaN on a non-numeric value', () => {
    process.env.SESSION_ACCESS_MAX_AGE = 'not-a-number';
    const { SESSION_ACCESS_MAX_AGE } = loadConfig();
    expect(SESSION_ACCESS_MAX_AGE).toBe(60 * 15);
    expect(Number.isNaN(SESSION_ACCESS_MAX_AGE)).toBe(false);
  });
});

describe('SESSION_REFRESH_MAX_AGE', () => {
  it('defaults to 30 days in seconds when unset', () => {
    delete process.env.SESSION_REFRESH_MAX_AGE;
    const { SESSION_REFRESH_MAX_AGE } = loadConfig();
    expect(SESSION_REFRESH_MAX_AGE).toBe(60 * 60 * 24 * 30);
  });

  it('reads a configured value', () => {
    process.env.SESSION_REFRESH_MAX_AGE = '86400';
    const { SESSION_REFRESH_MAX_AGE } = loadConfig();
    expect(SESSION_REFRESH_MAX_AGE).toBe(86400);
  });

  it('falls back to the default instead of NaN on a non-numeric value', () => {
    process.env.SESSION_REFRESH_MAX_AGE = 'not-a-number';
    const { SESSION_REFRESH_MAX_AGE } = loadConfig();
    expect(SESSION_REFRESH_MAX_AGE).toBe(60 * 60 * 24 * 30);
    expect(Number.isNaN(SESSION_REFRESH_MAX_AGE)).toBe(false);
  });
});

describe('OTP_RATE_LIMIT', () => {
  it('defaults to 3 when unset', () => {
    delete process.env.NEXT_PUBLIC_OTP_RATE_LIMIT;
    const { OTP_RATE_LIMIT } = loadConfig();
    expect(OTP_RATE_LIMIT).toBe(3);
  });

  it('reads a configured value', () => {
    process.env.NEXT_PUBLIC_OTP_RATE_LIMIT = '5';
    const { OTP_RATE_LIMIT } = loadConfig();
    expect(OTP_RATE_LIMIT).toBe(5);
  });

  it('falls back to the default instead of NaN on a non-numeric value', () => {
    process.env.NEXT_PUBLIC_OTP_RATE_LIMIT = 'not-a-number';
    const { OTP_RATE_LIMIT } = loadConfig();
    expect(OTP_RATE_LIMIT).toBe(3);
    expect(Number.isNaN(OTP_RATE_LIMIT)).toBe(false);
  });
});

describe('OTP_RATE_WINDOW_MINUTES', () => {
  it('defaults to 10 when unset', () => {
    delete process.env.NEXT_PUBLIC_OTP_RATE_WINDOW_MINUTES;
    const { OTP_RATE_WINDOW_MINUTES } = loadConfig();
    expect(OTP_RATE_WINDOW_MINUTES).toBe(10);
  });

  it('reads a configured value', () => {
    process.env.NEXT_PUBLIC_OTP_RATE_WINDOW_MINUTES = '15';
    const { OTP_RATE_WINDOW_MINUTES } = loadConfig();
    expect(OTP_RATE_WINDOW_MINUTES).toBe(15);
  });

  it('falls back to the default instead of NaN on a non-numeric value', () => {
    process.env.NEXT_PUBLIC_OTP_RATE_WINDOW_MINUTES = 'not-a-number';
    const { OTP_RATE_WINDOW_MINUTES } = loadConfig();
    expect(OTP_RATE_WINDOW_MINUTES).toBe(10);
    expect(Number.isNaN(OTP_RATE_WINDOW_MINUTES)).toBe(false);
  });
});
