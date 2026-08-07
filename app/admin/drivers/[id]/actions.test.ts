import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { approveDriverAction, rejectDriverAction } from './actions';
import { getAccessToken } from '@/lib/session';
import { approveDriver, rejectDriver } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
jest.mock('@/lib/session');
jest.mock('@/lib/api/admin');

const mockedRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockedRevalidatePath = revalidatePath as jest.MockedFunction<
  typeof revalidatePath
>;
const mockedGetAccessToken = getAccessToken as jest.MockedFunction<
  typeof getAccessToken
>;
const mockedApproveDriver = approveDriver as jest.MockedFunction<
  typeof approveDriver
>;
const mockedRejectDriver = rejectDriver as jest.MockedFunction<
  typeof rejectDriver
>;

function formDataWith(reason?: string): FormData {
  const data = new FormData();
  if (reason !== undefined) data.set('reason', reason);
  return data;
}

describe('approveDriverAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetAccessToken.mockResolvedValue('jwt-abc');
    mockedApproveDriver.mockResolvedValue(undefined);
  });

  it('redirects to /signin without approving when there is no session token', async () => {
    mockedGetAccessToken.mockResolvedValue(undefined);

    await expect(
      approveDriverAction('drv-1', { error: null }, formDataWith()),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(mockedRedirect).toHaveBeenCalledWith('/signin');
    expect(mockedApproveDriver).not.toHaveBeenCalled();
  });

  it('approves with the session token, revalidates the queue and detail page, then redirects to the queue', async () => {
    await expect(
      approveDriverAction('drv-1', { error: null }, formDataWith()),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(mockedApproveDriver).toHaveBeenCalledWith('jwt-abc', 'drv-1');
    expect(mockedRevalidatePath).toHaveBeenCalledWith('/admin/drivers');
    expect(mockedRevalidatePath).toHaveBeenCalledWith(
      '/admin/drivers/drv-1',
    );
    expect(mockedRedirect).toHaveBeenCalledWith('/admin/drivers');
  });

  it('returns the API error message and does not redirect when approveDriver fails', async () => {
    mockedApproveDriver.mockRejectedValue(
      new ApiError('Application already approved.', 409),
    );

    const result = await approveDriverAction(
      'drv-1',
      { error: null },
      formDataWith(),
    );

    expect(result).toEqual({ error: 'Application already approved.' });
    expect(mockedRedirect).not.toHaveBeenCalled();
    expect(mockedRevalidatePath).not.toHaveBeenCalled();
  });

  it('falls back to a generic message for a non-ApiError failure', async () => {
    mockedApproveDriver.mockRejectedValue(new Error('boom'));

    const result = await approveDriverAction(
      'drv-1',
      { error: null },
      formDataWith(),
    );

    expect(result).toEqual({
      error: 'Something went wrong. Please try again.',
    });
  });
});

describe('rejectDriverAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetAccessToken.mockResolvedValue('jwt-abc');
    mockedRejectDriver.mockResolvedValue(undefined);
  });

  it('rejects a blank reason without calling the session or the API', async () => {
    const result = await rejectDriverAction(
      'drv-1',
      { error: null },
      formDataWith('   '),
    );

    expect(result).toEqual({
      error: 'Enter a reason for rejecting this application.',
    });
    expect(mockedGetAccessToken).not.toHaveBeenCalled();
    expect(mockedRejectDriver).not.toHaveBeenCalled();
  });

  it('rejects a reason over 500 characters without calling the API', async () => {
    const result = await rejectDriverAction(
      'drv-1',
      { error: null },
      formDataWith('x'.repeat(501)),
    );

    expect(result).toEqual({
      error: 'Reason must be 500 characters or fewer.',
    });
    expect(mockedRejectDriver).not.toHaveBeenCalled();
  });

  it('redirects to /signin without rejecting when there is no session token', async () => {
    mockedGetAccessToken.mockResolvedValue(undefined);

    await expect(
      rejectDriverAction('drv-1', { error: null }, formDataWith('Blurry documents')),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(mockedRedirect).toHaveBeenCalledWith('/signin');
    expect(mockedRejectDriver).not.toHaveBeenCalled();
  });

  it('rejects with the trimmed reason, revalidates, then redirects to the queue', async () => {
    await expect(
      rejectDriverAction(
        'drv-1',
        { error: null },
        formDataWith('  Blurry documents  '),
      ),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(mockedRejectDriver).toHaveBeenCalledWith(
      'jwt-abc',
      'drv-1',
      'Blurry documents',
    );
    expect(mockedRevalidatePath).toHaveBeenCalledWith('/admin/drivers');
    expect(mockedRevalidatePath).toHaveBeenCalledWith(
      '/admin/drivers/drv-1',
    );
    expect(mockedRedirect).toHaveBeenCalledWith('/admin/drivers');
  });

  it('surfaces the server 422 validation error and does not redirect', async () => {
    mockedRejectDriver.mockRejectedValue(
      new ApiError('Validation failed.', 422),
    );

    const result = await rejectDriverAction(
      'drv-1',
      { error: null },
      formDataWith('Blurry documents'),
    );

    expect(result).toEqual({ error: 'Validation failed.' });
    expect(mockedRedirect).not.toHaveBeenCalled();
    expect(mockedRevalidatePath).not.toHaveBeenCalled();
  });

  it('falls back to a generic message for a non-ApiError failure', async () => {
    mockedRejectDriver.mockRejectedValue(new Error('boom'));

    const result = await rejectDriverAction(
      'drv-1',
      { error: null },
      formDataWith('Blurry documents'),
    );

    expect(result).toEqual({
      error: 'Something went wrong. Please try again.',
    });
  });
});
