import { render, screen } from '@testing-library/react';
import { Banknote } from 'lucide-react';
import { ValueProp } from './value-prop';

const props = {
  icon: Banknote,
  tone: 'success' as const,
  title: 'Guaranteed Payments',
  description: 'Instant MoMo settlements upon delivery confirmation.',
};

it('renders the title and description', () => {
  render(<ValueProp {...props} />);
  expect(screen.getByText('Guaranteed Payments')).toBeInTheDocument();
  expect(
    screen.getByText('Instant MoMo settlements upon delivery confirmation.'),
  ).toBeInTheDocument();
});

it('hides the decorative icon from assistive tech', () => {
  const { container } = render(<ValueProp {...props} />);
  const icon = container.querySelector('svg');
  expect(icon).toHaveAttribute('aria-hidden', 'true');
});
