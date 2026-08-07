import { render, screen } from '@testing-library/react';

import Footer from './Footer';

describe('Footer', () => {
  it('renders the KmerCargo wordmark and copyright notice', () => {
    render(<Footer />);

    expect(screen.getByText('KmerCargo')).toBeInTheDocument();
    expect(
      screen.getByText(
        `© ${new Date().getFullYear()} KmerCargo Logistics Ecosystem. All rights reserved.`,
      ),
    ).toBeInTheDocument();
  });

  it.each([
    ['Terms of Service', '/terms'],
    ['Privacy Policy', '/privacy'],
    ['Contact Support', '/contact'],
  ])('links %s to %s', (label, href) => {
    render(<Footer />);

    expect(screen.getByRole('link', { name: label })).toHaveAttribute(
      'href',
      href,
    );
  });
});
