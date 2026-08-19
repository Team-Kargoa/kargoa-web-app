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

  it('sends every call to action to its intended destination', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('link', { name: /Access Dashboard/ }),
    ).toHaveAttribute('href', '/signin');
    expect(
      screen.getByRole('link', { name: /Join the Fleet/ }),
    ).toHaveAttribute('href', '/register/fleet');
    expect(
      screen.getByRole('link', { name: 'Get Started Now' }),
    ).toHaveAttribute('href', '/register');
  });

  it('does not render a network map button — no such feature exists', () => {
    render(<HomePage />);
    expect(
      screen.queryByRole('link', { name: /network map/i }),
    ).not.toBeInTheDocument();
  });

  it('renders the site footer with its link routing intact', () => {
    render(<HomePage />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Terms of Service' }),
    ).toHaveAttribute('href', '/terms');
    expect(
      screen.getByRole('link', { name: 'Privacy Policy' }),
    ).toHaveAttribute('href', '/privacy');
    expect(
      screen.getByRole('link', { name: 'Contact Support' }),
    ).toHaveAttribute('href', '/contact');
  });
});
