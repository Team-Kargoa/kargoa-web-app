'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { getAccessToken } from '@/lib/session';
import { updatePlatformConfig } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';

export type ConfigActionState = { error: string | null };

const VALUE_MAX_LENGTH = 255;

export async function updatePlatformConfigAction(
  key: string,
  _prevState: ConfigActionState,
  formData: FormData,
): Promise<ConfigActionState> {
  const value = String(formData.get('value') ?? '');
  if (value.length > VALUE_MAX_LENGTH) {
    return { error: `Value must be ${VALUE_MAX_LENGTH} characters or fewer.` };
  }

  const token = await getAccessToken();
  if (!token) redirect('/signin');

  try {
    await updatePlatformConfig(token, key, value);
  } catch (error) {
    if (error instanceof ApiError) return { error: error.message };
    return { error: 'Something went wrong. Please try again.' };
  }

  revalidatePath('/admin/settings');
  return { error: null };
}
