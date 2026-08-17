import { apiRequest } from './client';
import type {
  AccessTokenRefresh,
  OtpPurpose,
  OtpRequestResult,
  Role,
  TokenPair,
  UserSummary,
} from './types';

export function requestOtp(
  phoneNumber: string,
  purpose: OtpPurpose,
): Promise<OtpRequestResult> {
  return apiRequest<OtpRequestResult>('/auth/otp/request', {
    method: 'POST',
    body: { phone_number: phoneNumber, purpose },
  });
}

export function verifyOtp(input: {
  phoneNumber: string;
  code: string;
  purpose: OtpPurpose;
  role?: Role;
}): Promise<TokenPair> {
  const { phoneNumber, code, purpose, role } = input;

  return apiRequest<TokenPair>('/auth/otp/verify', {
    method: 'POST',
    body: {
      phone_number: phoneNumber,
      code,
      purpose,
      ...(role === undefined ? {} : { role }),
    },
  });
}

export function getProfile(token: string): Promise<UserSummary> {
  return apiRequest<UserSummary>('/auth/profile', { token });
}

export function refreshTokens(
  refreshToken: string,
): Promise<AccessTokenRefresh> {
  return apiRequest<AccessTokenRefresh>('/auth/token/refresh', {
    method: 'POST',
    body: { refresh_token: refreshToken },
  });
}

export function logout(token: string, refreshToken: string): Promise<void> {
  return apiRequest<void>('/auth/logout', {
    method: 'POST',
    body: { refresh_token: refreshToken },
    token,
  });
}
