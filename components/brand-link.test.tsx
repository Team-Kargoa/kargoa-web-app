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
});
