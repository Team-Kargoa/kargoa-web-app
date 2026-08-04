import { render, screen } from '@testing-library/react';
import HomePage from './page';

describe('landing page', () => {
  it('renders the hero headline and eyebrow', () => {
    render(<HomePage />);
    expect(screen.getByText('RELIABLE LOGISTICS')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Move Anything in Cameroon' }),
    ).toBeInTheDocument();
  });

  it('offers both role entry points', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', { name: 'Admin Portal' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Fleet Partner' }),
    ).toBeInTheDocument();
  });

  it('lists the three value propositions', () => {
    render(<HomePage />);
    expect(screen.getByText('Guaranteed Payments')).toBeInTheDocument();
    expect(screen.getByText('Optimal Routing')).toBeInTheDocument();
    expect(screen.getByText('Verified Cargo')).toBeInTheDocument();
  });

  it('closes with the scale call to action', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', { name: 'Ready to Scale?' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Get Started Now' }),
    ).toBeInTheDocument();
  });
});
