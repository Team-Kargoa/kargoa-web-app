import { render, screen } from '@testing-library/react';
import { BottomNav } from './bottom-nav';

it('renders Registration, Support and Help links with visible labels', () => {
  render(<BottomNav />);

  expect(screen.getByRole('link', { name: 'Registration' })).toHaveAttribute(
    'href',
    '/register',
  );
  expect(screen.getByRole('link', { name: 'Support' })).toHaveAttribute(
    'href',
    '/support',
  );
  expect(screen.getByRole('link', { name: 'Help' })).toHaveAttribute(
    'href',
    '/help',
  );
});
