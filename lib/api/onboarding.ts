import { apiRequest } from './client';

export type DriverSubmission = {
  licence_number: string;
  national_id: string;
  vehicle_category_id: string;
  plate_number: string;
};

export function getUploadUrl(
  token: string,
  documentType: string,
): Promise<{ upload_url: string; file_key: string }> {
  return apiRequest('/onboarding/upload-url', {
    method: 'POST',
    body: { document_type: documentType },
    token,
  });
}

export function submitDriver(
  token: string,
  payload: DriverSubmission,
): Promise<void> {
  return apiRequest('/onboarding/driver', {
    method: 'POST',
    body: payload,
    token,
  });
}

export function getDriverStatus(
  token: string,
): Promise<{ verification_status: string; rejection_reason: string | null }> {
  return apiRequest('/onboarding/driver/status', { token });
}
