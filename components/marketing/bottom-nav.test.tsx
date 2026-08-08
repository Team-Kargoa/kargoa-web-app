import { render, screen } from '@testing-library/react';
import { BottomNav } from './bottom-nav';

it('renders Registration, Support and Help links with visible labels', () => {
  render(<BottomNav />);

  expect(screen.getByRole('link', { name: 'Registration' })).toHaveAttribute(
    'href',
    '/register',
  );
  // /support does not exist on disk; Navbar.tsx already points its own
  // "Support" link at /contact for the same reason (see
  // "feat: add placeholder Help page, point navbar Support at /contact").
  expect(screen.getByRole('link', { name: 'Support' })).toHaveAttribute(
    'href',
    '/contact',
  );
  expect(screen.getByRole('link', { name: 'Help' })).toHaveAttribute(
    'href',
    '/help',
  );
});
