import { render, screen } from '@testing-library/react';
import { Truck } from 'lucide-react';
import { RoleCard } from './role-card';

const props = {
  eyebrow: 'PARTNERS',
  icon: Truck,
  title: 'Fleet Partner',
  description: 'Register your trucks.',
  ctaLabel: 'Join the Fleet',
  ctaHref: '/register/fleet',
  tone: 'amber' as const,
};

it('renders the eyebrow, title and description', () => {
  render(<RoleCard {...props} />);
  expect(screen.getByText('PARTNERS')).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: 'Fleet Partner' }),
  ).toBeInTheDocument();
  expect(screen.getByText('Register your trucks.')).toBeInTheDocument();
});

it('links the call to action', () => {
  render(<RoleCard {...props} />);
  expect(screen.getByRole('link', { name: /Join the Fleet/ })).toHaveAttribute(
    'href',
    '/register/fleet',
  );
});

it('applies the light tone when asked', () => {
  const { container } = render(<RoleCard {...props} tone="light" />);
  expect(container.firstChild).toHaveClass('bg-white');
});
