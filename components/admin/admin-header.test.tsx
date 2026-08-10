import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePathname } from 'next/navigation';
import { AdminHeader } from './admin-header';
import { signOut } from '@/app/(auth)/actions';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { UserSummary } from '@/lib/api/types';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));
jest.mock('@/app/(auth)/actions', () => ({
  signOut: jest.fn(async () => {}),
}));

const mockUsePathname = usePathname as jest.Mock;
const mockedSignOut = signOut as jest.Mock;

function makeUser(overrides: Partial<UserSummary> = {}): UserSummary {
  return {
    id: 'admin-1',
    phone_number: '+237674628817',
    role: 'admin',
    full_name: 'Admin Office',
    profile_photo: null,
    is_active: true,
    date_joined: '2026-01-01',
    ...overrides,
  };
}

function renderHeader(
  user: UserSummary | null = makeUser(),
  pendingDriverApprovals = 0,
) {
  return render(
    <SidebarProvider>
      <AdminHeader
        user={user}
        pendingDriverApprovals={pendingDriverApprovals}
      />
    </SidebarProvider>,
  );
}

describe('AdminHeader sign out', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/admin');
    jest.clearAllMocks();
  });

  // Deleting a JSX element loses no branch, so coverage alone can't catch
  // a vanished control — assert directly that it renders, exactly once
  // (not a stray duplicate left over from the old inert dropdown item).
  it('renders exactly one visible "Sign out" control beside the admin identity block', () => {
    renderHeader();
    expect(
      screen.getByRole('button', { name: /sign out/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Sign out')).toHaveLength(1);
  });

  it('submits the signOut server action when the control is activated', async () => {
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
    await waitFor(() => expect(mockedSignOut).toHaveBeenCalled());
  });

  it('pairs the sign-out icon with a visible text label and marks the icon decorative', () => {
    renderHeader();
    const button = screen.getByRole('button', { name: /sign out/i });
    expect(button).toHaveTextContent('Sign out');
    const icon = button.querySelector('svg');
    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('uses rounded-xl on the sign-out button', () => {
    renderHeader();
    const button = screen.getByRole('button', { name: /sign out/i });
    expect(button.className).toMatch(/rounded-xl/);
  });
});

// Regression coverage for the leftover admin@kmercargo.com placeholder:
// the identity block must reflect whoever app/admin/layout.tsx resolved
// via lib/current-user.ts and passed down, never a hardcoded stand-in.
describe('AdminHeader admin identity', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/admin');
    jest.clearAllMocks();
  });

  it("shows the signed-in admin's full name when present", () => {
    renderHeader(makeUser({ full_name: 'Ngozi Fon' }));
    expect(screen.getByText('Ngozi Fon')).toBeInTheDocument();
    expect(screen.queryByText('admin@kmercargo.com')).not.toBeInTheDocument();
  });

  it('falls back to the formatted phone number, in font-mono, when full_name is empty', () => {
    renderHeader(makeUser({ full_name: '', phone_number: '+237674628817' }));
    const phoneEl = screen.getByText('+237 6 74 62 88 17');
    expect(phoneEl).toBeInTheDocument();
    expect(phoneEl.className).toMatch(/font-mono/);
  });

  it('falls back to the formatted phone number when full_name is only whitespace', () => {
    renderHeader(makeUser({ full_name: '   ', phone_number: '+237674628817' }));
    expect(screen.getByText('+237 6 74 62 88 17')).toBeInTheDocument();
  });

  it('handles a signed-out (null) user without crashing', () => {
    renderHeader(null);
    expect(screen.getByText('Signed out')).toBeInTheDocument();
  });
});

// Regression coverage for the hardcoded "4 drivers need approval" /
// "Two disputes were opened today." notification content: neither had any
// data behind it. The driver count is now real (passed down from
// app/admin/layout.tsx's listDriverApplications call); the disputes line
// has no backend at all (apps.disputes is still an empty stub), so it
// keeps the same SampleDataBadge honesty marker every other
// fixture-backed section of this app already uses.
describe('AdminHeader notifications', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/admin');
  });

  // Radix's DropdownMenuTrigger opens on pointerdown, not a plain click —
  // fireEvent.click alone never opens it under jsdom. userEvent.click
  // dispatches the full realistic pointer/mouse event sequence a real
  // browser would, which Radix's internal handling actually responds to.
  async function openNotifications() {
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /notifications/i }));
  }

  it('shows the real pending-driver-approval count, not a hardcoded number', async () => {
    renderHeader(makeUser(), 7);
    await openNotifications();
    expect(screen.getByText('7 drivers need approval')).toBeInTheDocument();
  });

  it('uses singular phrasing for exactly one pending approval', async () => {
    renderHeader(makeUser(), 1);
    await openNotifications();
    expect(screen.getByText('1 driver needs approval')).toBeInTheDocument();
  });

  it('links the pending-approvals notification to the filtered driver queue', async () => {
    renderHeader(makeUser(), 3);
    await openNotifications();
    expect(
      screen.getByRole('link', { name: /drivers need approval/i }),
    ).toHaveAttribute('href', '/admin/drivers?status=pending');
  });

  it('marks the disputes line as sample data — apps.disputes has no backend', async () => {
    renderHeader(makeUser(), 0);
    await openNotifications();
    expect(
      screen.getByText('Two disputes were opened today.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('sample-data-badge')).toBeInTheDocument();
  });
});
