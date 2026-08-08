'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { getAccessToken } from '@/lib/session';
import { approveDriver, rejectDriver } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';

export type DriverActionState = { error: string | null };

const REASON_MAX_LENGTH = 500;

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return 'Something went wrong. Please try again.';
}

/**
 * Approve and reject are destructive, irreversible actions on a real
 * driver's application, so both revalidate the queue and this detail page
 * before returning the admin to /admin/drivers — never left showing a
 * stale "Pending" state for the record they just decided on.
 */
function afterMutation(id: string): never {
  revalidatePath('/admin/drivers');
  revalidatePath(`/admin/drivers/${id}`);
  redirect('/admin/drivers');
}

export async function approveDriverAction(
  id: string,
  _prevState: DriverActionState,
  _formData: FormData,
): Promise<DriverActionState> {
  const token = await getAccessToken();
  if (!token) redirect('/signin');

  try {
    await approveDriver(token, id);
  } catch (error) {
    return { error: errorMessage(error) };
  }

  afterMutation(id);
}

export async function rejectDriverAction(
  id: string,
  _prevState: DriverActionState,
  formData: FormData,
): Promise<DriverActionState> {
  const reason = String(formData.get('reason') ?? '').trim();
  if (!reason) {
    return { error: 'Enter a reason for rejecting this application.' };
  }
  if (reason.length > REASON_MAX_LENGTH) {
    return {
      error: `Reason must be ${REASON_MAX_LENGTH} characters or fewer.`,
    };
  }

  const token = await getAccessToken();
  if (!token) redirect('/signin');

  try {
    await rejectDriver(token, id, reason);
  } catch (error) {
    return { error: errorMessage(error) };
  }

  afterMutation(id);
}
