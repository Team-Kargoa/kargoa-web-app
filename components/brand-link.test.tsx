import { render, screen } from '@testing-library/react';
import { BrandLink } from './brand-link';

describe('BrandLink', () => {
  it('renders the KmerCargo wordmark linking to the landing page', () => {
    render(<BrandLink />);
    const link = screen.getByRole('link', { name: 'KmerCargo' });
    expect(link).toHaveAttribute('href', '/');
    expect(link).toHaveTextContent('KmerCargo');
  });

  it('renders the truck icon as decorative, beside the wordmark', () => {
    render(<BrandLink />);
    const link = screen.getByRole('link', { name: 'KmerCargo' });
    const icon = link.querySelector('svg');
    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('merges an optional className onto the link for host-specific styling', () => {
    render(<BrandLink className="text-primary" />);
    expect(screen.getByRole('link', { name: 'KmerCargo' })).toHaveClass(
      'text-primary',
    );
  });

  it('still renders the default layout classes alongside a custom className', () => {
    render(<BrandLink className="text-primary" />);
    expect(screen.getByRole('link', { name: 'KmerCargo' })).toHaveClass(
      'flex',
      'items-center',
    );
  });

  describe('size variants', () => {
    it('defaults to md — the h-6 icon and text-2xl wordmark Navbar always used', () => {
      render(<BrandLink />);
      const icon = screen
        .getByRole('link', { name: 'KmerCargo' })
        .querySelector('svg');
      expect(icon).toHaveClass('h-6', 'w-6');
      expect(screen.getByText('KmerCargo')).toHaveClass('text-2xl');
    });

    it('sm renders a smaller icon and wordmark, for tight headers like the fleet sidebar', () => {
      render(<BrandLink size="sm" />);
      const icon = screen
        .getByRole('link', { name: 'KmerCargo' })
        .querySelector('svg');
      expect(icon).toHaveClass('h-5', 'w-5');
      expect(screen.getByText('KmerCargo')).toHaveClass('text-xl');
    });

    it('lg renders a bigger icon and a more compact wordmark, matching the original fleet-registration and verify headers', () => {
      render(<BrandLink size="lg" />);
      const icon = screen
        .getByRole('link', { name: 'KmerCargo' })
        .querySelector('svg');
      expect(icon).toHaveClass('h-7', 'w-7');
      expect(screen.getByText('KmerCargo')).toHaveClass('text-lg');
    });

    it('applies a genuinely distinct icon class per variant, not the same size three times', () => {
      const iconClasses = (['sm', 'md', 'lg'] as const).map((size) => {
        const { unmount, container } = render(<BrandLink size={size} />);
        const cls = container.querySelector('svg')?.getAttribute('class') ?? '';
        unmount();
        return cls;
      });
      expect(new Set(iconClasses).size).toBe(3);
    });

    it('applies a genuinely distinct wordmark class per variant, not the same size three times', () => {
      const textClasses = (['sm', 'md', 'lg'] as const).map((size) => {
        const { unmount } = render(<BrandLink size={size} />);
        const cls = screen.getByText('KmerCargo').getAttribute('class') ?? '';
        unmount();
        return cls;
      });
      expect(new Set(textClasses).size).toBe(3);
    });
  });
});
