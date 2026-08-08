import { cache } from 'react';
import { getAccessToken } from './session';
import { getProfile } from './api/auth';
import type { Role, UserSummary } from './api/types';

type PortalRole = Extract<Role, 'fleet_owner' | 'admin'>;

function isPortalRole(role: Role): role is PortalRole {
  return role === 'fleet_owner' || role === 'admin';
}

/**
 * Resolves the signed-in user for chrome that needs to reflect session
 * state (the navbar's identity button). The access token lives in an
 * httpOnly cookie that client JavaScript cannot read, so this must run on
 * the server — call it from a Server Component (app/layout.tsx) and pass
 * the result down as a prop to the Client Components that render it.
 *
 * An expired or invalid token makes getProfile throw an ApiError; that is
 * swallowed here and treated as signed out so a logged-out (or
 * stale-cookie) visitor never sees an error page because of it.
 *
 * Only fleet_owner and admin have a dashboard in this app. A token that
 * somehow resolves to a customer or driver is also treated as signed out
 * for navbar purposes — app/(auth)/actions.ts already refuses to create a
 * session for those roles; this is defence in depth.
 *
 * Wrapped in React's cache() so repeated calls within one render (e.g.
 * from both a layout and a page) don't re-hit the API.
 */
export const getCurrentUser = cache(async (): Promise<UserSummary | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const user = await getProfile(token);
    return isPortalRole(user.role) ? user : null;
  } catch {
    return null;
  }
});
