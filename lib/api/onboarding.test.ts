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
  it('posts the document type and file type with the bearer token and returns the upload/object urls', async () => {
    // Verified live against the running backend (2026-08-06):
    // POST /onboarding/upload-url requires BOTH document_type and file_type
    // (both ChoiceFields) and the real success response is
    // { upload_url, object_url } — there is no file_key.
    const result = {
      upload_url:
        'https://storage.kmercargo.cm/uploads/license/6cfd8356-.../lN3JV-....jpg?signature=stub&expires=1786021816',
      object_url:
        'https://storage.kmercargo.cm/uploads/license/6cfd8356-.../lN3JV-....jpg',
    };
    mockedRequest.mockResolvedValue(result);

    await expect(
      getUploadUrl('jwt-abc', 'license', 'image/jpeg'),
    ).resolves.toBe(result);

    expect(mockedRequest).toHaveBeenCalledWith('/onboarding/upload-url', {
      method: 'POST',
      body: { document_type: 'license', file_type: 'image/jpeg' },
      token: 'jwt-abc',
    });
  });
});

describe('submitDriver', () => {
  it('posts the nested driver submission payload with the bearer token', async () => {
    // Verified live against the running backend (2026-08-06):
    // POST /onboarding/driver's real body is nested — document fields are
    // object_url strings from the upload-url call, and vehicle fields are
    // nested under a `vehicle` object, not flat on the payload.
    mockedRequest.mockResolvedValue(undefined);
    const payload: DriverSubmission = {
      license_document: 'https://storage.kmercargo.cm/uploads/license/a.jpg',
      national_id_document:
        'https://storage.kmercargo.cm/uploads/national_id/b.jpg',
      live_selfie: 'https://storage.kmercargo.cm/uploads/live_selfie/c.jpg',
      vehicle: {
        plate_number: 'LT 123 AB',
        registration_doc:
          'https://storage.kmercargo.cm/uploads/vehicle_registration/d.jpg',
        category_id: 'e4f5a439-d9bd-4796-8420-cc8afb04b145',
      },
    };

    await expect(submitDriver('jwt-abc', payload)).resolves.toBeUndefined();

    expect(mockedRequest).toHaveBeenCalledWith('/onboarding/driver', {
      method: 'POST',
      body: payload,
      token: 'jwt-abc',
    });
  });

  it('sends the vehicle object with exactly the three real fields, nothing more', async () => {
    // toHaveBeenCalledWith uses toEqual semantics, which treats a missing
    // key and an explicit `key: undefined` as equal — Object.keys pins the
    // exact nested vehicle shape so an accidental extra/missing field on
    // the nested object is actually caught.
    mockedRequest.mockResolvedValue(undefined);
    const payload: DriverSubmission = {
      license_document: 'https://storage.kmercargo.cm/uploads/license/a.jpg',
      national_id_document:
        'https://storage.kmercargo.cm/uploads/national_id/b.jpg',
      live_selfie: 'https://storage.kmercargo.cm/uploads/live_selfie/c.jpg',
      vehicle: {
        plate_number: 'LT 123 AB',
        registration_doc:
          'https://storage.kmercargo.cm/uploads/vehicle_registration/d.jpg',
        category_id: 'e4f5a439-d9bd-4796-8420-cc8afb04b145',
      },
    };

    await submitDriver('jwt-abc', payload);

    const [, options] = mockedRequest.mock.calls[0];
    const body = (options as { body: DriverSubmission }).body;
    expect(Object.keys(body)).toEqual([
      'license_document',
      'national_id_document',
      'live_selfie',
      'vehicle',
    ]);
    expect(Object.keys(body.vehicle)).toEqual([
      'plate_number',
      'registration_doc',
      'category_id',
    ]);
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

  it('propagates the ApiError message and status when no submission exists', async () => {
    // Verified live against the running backend (2026-08-06): a driver
    // with no submission gets HTTP 400-ish envelope
    // {"status":"error","data":{},"message":"No onboarding submission
    // found."} — apiRequest already turns this into an ApiError, this
    // pins that getDriverStatus does not swallow or reshape it.
    // Jest's toThrow only compares .message, never .status — use
    // rejects.toMatchObject to pin both.
    const { ApiError } = jest.requireActual('./client');
    mockedRequest.mockRejectedValue(
      new ApiError('No onboarding submission found.', 400),
    );

    await expect(getDriverStatus('jwt-abc')).rejects.toMatchObject({
      message: 'No onboarding submission found.',
      status: 400,
    });
  });
});
