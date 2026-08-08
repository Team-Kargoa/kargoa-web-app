import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { updatePlatformConfigAction } from './actions';
import { getAccessToken } from '@/lib/session';
import { updatePlatformConfig } from '@/lib/api/admin';
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
const mockedUpdatePlatformConfig = updatePlatformConfig as jest.MockedFunction<
  typeof updatePlatformConfig
>;

function formDataWith(value: string): FormData {
  const data = new FormData();
  data.set('value', value);
  return data;
}

describe('updatePlatformConfigAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetAccessToken.mockResolvedValue('jwt-abc');
    mockedUpdatePlatformConfig.mockResolvedValue(undefined);
  });

  it('rejects a value over 255 characters without touching the session or the API', async () => {
    const result = await updatePlatformConfigAction(
      'max_active_trips',
      { error: null },
      formDataWith('x'.repeat(256)),
    );

    expect(result).toEqual({
      error: 'Value must be 255 characters or fewer.',
    });
    expect(mockedGetAccessToken).not.toHaveBeenCalled();
    expect(mockedUpdatePlatformConfig).not.toHaveBeenCalled();
  });

  it('treats a submission with no value field as an empty string rather than throwing', async () => {
    // formData.get('value') returns null (not '') when the field was never
    // set — exercises the `?? ''` fallback that normalizes that null before
    // the length check and the update call run.
    const result = await updatePlatformConfigAction(
      'max_active_trips',
      { error: null },
      new FormData(),
    );

    expect(mockedUpdatePlatformConfig).toHaveBeenCalledWith(
      'jwt-abc',
      'max_active_trips',
      '',
    );
    expect(result).toEqual({ error: null });
  });

  it('redirects to /signin without updating when there is no session token', async () => {
    mockedGetAccessToken.mockResolvedValue(undefined);

    await expect(
      updatePlatformConfigAction(
        'max_active_trips',
        { error: null },
        formDataWith('7'),
      ),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(mockedRedirect).toHaveBeenCalledWith('/signin');
    expect(mockedUpdatePlatformConfig).not.toHaveBeenCalled();
  });

  it('updates with the token, key and value as a string, then revalidates the settings page', async () => {
    const result = await updatePlatformConfigAction(
      'max_active_trips',
      { error: null },
      formDataWith('7'),
    );

    expect(mockedUpdatePlatformConfig).toHaveBeenCalledWith(
      'jwt-abc',
      'max_active_trips',
      '7',
    );
    expect(mockedRevalidatePath).toHaveBeenCalledWith('/admin/settings');
    expect(result).toEqual({ error: null });
    expect(mockedRedirect).not.toHaveBeenCalled();
  });

  it('surfaces the API error message and does not revalidate on failure', async () => {
    mockedUpdatePlatformConfig.mockRejectedValue(
      new ApiError('Validation failed.', 422),
    );

    const result = await updatePlatformConfigAction(
      'max_active_trips',
      { error: null },
      formDataWith('not-a-number'),
    );

    expect(result).toEqual({ error: 'Validation failed.' });
    expect(mockedRevalidatePath).not.toHaveBeenCalled();
  });

  it('falls back to a generic message for a non-ApiError failure', async () => {
    mockedUpdatePlatformConfig.mockRejectedValue(new Error('boom'));

    const result = await updatePlatformConfigAction(
      'max_active_trips',
      { error: null },
      formDataWith('7'),
    );

    expect(result).toEqual({
      error: 'Something went wrong. Please try again.',
    });
  });
});
