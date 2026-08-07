import { apiRequest } from './client';

// Verified live against the running backend (2026-08-06) with a real
// driver token. The two ChoiceFields on POST /onboarding/upload-url
// reject anything outside these exact sets.
export type DocumentType =
  | 'license'
  | 'national_id'
  | 'live_selfie'
  | 'vehicle_registration'
  | 'dispute_evidence';

export type FileType = 'image/jpeg' | 'image/png' | 'application/pdf';

// Verified live against the running backend (2026-08-06): the real
// DriverSubmissionSerializer body is nested. Document fields are the
// object_url strings returned by the upload-url call, not licence
// numbers, and vehicle fields sit under a nested `vehicle` object.
export type DriverSubmission = {
  license_document: string;
  national_id_document: string;
  live_selfie: string;
  vehicle: {
    plate_number: string;
    registration_doc: string;
    category_id: string;
  };
};

export function getUploadUrl(
  token: string,
  documentType: DocumentType,
  fileType: FileType,
): Promise<{ upload_url: string; object_url: string }> {
  return apiRequest('/onboarding/upload-url', {
    method: 'POST',
    body: { document_type: documentType, file_type: fileType },
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
