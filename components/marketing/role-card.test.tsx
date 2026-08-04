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

it('applies the secondary tone accent to the call to action', () => {
  render(<RoleCard {...props} tone="secondary" />);
  expect(screen.getByRole('link', { name: /Join the Fleet/ })).toHaveClass(
    'bg-secondary',
  );
});

it('applies the tertiary tone accent to the call to action', () => {
  render(<RoleCard {...props} tone="tertiary" />);
  expect(screen.getByRole('link', { name: /Join the Fleet/ })).toHaveClass(
    'bg-tertiary',
  );
});

it('renders a benefit list when provided', () => {
  render(
    <RoleCard
      {...props}
      benefits={['Multi-vehicle fleet dashboard', 'Fuel consumption analytics']}
    />,
  );
  expect(screen.getByRole('list')).toBeInTheDocument();
  expect(screen.getByText('Multi-vehicle fleet dashboard')).toBeInTheDocument();
  expect(screen.getByText('Fuel consumption analytics')).toBeInTheDocument();
});

it('omits the benefit list when not provided', () => {
  render(<RoleCard {...props} />);
  expect(screen.queryByRole('list')).not.toBeInTheDocument();
});
