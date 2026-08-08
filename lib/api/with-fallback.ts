/**
 * Shared "try the real endpoint, fall back to the fixture" helper.
 *
 * The default behaviour across every fixture-backed lib/api module used to
 * be: never call the real endpoint at all, guarded by a tripwire test. That
 * was correct while the backend had no routes, but it means every new
 * endpoint needs a manual rewrite and can sit unused indefinitely once the
 * backend ships it. This inverts the default: attempt the live call first,
 * and use its result once it actually exists.
 */

export type Sourced<T> = { data: T; isSample: boolean };

function defaultIsEmpty<T>(value: T): boolean {
  return Array.isArray(value) && value.length === 0;
}

/**
 * Calls `live()`. Returns its result (isSample: false) when it resolves to
 * a non-empty value. Falls back to `fixture` (isSample: true) when `live()`
 * throws — for any reason: a missing endpoint (404), an unimplemented one
 * (501), the backend being down (ApiError with status 0), or anything
 * else — or when the resolved value is empty per `options.isEmpty` (or the
 * default array-length-0 check).
 *
 * Never throws: a fallback that can itself fail defeats the point of a
 * fallback.
 */
export async function withFallback<T>(
  live: () => Promise<T>,
  fixture: T,
  options?: { isEmpty?: (value: T) => boolean },
): Promise<Sourced<T>> {
  const isEmpty = options?.isEmpty ?? defaultIsEmpty;

  try {
    const data = await live();
    if (isEmpty(data)) {
      return { data: fixture, isSample: true };
    }
    return { data, isSample: false };
  } catch {
    return { data: fixture, isSample: true };
  }
}
