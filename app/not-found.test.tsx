import { render, screen } from '@testing-library/react';
import NotFound from './not-found';

// Non-blocking finding (final whole-branch review): there was no
// app/not-found.tsx, so app/admin/drivers/[id]/page.tsx's correct
// notFound() call had nowhere on-brand to render — a 404 fell through to
// Next's raw error screen instead.
describe('NotFound', () => {
  it('renders an on-brand heading explaining the page is missing', () => {
    render(<NotFound />);
    expect(
      screen.getByRole('heading', { name: /page not found/i }),
    ).toBeInTheDocument();
  });

  it('links back to the home page', () => {
    render(<NotFound />);
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('hides its decorative icon from assistive tech', () => {
    render(<NotFound />);
    const icon = document.querySelector('svg[aria-hidden="true"]');
    expect(icon).not.toBeNull();
  });
});
