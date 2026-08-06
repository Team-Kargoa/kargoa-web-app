import {
  getUploadUrl,
  submitDriver,
  getDriverStatus,
  type DriverSubmission,
} from './onboarding';
import { apiRequest } from './client';

jest.mock('./client');
const mockedRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

beforeEach(() => mockedRequest.mockReset());

describe('getUploadUrl', () => {
  it('posts the document type with the bearer token and returns the upload url', async () => {
    const result = { upload_url: 'https://cdn.example/put', file_key: 'k-1' };
    mockedRequest.mockResolvedValue(result);

    await expect(
      getUploadUrl('jwt-abc', 'drivers_licence'),
    ).resolves.toBe(result);

    expect(mockedRequest).toHaveBeenCalledWith('/onboarding/upload-url', {
      method: 'POST',
      body: { document_type: 'drivers_licence' },
      token: 'jwt-abc',
    });
  });
});

describe('submitDriver', () => {
  it('posts the driver submission payload with the bearer token', async () => {
    mockedRequest.mockResolvedValue(undefined);
    const payload: DriverSubmission = {
      licence_number: 'CM-LIC-001',
      national_id: 'CM-NID-002',
      vehicle_category_id: 'cat-1',
      plate_number: 'LT 123 AB',
    };

    await expect(submitDriver('jwt-abc', payload)).resolves.toBeUndefined();

    expect(mockedRequest).toHaveBeenCalledWith('/onboarding/driver', {
      method: 'POST',
      body: payload,
      token: 'jwt-abc',
    });
  });
});

describe('getDriverStatus', () => {
  it('sends the bearer token and returns verification status', async () => {
    const status = { verification_status: 'pending', rejection_reason: null };
    mockedRequest.mockResolvedValue(status);

    await expect(getDriverStatus('jwt-abc')).resolves.toBe(status);

    expect(mockedRequest).toHaveBeenCalledWith('/onboarding/driver/status', {
      token: 'jwt-abc',
    });
  });
});
