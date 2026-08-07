import { withFallback } from './with-fallback';
import { ApiError } from './client';

describe('withFallback', () => {
  it('returns live data with isSample: false when the live call resolves with a non-empty value', async () => {
    const live = jest.fn().mockResolvedValue({ id: 'real-1' });

    await expect(
      withFallback(live, { id: 'fixture-1' }),
    ).resolves.toEqual({ data: { id: 'real-1' }, isSample: false });
  });

  it('returns the fixture with isSample: true when the live call throws a 404 ApiError', async () => {
    const live = jest.fn().mockRejectedValue(new ApiError('Not found.', 404));

    await expect(
      withFallback(live, { id: 'fixture-1' }),
    ).resolves.toEqual({ data: { id: 'fixture-1' }, isSample: true });
  });

  it('returns the fixture with isSample: true when the live call throws a 501 ApiError', async () => {
    const live = jest
      .fn()
      .mockRejectedValue(new ApiError('Not implemented.', 501));

    await expect(
      withFallback(live, { id: 'fixture-1' }),
    ).resolves.toEqual({ data: { id: 'fixture-1' }, isSample: true });
  });

  it('returns the fixture with isSample: true when the live call throws an ApiError with status 0 (backend unreachable)', async () => {
    const live = jest
      .fn()
      .mockRejectedValue(
        new ApiError('Unable to reach the server. Check your connection.', 0),
      );

    await expect(
      withFallback(live, { id: 'fixture-1' }),
    ).resolves.toEqual({ data: { id: 'fixture-1' }, isSample: true });
  });

  it('returns the fixture with isSample: true when the live call throws a non-ApiError', async () => {
    const live = jest.fn().mockRejectedValue(new TypeError('boom'));

    await expect(
      withFallback(live, { id: 'fixture-1' }),
    ).resolves.toEqual({ data: { id: 'fixture-1' }, isSample: true });
  });

  it('never throws — a rejected live() with no isEmpty option must still resolve', async () => {
    const live = jest.fn().mockRejectedValue(new Error('boom'));

    await expect(withFallback(live, 'fixture')).resolves.not.toThrow();
  });

  it('defaults emptiness to an array with length 0 when no isEmpty option is given', async () => {
    const live = jest.fn().mockResolvedValue([]);

    await expect(withFallback(live, ['fixture-item'])).resolves.toEqual({
      data: ['fixture-item'],
      isSample: true,
    });
  });

  it('treats a non-empty array from live() as real data by default', async () => {
    const live = jest.fn().mockResolvedValue(['real-item']);

    await expect(withFallback(live, ['fixture-item'])).resolves.toEqual({
      data: ['real-item'],
      isSample: false,
    });
  });

  it('never treats a non-array resolved value as empty when no isEmpty option is given', async () => {
    const live = jest.fn().mockResolvedValue({});

    await expect(withFallback(live, { id: 'fixture-1' })).resolves.toEqual({
      data: {},
      isSample: false,
    });
  });

  it('uses the isEmpty option to decide the fixture should be used instead', async () => {
    const live = jest.fn().mockResolvedValue({ logs: [] });
    const isEmpty = (value: { logs: unknown[] }) => value.logs.length === 0;

    await expect(
      withFallback(live, { logs: ['fixture-log'] }, { isEmpty }),
    ).resolves.toEqual({ data: { logs: ['fixture-log'] }, isSample: true });
  });

  it('uses the isEmpty option to accept a live value that is not empty', async () => {
    const live = jest.fn().mockResolvedValue({ logs: ['real-log'] });
    const isEmpty = (value: { logs: unknown[] }) => value.logs.length === 0;

    await expect(
      withFallback(live, { logs: ['fixture-log'] }, { isEmpty }),
    ).resolves.toEqual({ data: { logs: ['real-log'] }, isSample: false });
  });
});
