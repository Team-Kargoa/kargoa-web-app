import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FleetHeader } from './fleet-header';
import { signOut } from '@/app/(auth)/actions';
import type { UserSummary } from '@/lib/api/types';

jest.mock('@/app/(auth)/actions', () => ({
  signOut: jest.fn(async () => {}),
}));

const mockedSignOut = signOut as jest.Mock;

function makeUser(overrides: Partial<UserSummary> = {}): UserSummary {
  return {
    id: 'user-1',
    phone_number: '+237674628817',
    role: 'fleet_owner',
    full_name: 'Ama Owusu',
    profile_photo: null,
    is_active: true,
    date_joined: '2026-01-01',
    ...overrides,
  };
}

describe('FleetHeader', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the Fleet Operations title', () => {
    render(<FleetHeader user={makeUser()} />);
    expect(
      screen.getByRole('heading', { name: 'Fleet Operations' }),
    ).toBeInTheDocument();
  });

  // Regression coverage for the leftover "AU" / "Admin Profile" /
  // "Logistics Ops" chip hardcoded for a real signed-in fleet owner —
  // deleting a JSX element loses no branch, so coverage alone can't
  // catch it vanishing again. Must assert the real user renders and the
  // placeholder is gone.
  describe('signed-in identity', () => {
    it("shows the signed-in fleet owner's full name when present", () => {
      render(<FleetHeader user={makeUser({ full_name: 'Ama Owusu' })} />);
      expect(screen.getByText('Ama Owusu')).toBeInTheDocument();
      expect(screen.queryByText('Admin Profile')).not.toBeInTheDocument();
      expect(screen.queryByText('Logistics Ops')).not.toBeInTheDocument();
      expect(screen.queryByText('AU')).not.toBeInTheDocument();
    });

    it('shows the initials derived from the name in the avatar', () => {
      render(<FleetHeader user={makeUser({ full_name: 'Ama Owusu' })} />);
      expect(screen.getByText('AO')).toBeInTheDocument();
    });

    it('falls back to the formatted phone number, in font-mono, when full_name is empty', () => {
      render(
        <FleetHeader
          user={makeUser({ full_name: '', phone_number: '+237674628817' })}
        />,
      );
      const phoneEl = screen.getByText('+237 6 74 62 88 17');
      expect(phoneEl).toBeInTheDocument();
      expect(phoneEl.className).toMatch(/font-mono/);
      expect(screen.queryByText('Admin Profile')).not.toBeInTheDocument();
    });

    it('falls back to the formatted phone number when full_name is only whitespace', () => {
      render(
        <FleetHeader
          user={makeUser({ full_name: '   ', phone_number: '+237674628817' })}
        />,
      );
      expect(screen.getByText('+237 6 74 62 88 17')).toBeInTheDocument();
    });

    it('renders the last two digits of the phone number as avatar initials when full_name is empty', () => {
      render(
        <FleetHeader
          user={makeUser({ full_name: '', phone_number: '+237674628817' })}
        />,
      );
      expect(screen.getByText('17')).toBeInTheDocument();
    });

    it('handles a signed-out (null) user without crashing', () => {
      render(<FleetHeader user={null} />);
      expect(screen.getByText('Signed out')).toBeInTheDocument();
    });
  });

  // Issue 3: sign-out was undiscoverable on desktop — buried at the
  // bottom of a full-height sidebar. It must now also be reachable from
  // the top-right of this header, beside the user identity.
  describe('sign out', () => {
    it('renders exactly one visible "Sign out" control beside the identity block', () => {
      render(<FleetHeader user={makeUser()} />);
      expect(
        screen.getByRole('button', { name: /sign out/i }),
      ).toBeInTheDocument();
      expect(screen.getAllByText('Sign out')).toHaveLength(1);
    });

    it('submits the signOut server action when activated', async () => {
      render(<FleetHeader user={makeUser()} />);
      fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
      await waitFor(() => expect(mockedSignOut).toHaveBeenCalled());
    });

    it('pairs the sign-out icon with a visible text label and marks the icon decorative', () => {
      render(<FleetHeader user={makeUser()} />);
      const button = screen.getByRole('button', { name: /sign out/i });
      expect(button).toHaveTextContent('Sign out');
      const icon = button.querySelector('svg');
      expect(icon).not.toBeNull();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('uses rounded-xl on the sign-out button', () => {
      render(<FleetHeader user={makeUser()} />);
      const button = screen.getByRole('button', { name: /sign out/i });
      expect(button.className).toMatch(/rounded-xl/);
    });
  });

  // Issue 4: the dead "Dashboard / Fleet / Reports" spans claimed
  // /fleet/drivers and /fleet/revenue "land in a later task" — they
  // exist now, and FleetNav already links to them. This header must not
  // duplicate that nav.
  it('does not duplicate FleetNav navigation items', () => {
    render(<FleetHeader user={makeUser()} />);
    expect(screen.queryByText('Fleet')).not.toBeInTheDocument();
    expect(screen.queryByText('Reports')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });
});
