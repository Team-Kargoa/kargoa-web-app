import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
import AdminLayout from './layout';
import { getCurrentUser } from '@/lib/current-user';
import type { UserSummary } from '@/lib/api/types';

// Blocking finding 1 (final whole-branch review): app/admin/layout.tsx
// called getCurrentUser() only to render the header — it never redirected,
// so an anonymous visitor got the whole admin console, and a signed-in
// fleet_owner (a valid token, just the wrong role) sailed past every
// `if (!token) redirect('/signin')` check on the admin subpages and could
// reach approve/reject/platform-config actions. This is the route gate.
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/admin'),
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));
jest.mock('@/lib/current-user');

const mockedRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>;

function makeUser(overrides: Partial<UserSummary> = {}): UserSummary {
  return {
    id: 'user-1',
    phone_number: '+237691234567',
    role: 'admin',
    full_name: 'Admin Office',
    profile_photo: null,
    is_active: true,
    date_joined: '2026-01-01',
    ...overrides,
  };
}

describe('AdminLayout route gate', () => {
  beforeEach(() => jest.clearAllMocks());

  it('redirects an anonymous visitor (no session) to /signin without rendering the console', async () => {
    mockedGetCurrentUser.mockResolvedValue(null);

    await expect(AdminLayout({ children: <div>secret</div> })).rejects.toThrow(
      'NEXT_REDIRECT',
    );

    expect(mockedRedirect).toHaveBeenCalledWith('/signin');
  });

  it('redirects a signed-in fleet_owner to /fleet — a valid token is not enough, the role must be admin', async () => {
    mockedGetCurrentUser.mockResolvedValue(makeUser({ role: 'fleet_owner' }));

    await expect(AdminLayout({ children: <div>secret</div> })).rejects.toThrow(
      'NEXT_REDIRECT',
    );

    expect(mockedRedirect).toHaveBeenCalledWith('/fleet');
  });

  it('renders the console for a signed-in admin', async () => {
    mockedGetCurrentUser.mockResolvedValue(makeUser({ role: 'admin' }));

    render(await AdminLayout({ children: <div>secret content</div> }));

    expect(mockedRedirect).not.toHaveBeenCalled();
    expect(screen.getByText('secret content')).toBeInTheDocument();
  });
});
