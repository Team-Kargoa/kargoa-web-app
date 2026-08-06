'use server';

import { redirect } from 'next/navigation';
import { requestOtp, verifyOtp } from '../../lib/api/auth';
import { ApiError } from '../../lib/api/client';
import { createSession } from '../../lib/session';
import type { OtpPurpose, Role, TokenPair } from '../../lib/api/types';

export type AuthState = { error: string | null };

const PHONE_REGEX = /^\+237[62][0-9]{8}$/;
const CODE_REGEX = /^[0-9]{6}$/;
const GENERIC_ERROR = 'Something went wrong. Please try again.';

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return GENERIC_ERROR;
}

function redirectTarget(role: Role): string {
  if (role === 'fleet_owner') return '/fleet';
  if (role === 'admin') return '/admin';
  return '/';
}

export async function sendOtp(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const phoneNumber = String(formData.get('phone_number') ?? '');
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
  const phoneNumber = String(formData.get('phone_number') ?? '');
  const code = String(formData.get('code') ?? '');
  const purpose = formData.get('purpose') as OtpPurpose;
  const roleValue = formData.get('role');
  const role = typeof roleValue === 'string' && roleValue.length > 0
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

  await createSession(tokens);
  redirect(redirectTarget(tokens.user.role));
}
