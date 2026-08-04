import { render, screen } from '@testing-library/react';
import Navbar from './Navbar';

describe('Navbar', () => {
  it('renders the brand', () => {
    render(<Navbar />);
    expect(screen.getByText('KmerCargo')).toBeInTheDocument();
  });

  it.each([
    ['Registration', '/register'],
    ['Support', '/support'],
    ['Help', '/help'],
  ])('links %s to %s', (label, href) => {
    render(<Navbar />);
    expect(screen.getByRole('link', { name: label })).toHaveAttribute(
      'href',
      href,
    );
  });

  it('renders the primary call to action', () => {
    render(<Navbar />);
    expect(screen.getByRole('link', { name: 'Get Started' })).toHaveAttribute(
      'href',
      '/register',
    );
  });
});
