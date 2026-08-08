/**
 * Single place to read and parse environment-derived configuration. Every
 * value has a sensible default so the app runs with no `.env` present at
 * all — see `.env.example` at the repo root for the full list with
 * comments on which are public (`NEXT_PUBLIC_*`, inlined into the browser
 * bundle) versus server-only.
 *
 * Two groups of values here must stay in sync with the Kargoa-backend repo
 * (Team-Kargoa/Kargoa-backend) — if the backend changes them, update the
 * defaults below (and `.env.example`) to match:
 *
 *   - SESSION_ACCESS_MAX_AGE mirrors SIMPLE_JWT.ACCESS_TOKEN_LIFETIME =
 *     15 min, config/settings/base.py:116
 *   - SESSION_REFRESH_MAX_AGE mirrors REFRESH_TTL = 30 days,
 *     apps/accounts/services/token.py:10
 *   - OTP_RATE_LIMIT / OTP_RATE_WINDOW_MINUTES mirror RATE_LIMIT = 3 and
 *     RATE_WINDOW_SECONDS = 600, apps/accounts/services/otp.py
 */

/**
 * Parses a numeric env var, falling back when the value is missing or not
 * a valid number — a non-numeric value (e.g. a typo in `.env`) must never
 * let NaN reach a cookie max-age or rate-limit display.
 */
function parseIntEnv(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export const API_URL_DEFAULT = 'http://localhost:8000/api/v1';

/**
 * Deliberately a function, not a frozen constant: lib/api/client.ts reads
 * this at call time (not module load), which client.test.ts relies on to
 * exercise different NEXT_PUBLIC_API_URL values across tests.
 */
export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? API_URL_DEFAULT;
}

/** Public — rendered as a mailto link on app/contact/page.tsx. */
export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'engineering@kmercargo.cm';

/**
 * Server-only (no NEXT_PUBLIC_ prefix): read by lib/session.ts and
 * middleware.ts to set httpOnly cookie max-ages. Never sent to the
 * browser bundle.
 */
export const SESSION_ACCESS_MAX_AGE = parseIntEnv(
  process.env.SESSION_ACCESS_MAX_AGE,
  60 * 15,
);
export const SESSION_REFRESH_MAX_AGE = parseIntEnv(
  process.env.SESSION_REFRESH_MAX_AGE,
  60 * 60 * 24 * 30,
);

/**
 * Public — used only in the OTP 429 rate-limit copy shown to the visitor
 * (app/(auth)/actions.ts). Not a secret; the backend enforces the actual
 * limit server-side regardless of what the client displays.
 */
export const OTP_RATE_LIMIT = parseIntEnv(
  process.env.NEXT_PUBLIC_OTP_RATE_LIMIT,
  3,
);
export const OTP_RATE_WINDOW_MINUTES = parseIntEnv(
  process.env.NEXT_PUBLIC_OTP_RATE_WINDOW_MINUTES,
  10,
);
