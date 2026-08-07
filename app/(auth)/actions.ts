'use server';

import { redirect } from 'next/navigation';
import { requestOtp, verifyOtp, logout } from '../../lib/api/auth';
import { ApiError } from '../../lib/api/client';
import {
  createSession,
  destroySession,
  getAccessToken,
  getRefreshToken,
} from '../../lib/session';
import type { OtpPurpose, Role, TokenPair } from '../../lib/api/types';

export type AuthState = { error: string | null };

const PHONE_REGEX = /^\+237[62][0-9]{8}$/;
const CODE_REGEX = /^[0-9]{6}$/;
const GENERIC_ERROR = 'Something went wrong. Please try again.';
const RATE_LIMIT_ERROR =
  'You can request a maximum of 3 codes per phone number every 10 minutes. Please wait before trying again.';

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429) return RATE_LIMIT_ERROR;
    return error.message;
  }
  return GENERIC_ERROR;
}

type PortalRole = Extract<Role, 'fleet_owner' | 'admin'>;

function isPortalRole(role: Role): role is PortalRole {
  return role === 'fleet_owner' || role === 'admin';
}

function redirectTarget(role: PortalRole): string {
  return role === 'fleet_owner' ? '/fleet' : '/admin';
}

function unsupportedRoleError(role: Role): string {
  return `This number is registered as a ${role} account. The web portal is for fleet owners and administrators — please use the KmerCargo mobile app.`;
}

export async function sendOtp(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const phoneNumber = formData.get('phone_number') as string;
  const purpose = formData.get('purpose') as OtpPurpose;

  if (!PHONE_REGEX.test(phoneNumber)) {
    return { error: 'Enter a valid Cameroon phone number.' };
  }

  try {
    await requestOtp(phoneNumber, purpose);
    return { error: null };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function confirmOtp(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const phoneNumber = formData.get('phone_number') as string;
  const code = formData.get('code') as string;
  const purpose = formData.get('purpose') as OtpPurpose;
  const roleValue = formData.get('role');
  const role =
    typeof roleValue === 'string' && roleValue.length > 0
      ? (roleValue as Role)
      : undefined;

  if (!PHONE_REGEX.test(phoneNumber)) {
    return { error: 'Enter a valid Cameroon phone number.' };
  }

  if (!CODE_REGEX.test(code)) {
    return { error: 'Enter the 6-digit code sent to your phone.' };
  }

  let tokens: TokenPair;
  try {
    tokens = await verifyOtp({ phoneNumber, code, purpose, role });
  } catch (error) {
    return { error: errorMessage(error) };
  }

  const userRole = tokens.user.role;
  if (!isPortalRole(userRole)) {
    return { error: unsupportedRoleError(userRole) };
  }

  await createSession(tokens);
  redirect(redirectTarget(userRole));
}

/**
 * Signs the current user out. Bound directly as a form action
 * (`<form action={signOut}>`) so it works without client JavaScript.
 *
 * Invalidating the refresh token server-side is best-effort: if the
 * backend call fails (network blip, backend hiccup), the local session is
 * destroyed anyway — a failed API call must never trap someone in a
 * session they explicitly asked to leave.
 */
export async function signOut(): Promise<void> {
  const [accessToken, refreshToken] = await Promise.all([
    getAccessToken(),
    getRefreshToken(),
  ]);

  if (accessToken && refreshToken) {
    try {
      await logout(accessToken, refreshToken);
    } catch {
      // Continue anyway — see doc comment above.
    }
  }

  await destroySession();
  redirect('/signin');
}
