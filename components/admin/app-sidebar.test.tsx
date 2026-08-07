import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { AppSidebar } from './app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const mockUsePathname = usePathname as jest.Mock;

function renderSidebar() {
  return render(
    <SidebarProvider>
      <AppSidebar />
    </SidebarProvider>,
  );
}

describe('AppSidebar', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/admin');
  });

  it('renders the KmerCargo brand as a link back to the landing page, not the admin dashboard', () => {
    renderSidebar();
    expect(screen.getByRole('link', { name: /kmercargo/i })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('renders the shared Truck icon lockup, not the old "K" letter badge', () => {
    renderSidebar();
    const link = screen.getByRole('link', { name: /kmercargo/i });
    expect(link.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    expect(screen.queryByText('K', { exact: true })).not.toBeInTheDocument();
  });
});
