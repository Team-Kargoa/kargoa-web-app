import { render, screen } from '@testing-library/react';
import { SampleDataBadge } from './sample-data-badge';

describe('SampleDataBadge', () => {
  it('renders visible "Sample data" text', () => {
    render(<SampleDataBadge />);
    expect(screen.getByText('Sample data')).toBeInTheDocument();
  });

  it('renders a brief explanation as real visible text, not a tooltip or title attribute', () => {
    render(<SampleDataBadge />);
    const explanation = screen.getByText(/no backend data yet/i);
    expect(explanation).toBeInTheDocument();
    expect(explanation).not.toHaveAttribute('title');
    const badge = screen.getByTestId('sample-data-badge');
    expect(badge).not.toHaveAttribute('title');
  });

  it('marks its decorative icon aria-hidden', () => {
    const { container } = render(<SampleDataBadge />);
    const icon = container.querySelector('svg');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('uses design token classes, not raw hex colors', () => {
    render(<SampleDataBadge />);
    const badge = screen.getByTestId('sample-data-badge');
    expect(badge.className).not.toMatch(/#[0-9a-fA-F]{3,6}/);
    expect(badge.className).toMatch(/border-border/);
  });
});
