import { verifyCredentials } from './actions';

function makeFormData(email: string, password: string) {
  const formData = new FormData();
  formData.set('email', email);
  formData.set('password', password);
  return formData;
}

describe('verifyCredentials', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      AUTH_EMAIL: 'admin@kargoa.com',
      AUTH_PASSWORD: 'secret',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns success for matching credentials', async () => {
    const result = await verifyCredentials(
      makeFormData('admin@kargoa.com', 'secret'),
    );

    expect(result).toEqual({ success: true });
  });

  it('returns an error for a wrong password', async () => {
    const result = await verifyCredentials(
      makeFormData('admin@kargoa.com', 'wrong'),
    );

    expect(result).toEqual({
      success: false,
      error: 'Invalid email or password',
    });
  });

  it('returns an error for a wrong email', async () => {
    const result = await verifyCredentials(
      makeFormData('intruder@example.com', 'secret'),
    );

    expect(result).toEqual({
      success: false,
      error: 'Invalid email or password',
    });
  });
});
