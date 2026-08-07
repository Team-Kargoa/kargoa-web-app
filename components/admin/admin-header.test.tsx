import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { AdminHeader } from './admin-header';
import { signOut } from '@/app/(auth)/actions';
import { SidebarProvider } from '@/components/ui/sidebar';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));
jest.mock('@/app/(auth)/actions', () => ({
  signOut: jest.fn(async () => {}),
}));

const mockUsePathname = usePathname as jest.Mock;
const mockedSignOut = signOut as jest.Mock;

function renderHeader() {
  return render(
    <SidebarProvider>
      <AdminHeader />
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
