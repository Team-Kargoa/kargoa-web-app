import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
import FleetLayout from './layout';
import { getCurrentUser } from '@/lib/current-user';
import type { UserSummary } from '@/lib/api/types';

// Blocking finding 2 (final whole-branch review): app/fleet/layout.tsx had
// no auth logic at all, and all three /fleet pages coerced a missing token
// to '' with `?? ''`, so a 401 from the missing token silently fell back
// to fixtures via withFallback — an anonymous visitor saw a complete fleet
// dashboard with fabricated wallet balances, revenue and driver rosters,
// with nothing telling them they were signed out. This is the route gate.
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/fleet'),
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));
jest.mock('@/lib/current-user');
jest.mock('@/app/(auth)/actions', () => ({
  signOut: jest.fn(async () => {}),
}));

const mockedRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>;

function makeUser(overrides: Partial<UserSummary> = {}): UserSummary {
  return {
    id: 'user-1',
    phone_number: '+237691234567',
    role: 'fleet_owner',
    full_name: 'Fleet Owner',
    profile_photo: null,
    is_active: true,
    date_joined: '2026-01-01',
    ...overrides,
  };
}

describe('FleetLayout route gate', () => {
  beforeEach(() => jest.clearAllMocks());

  it('redirects an anonymous visitor (no session) to /signin without rendering the dashboard', async () => {
    mockedGetCurrentUser.mockResolvedValue(null);

    await expect(
      FleetLayout({ children: <div>fleet secret</div> }),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(mockedRedirect).toHaveBeenCalledWith('/signin');
  });

  it('redirects a signed-in admin to /admin — a valid token is not enough, the role must be fleet_owner', async () => {
    mockedGetCurrentUser.mockResolvedValue(makeUser({ role: 'admin' }));

    await expect(
      FleetLayout({ children: <div>fleet secret</div> }),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(mockedRedirect).toHaveBeenCalledWith('/admin');
  });

  it('renders the dashboard for a signed-in fleet_owner', async () => {
    mockedGetCurrentUser.mockResolvedValue(makeUser({ role: 'fleet_owner' }));

    render(await FleetLayout({ children: <div>fleet content</div> }));

    expect(mockedRedirect).not.toHaveBeenCalled();
    expect(screen.getByText('fleet content')).toBeInTheDocument();
  });

  // Issue 4: the resolved user must be threaded into the header, exactly
  // as app/admin/layout.tsx already does for AdminHeader — otherwise the
  // header can't tell a real signed-in fleet owner apart from the
  // hardcoded "Admin Profile" placeholder it used to render.
  it('passes the signed-in fleet owner down to the FleetHeader', async () => {
    mockedGetCurrentUser.mockResolvedValue(
      makeUser({ role: 'fleet_owner', full_name: 'Ama Owusu' }),
    );

    render(await FleetLayout({ children: <div>fleet content</div> }));

    expect(screen.getByText('Ama Owusu')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Fleet Operations' }),
    ).toBeInTheDocument();
    // FleetNav also renders sign-out controls (mobile header, desktop
    // sidebar footer) — this just proves FleetHeader's own control is
    // among them, not that it's the only one in the tree.
    expect(
      screen.getAllByRole('button', { name: /sign out/i }).length,
    ).toBeGreaterThanOrEqual(1);
  });
});
